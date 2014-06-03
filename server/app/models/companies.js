'use strict';

// ## Module Dependencies
var _ = require('lodash');
var Architect = require('neo4j-architect');
// var db = require('../db');
var QueryBuilder = require('../neo4j-qb/qb.js');
var utils = require('../utils');
var when = require('when');

Architect.init();

var Construct = Architect.Construct;

// Presently only schema properties are being used in the query builder. 
// The value doesn't matter right now.
var schema = {
  id: String,
  name: String,
  normalized: String,
  logoUrl: String,
  quality: String,
  productDesc: String,
  highConcept: String,
  followerCount: String,
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
  var promise = when.promise(function (resolve) {

    // @NOTE Do any data cleaning/prep here...

    // make sure params is what we expect it to be
    params = _prepareParams(params);

    func.done().call(null, params, options, function (err, results, queries) {
      resolve({results: results, queries: queries});
    });
  });

  return promise;
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

// static methods:

Company.create = create;
Company.createMany = createMany;
Company.deleteCompany = deleteCompany.done();
Company.deleteAllCompanies = deleteAllCompanies.done();
Company.getAll = getAll.done();
Company.getById = getById.done();
Company.update = update;

module.exports = Company;
