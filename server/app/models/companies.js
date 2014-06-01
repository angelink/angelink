'use strict';

// ## Module Dependencies
var _ = require('lodash');
var Architect = require('neo4j-architect');
// var db = require('../db');
var QueryBuilder = require('../neo4j-qb/qb.js');
var utils = require('../utils');

Architect.init();

var Construct = Architect.Construct;

// Presently only schema properties are being used in the query builder. 
// The value doesn't matter right now.
var schema = {
  id: String,
  name: String,
  normalized: String
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

var _create = (function () {
  
  var onCreate = {
    created: 'timestamp()'
  };

  return qb.makeMerge(['normalized'], onCreate);
})();

var _createManySetup = function (params, callback) {
  if (params.list && _.isArray(params.list)) {
    callback(null, _.map(params.list, function (data) {
      return _.pick(data, Object.keys(schema));
    }));
  } else {
    callback(null, []);
  }
};

var _delete = qb.makeDelete(['id']);

var _deleteAll = qb.makeDelete();

var _update = qb.makeUpdate(['id']);

// ## Constructed Functions

// create a new company
var create = new Construct(_create, _singleCompany);

// create many new companies
var createMany = new Construct(_createManySetup).map(create);

var getById = new Construct(_matchById).query().then(_singleCompany);

var getAll = new Construct(_matchAll, _manyCompanies);

// get a company by id and update its properties
var update = new Construct(_update, _singleCompany);

// delete a company by id
var deleteCompany = new Construct(_delete);

// delete a company by id
var deleteAllCompanies = new Construct(_deleteAll);

// static methods:

Company.create = create.done();
Company.createMany = createMany.done();
Company.deleteCompany = deleteCompany.done();
Company.deleteAllCompanies = deleteAllCompanies.done();
Company.getAll = getAll.done();
Company.getById = getById.done();
Company.update = update.done();

module.exports = Company;
