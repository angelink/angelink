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
var Skill = require('./skills');
var Loc = require('./locations');

Architect.init();

var Construct = Architect.Construct;

// Presently only schema properties are being used in the query builder. 
// The value doesn't matter right now.
var schema = {
  id: String, // linkedIn ID
  firstname: String,
  lastname: String,
  email: String,
  linkedInToken: String,
  profileImage: String
};

var qb = new QueryBuilder('User', schema);

// ## Model

var User = function (_data) {
  _.extend(this, _data);

  // get the id from the self property returned by neo4j
  this.nodeId = +this.self.split('/').pop();
};

User.prototype.modelName = 'User';


// ## Results Functions
// To be combined with queries using Construct

var _singleUser = _.partial(utils.formatSingleResponse, User);
var _manyUsers = _.partial(utils.formatManyResponse, User);


// ## Query Functions
// Should be combined with results functions using Construct

var _matchByUUID = qb.makeMatch(['id']);

var _matchAll = qb.makeMatch();

var _create = (function () {
  
  var onCreate = {
    created: 'timestamp()'
  };

  return qb.makeMerge(['id'], onCreate);
})();

var _update = qb.makeUpdate(['id']);

var _delete = qb.makeDelete(['id']);

var _deleteAll = qb.makeDelete();

var _createManySetup = function (params, callback) {
  if (params.list && _.isArray(params.list)) {
    callback(null, _.map(params.list, function (data) {
      return _.pick(data, Object.keys(schema));
    }));
  } else {
    callback(null, []);
  }
};


// ## Constructed Functions

// var create = function (params, options, callback) {
//   var func = new Construct(_create, _singleUser);
  
//   // Do any data cleaning/prep here

//   func.done().call(this, params, options, callback);
// };

var create = function (params, options) {
  var func = new Construct(_create, _singleUser);
  var p1 = when.promise(function (resolve) {

    // @NOTE Do any data cleaning/prep here...
    
    func.done().call(null, params, options, function (err, results, queries) {
      resolve({results: results, queries: queries});
    });
  });

  // @NOTE Post save actions can be done here...
  p1.then(function (results) {
    var _res = results.results;

    // Create the (User)->(Users) relationship
    if (_res.node.data.linkedInToken) {
      _res.node.joined(_.noop);
    }
    
    return results;
  });

  // Create the Users skills
  var p2 = Skill.createMany(params.skills, options);

  var p3 = Loc.create(params.location, options);

  var all = when.join(p1,p2,p3);

  // Things to do once users, skills, location, etc have been created
  all.then(function (results) {
    var userResults = results[0];
    var skillResults = results[1];
    var locResults = results[2];
    var user = userResults.results.node;

    var skills = _.map(skillResults, function (res) {
      return res.results.node;
    });

    user.hasSkill(skills, _.noop);
    user.atLocation(locResults.results.node, _.noop);

    return results;
  });

  return all;
};

// create many new users
var createMany = new Construct(_createManySetup).map(create);

var getById = new Construct(_matchByUUID).query().then(_singleUser);
// var getById = new Construct(_matchByUUID, _singleUser);

var getAll = new Construct(_matchAll, _manyUsers);

// get a user by id and update their properties
var update = new Construct(_update, _singleUser);

// delete a user by id
var deleteUser = new Construct(_delete);

// delete a user by id
var deleteAllUsers = new Construct(_deleteAll);

// relationships:

/**
 * _hasRelationship
 *
 * Helper function used to create new 'relationship' functions using _.partial
 *
 * @param rel {object} *required*
 *  - rel.label {string} *required* label of the relationship to be added
 *  - rel.props {object} property to be added to each of the created relationships
 *
 * @param to {object|array} *required* a node object or an array of node objects
 *
 * @param callback {func}
 */
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


/**
 * Builds and executes a query to create a relationship between this user 
 * and other skill nodes
 *
 * @param nodes {object|array} a skill node or an array of skill nodes
 * @param callback {func}
 */
User.prototype.hasSkill = _.partial(_hasRelationship, {label:'HAS_SKILL'});

User.prototype.joined = function (callback) {
  var that = this;
  var query = [];
  var qs = '';
  
  query.push('MATCH (a) WHERE id(a) = {from}');
  query.push('MATCH (b:Users)');
  query.push('CREATE UNIQUE (a)-[:JOINED {date:timestamp()}]->(b)');
  qs = query.join('\n');

  db.query(qs, {from: that.nodeId}, callback);
};

/**
 * Builds and executes a query to create a relationship between this user
 * and other user nodes
 *
 * @param nodes {object|array} a user node or an array of user nodes
 * @param callback {func}
 */
User.prototype.knows = _.partial(_hasRelationship, {label: 'KNOWS'});


/**
 * Builds and executes a query to create a relationship between this user
 * and his/her location
 *
 * @param nodes {object} a location node
 * @param callback {func}
 */
User.prototype.atLocation = _.partial(_hasRelationship, {label: 'AT_LOCATION'});


// static methods:

User.create = create;
User.createMany = createMany.done();
User.deleteUser = deleteUser.done();
User.deleteAllUsers = deleteAllUsers.done();
User.getById = getById.done();
User.getAll = getAll.done();
User.update = update.done();

module.exports = User;
