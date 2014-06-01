'use strict';

// ## Module Dependencies
var _ = require('lodash');
var Architect = require('neo4j-architect');
// var db = require('../db');
var QueryBuilder = require('../neo4j-qb/qb.js');
var utils = require('../utils');

Architect.init();

var Construct = Architect.Construct;

var schema = {
  currency: String,
  salaryMax: String,
  salaryMin: String
};

var qb = new QueryBuilder('Salary', schema);

// ## Model

var Salary = function(_data) {
  _.extend(this, _data);
  //get the unique node id
  this.nodeId = +this.self.split('/').pop();
};

Salary.prototype.modelName = 'Salary';

// ## Results Functions

var _singleSalary = _.partial(utils.formatSingleResponse, Salary);
var _manySalaries = _.partial(utils.formatManyResponse, Salary);

// ## Query Functions
// Should be combined with results functions using _.partial()

var _matchById = qb.makeMatch(['id']);

var _matchAll = qb.makeMatch();

var _create = qb.makeMerge(['id']);

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

var create = new Construct(_create, _singleSalary);

var createMany = new Construct(_createManySetup).map(create);

var getById = new Construct(_matchById).query().then(_singleSalary);

var getAll = new Construct(_matchAll, _manySalaries);

var update = new Construct(_update, _singleSalary);

var deleteSalary = new Construct(_delete);

var deleteAllSalaries = new Construct(_deleteAll);

// static methods
Salary.create = create.done();
Salary.createMany = createMany.done();
Salary.deleteLocation = deleteSalary.done();
Salary.deleteAllSalaries = deleteAllSalaries.done();
Salary.getById = getById.done();
Salary.getAll = getAll.done();
Salary.update = update.done();

module.exports = Salary;
