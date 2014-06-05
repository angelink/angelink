'use strict';

// ## Module Dependencies
var _ = require('lodash');
var Architect = require('neo4j-architect');
var db = require('../db');
var QueryBuilder = require('../neo4j-qb/qb.js');
var util = require('util');
var utils = require('../utils');
var when = require('when');

// ## Models
var Follower = require('./followers');
var Quality = require('./qualities');
var Day = require('./days');

Architect.init();

var Construct = Architect.Construct;

// Presently only schema properties are being used in the query builder. 
// The value doesn't matter right now.
var schema = {
  id: String,
  name: String,
  normalized: String,
  logoUrl: String,
  // quality: String,
  productDesc: String,
  highConcept: String,
  // followerCount: String,
  companyUrl: String,
  companySize: String,
  twitterUrl: String,
  blogUrl: String
};

// The first variable is the label and should be exactly the same as
// the Class variable name and Class.prototype.modelName
var qb = new QueryBuilder('Company', schema);

// ## Model

var Company = function (_data) {
  _.extend(this, _data);

  // get the id from the self property returned by neo4j
  this.nodeId = +this.self.split('/').pop();
};

// Must be exactly the same as the Class variable name above
Company.prototype.modelName = 'Company';

// ## Results Functions
// To be combined with queries using _.partial()

var _singleCompany = _.partial(utils.formatSingleResponse, Company);
var _manyCompanies = _.partial(utils.formatManyResponse, Company);


// ## Query Functions
// Should be combined with results functions using _.partial()

var _matchById = qb.makeMatch(['id']);

var _matchAll = qb.makeMatch();

// var _create = (function () {
  
//   var onCreate = {
//     created: 'timestamp()'
//   };

//   return qb.makeMerge(['normalized'], onCreate);
// })();
var _create = qb.makeMerge(['id']);

var _delete = qb.makeDelete(['id']);

var _deleteAll = qb.makeDelete();

var _update = qb.makeUpdate(['id']);

// ## Helper functions
var _prepareParams = function (params) {

  if (params.name) {
    params.normalized = utils.urlSafeString(params.name);
  }

  // Create ID if it doesn't exist
  if (!params.id) {
    params.id = utils.createId(params);
  }

  return params;
};

// ## Constructured functions
var create = function (params, options) {
  var func = new Construct(_create, _singleCompany);
  var p1 = when.promise(function (resolve) {

    params = _prepareParams(params);

    func.done().call(null, params, options, function (err, results, queries) {
      resolve({results: results, queries: queries});
    });
  });

  var p2 = Follower.create({'id': params.followerCount}, options);
  var p3 = Quality.create({'id': params.quality}, options);

  var all = when.join(p1, p2, p3);

  all.then(function (results) {
    var companyResults = results[0];
    var followerResults = results[1];
    var qualityResults = results[2];

    var companyNode = companyResults.results.node;
    var followerNode = followerResults.results.node;
    var qualityNode = qualityResults.results.node;

    companyNode.hasFollowers(followerNode, _.noop);
    companyNode.hasQuality(qualityNode, _.noop);

    var p4 = Day.create({'id': params.today}, options);

    return p4.then(function (dayResult){
      var dayNode = dayResult.results.node;
      followerNode.onDay(dayNode, _.noop);
      qualityNode.onDay(dayNode, _.noop);

      return companyResults[0];
    });
  });

  return all;
};

// create a new company
// var create = new Construct(_create, _singleCompany);

// create many new companies
// var createMany = new Construct(_createManySetup).map(create);

var createMany = function (params, options) {
  var promises = [];
  
  _.each(params.list, function (data) {
    var filtered = _.pick(data, Object.keys(schema));
    var promise = create(filtered, options);

    promises.push(promise);
  });

  return when.all(promises);
};

var getById = new Construct(_matchById).query().then(_singleCompany);

var getAll = new Construct(_matchAll, _manyCompanies);

// get a company by id and update its properties
// var update = new Construct(_update, _singleCompany);
var update = function (params, options, callback) {
  var func = new Construct(_update, _singleCompany);

  params = _prepareParams(params);

  func.done().call(this, params, options, callback);
};

// delete a company by id
var deleteCompany = new Construct(_delete);

// delete a company by id
var deleteAllCompanies = new Construct(_deleteAll);

var _queryStats = function (from, type) {
  return when.promise(function (resolve) {

    var query = [];
    var qs = '';
    var cypherParams = {
      id: from.node.data.id
    };
    var relationship = {
      quality: ':HAS_QUALITY',
      followers: ':HAS_FOLLOWERS'
    };

    query.push(util.format('MATCH (:%s {id:{id}})-[%s]->(stat)-[:ON_DAY]->(day)', from.object, relationship[type]));
    query.push('RETURN stat, day');
    query.push('ORDER BY day.id');
    query.push('LIMIT 30');

    qs = query.join('\n');

    db.query(qs, cypherParams, function (err, results){
      // console.log(err, 'err');
      // console.log(results, 'results');
      // console.log(results[0].stat._data.data.id, 'results');
      results = _.map(results, function(value){
        return {
          stat: value.stat._data.data.id,
          day: value.day._data.data.id
        };
      });
      // console.log(results[0].day._data);
      resolve({companyStats: results});
    });
  });
};

var getStats = function (params, options) {
  var func = new Construct(_matchById).query().then(_singleCompany);
  var clone = _.clone(params);

  var p1 = when.promise(function (resolve) {

    func.done().call(null, clone, options, function (err, results, queries) {
      resolve({results: results, queries: queries});
    });
  });

  return p1.then(function (companyResults) {
    return _queryStats(companyResults.results, clone.type);
  });

};

var _hasRelationship = function (rel, to, callback) {
  
  if (!rel.label) throw new Error('You must give this relationship a label');
  
  var label = rel.label;
  var props = rel.props || {};
  var that = this;
  var query = [];
  var qs = '';
  var toArr = [];
  var cypherParams = {};

  // Make sure to is an array
  if (!Array.isArray(to)) toArr.push(to);
  else toArr = to;

  // Build the cypherParams
  cypherParams.from = that.nodeId; // add the 'from' nodeID

  _.each(toArr, function (toNode, index) {
    var ident = 'ident_' + index;

    cypherParams[ident] = toNode.nodeId;

    // @NOTE 
    // MATCH statement must come before CREATE
    //
    // START may be deprecated soon... starting with Neo4J 2.0 so using 
    // MATCH + WHERE is the recommended way to find a node by nodeId
  
    // query.unshift('START a=node({from}), b=node({to})');
    query.unshift(util.format('MATCH (%s) WHERE id(%s) = {%s}', ident, ident, ident));
    query.push(util.format('CREATE UNIQUE (a)-[:%s %s]->(%s)', label, JSON.stringify(props), ident));
  });

  // add the user node to the front
  query.unshift('MATCH (a) WHERE id(a) = {from}');

  qs = query.join('\n');

  db.query(qs, cypherParams, callback);
};

Company.prototype.hasFollowers = _.partial(_hasRelationship, {label:'HAS_FOLLOWERS'});
Company.prototype.hasQuality = _.partial(_hasRelationship, {label:'HAS_QUALITY'});

// static methods:

Company.create = create;
Company.createMany = createMany;
Company.deleteCompany = deleteCompany.done();
Company.deleteAllCompanies = deleteAllCompanies.done();
Company.getAll = getAll.done();
Company.getById = getById.done();
Company.update = update;
Company.getStats = getStats;

module.exports = Company;
