'use strict';

// ## Module Dependencies
var _ = require('lodash');
var Architect = require('neo4j-architect');
var QueryBuilder = require('../neo4j-qb/qb.js');
var utils = require('../utils');
var when = require('when');

Architect.init();

var Construct = Architect.Construct;

// Presently only schema properties are being used in the query builder. 
// The value doesn't matter right now.
var schema = {
  id: String
};

var qb = new QueryBuilder('Day', schema);

// ## Model
var Day = function (_data) {
  _.extend(this, _data);
  // get the id from the self property returned by neo4j
  this.nodeId = +this.self.split('/').pop();
};

// Must be exactly the same as the Class variable name above
Day.prototype.modelName = 'Day';

// ## Results Functions
// To be combined with queries using _.partial()

var _singleDay = _.partial(utils.formatSingleResponse, Day);
// var _manyDays = _.partial(utils.formatManyResponse, Day);

// ## Query Functions
// Should be combined with results functions using _.partial()

// var _matchById = qb.makeMatch(['id']);
// var _matchAll = qb.makeMatch();
var _create = qb.makeMerge(['id']);
// var _delete = qb.makeDelete(['id']);
// var _deleteAll = qb.makeDelete();
// var _update = qb.makeUpdate(['id']);


// ## Constructured functions
var create = function (params, options) {
  var func = new Construct(_create, _singleDay);
  var promise = when.promise(function (resolve) {

    func.done().call(null, params, options, function (err, results, queries) {
      resolve({results: results, queries: queries});
    });
  });

  return promise;
};

// var createMany = function (params, options) {
//   var promises = [];
  
//   _.each(params.list, function (data) {
//     var filtered = _.pick(data, Object.keys(schema));
//     var promise = create(filtered, options);

//     promises.push(promise);
//   });

//   return when.all(promises);
// };

// var getById = new Construct(_matchById).query().then(_singleDay);

// var getAll = new Construct(_matchAll, _manyDays);

// get a day by id and update its properties
// var update = function (params, options, callback) {
//   var func = new Construct(_update, _singleCompany);

//   params = _prepareParams(params);

//   func.done().call(this, params, options, callback);
// };

// delete a day by id
// var deleteDay = new Construct(_delete);

// delete a day by id
// var deleteAllDays = new Construct(_deleteAll);

// static methods:
Day.create = create;
// Day.createMany = createMany;
// Day.deleteCompany = deleteCompany.done();
// Day.deleteAllCompanies = deleteAllCompanies.done();
// Day.getAll = getAll.done();
// Day.getById = getById.done();
// Day.update = update;

module.exports = Day;
