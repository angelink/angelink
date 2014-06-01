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
  city: String,
};

// The first variable is the label and should be exactly the same as
// the Class variable name and Class.prototype.modelName
var qb = new QueryBuilder('Loc', schema);


// ## Model

var Loc = function (_data) {
  _.extend(this, _data);

  // get the id from the self property returned by neo4j
  this.nodeId = +this.self.split('/').pop();
};

// Must be exactly the same as the Class variable name above
Loc.prototype.modelName = 'Loc';


// ## Results Functions
// To be combined with queries using Construct

var _singleLoc = _.partial(utils.formatSingleResponse, Loc);
var _manyLocs = _.partial(utils.formatManyResponse, Loc);


// ## Query Functions
// Should be combined with results functions using Construct

var _matchById = qb.makeMatch(['id']);

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

// create a new location
var create = new Construct(_create, _singleLoc);

// create many new locations
var createMany = new Construct(_createManySetup).map(create);

var getById = new Construct(_matchById).query().then(_singleLoc);

var getAll = new Construct(_matchAll, _manyLocs);

// get a loc by name/state/country and update its properties
var update = new Construct(_update, _singleLoc);

// delete a loc by name/state/country
var deleteLoc = new Construct(_delete);

// delete a loc by name/state/country
var deleteAllLocs = new Construct(_deleteAll);

// static methods:

Loc.create = create.done();
Loc.createMany = createMany.done();
Loc.deleteLocation = deleteLoc.done();
Loc.deleteAllLocations = deleteAllLocs.done();
Loc.getAll = getAll.done();
Loc.getById = getById.done();
Loc.update = update.done();

module.exports = Loc;
