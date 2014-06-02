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

// var _createManySetup = function (params, callback) {
//   if (params.list && _.isArray(params.list)) {
//     callback(null, _.map(params.list, function (data) {
//       return _.pick(data, Object.keys(schema));
//     }));
//   } else {
//     callback(null, []);
//   }
// };

// ## Helper functions
var _prepareParams = function (params) {
  // Create ID if it doesn't exist
  if (!params.id) {
    params.id = utils.createId(params);
  }

  return params;
};

// ## Constructured functions
var create = function (params, options) {
  var func = new Construct(_create, _singleSalary);
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

// var create = new Construct(_create, _singleSalary);

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

var getById = new Construct(_matchById).query().then(_singleSalary);

var getAll = new Construct(_matchAll, _manySalaries);

// var update = new Construct(_update, _singleSalary);
var update = function (params, options, callback) {
  var func = new Construct(_update, _singleSalary);

  params = _prepareParams(params);

  func.done().call(this, params, options, callback);
};

var deleteSalary = new Construct(_delete);

var deleteAllSalaries = new Construct(_deleteAll);

// static methods
Salary.create = create;
Salary.createMany = createMany;
Salary.deleteLocation = deleteSalary.done();
Salary.deleteAllSalaries = deleteAllSalaries.done();
Salary.getById = getById.done();
Salary.getAll = getAll.done();
Salary.update = update;

module.exports = Salary;
