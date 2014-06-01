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

var _createManySetup = function (params, callback) {
  if (params.list && _.isArray(params.list)) {
    callback(null, _.map(params.list, function (data) {
      return _.pick(data, Object.keys(schema));
    }));
  } else {
    callback(null, []);
  }
};

var create = new Construct(_create, _singleEquity);

var createMany = new Construct(_createManySetup).map(create);

var getById = new Construct(_matchById).query().then(_singleEquity);

var getAll = new Construct(_matchAll, _manyEquities);

var update = new Construct(_update, _singleEquity);

var deleteEquity = new Construct(_delete);

var deleteAllEquities = new Construct(_deleteAll);

// static methods
Equity.create = create.done();
Equity.createMany = createMany.done();
Equity.deleteLocation = deleteEquity.done();
Equity.deleteAllEquities = deleteAllEquities.done();
Equity.getById = getById.done();
Equity.getAll = getAll.done();
Equity.update = update.done();

module.exports = Equity;
