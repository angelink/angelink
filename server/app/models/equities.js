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
  equityMax: String,
  equityMin: String
};

var qb = new QueryBuilder('Equity', schema);

// ## Model

var Equity = function(_data) {
  _.extend(this, _data);
  //get the unique node id
  this.nodeId = +this.self.split('/').pop();
};

Equity.prototype.modelName = 'Equity';

// ## Results Functions

var _singleEquity = _.partial(utils.formatSingleResponse, Equity);
var _manyEquities = _.partial(utils.formatManyResponse, Equity);

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
  var func = new Construct(_create, _singleEquity);
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

var createMany = function (params, options) {
  var promises = [];
  
  _.each(params.list, function (data) {
    var filtered = _.pick(data, Object.keys(schema));
    var promise = create(filtered, options);

    promises.push(promise);
  });

  return when.all(promises);
};

// var create = new Construct(_create, _singleEquity);

// var createMany = new Construct(_createManySetup).map(create);

var getById = new Construct(_matchById).query().then(_singleEquity);

var getAll = new Construct(_matchAll, _manyEquities);

// var update = new Construct(_update, _singleEquity);

var update = function (params, options, callback) {
  var func = new Construct(_update, _singleEquity);

  params = _prepareParams(params);

  func.done().call(this, params, options, callback);
};

var deleteEquity = new Construct(_delete);

var deleteAllEquities = new Construct(_deleteAll);

// static methods
Equity.create = create;
Equity.createMany = createMany;
Equity.deleteLocation = deleteEquity.done();
Equity.deleteAllEquities = deleteAllEquities.done();
Equity.getById = getById.done();
Equity.getAll = getAll.done();
Equity.update = update;

module.exports = Equity;
