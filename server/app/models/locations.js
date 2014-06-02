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
  city: String
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
  var func = new Construct(_create, _singleLoc);
  var promise = when.promise(function (resolve) {

    // @NOTE Do any data cleaning/prep here...

    // There is a good chance that 'params' is stringified JSON object so parse it.
    if (typeof params === 'string') {
      params = JSON.parse(params);
    }

    // make sure params is what we expect it to be
    params = _prepareParams(params);

    func.done().call(null, params, options, function (err, results, queries) {
      resolve({results: results, queries: queries});
    });
  });

  return promise;
};

// // create a new location
// var create = new Construct(_create, _singleLoc);

// // create many new locations
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

var getById = new Construct(_matchById).query().then(_singleLoc);

var getAll = new Construct(_matchAll, _manyLocs);

// // get a loc by name/state/country and update its properties
// var update = new Construct(_update, _singleLoc);

var update = function (params, options, callback) {
  var func = new Construct(_update, _singleLoc);

  params = _prepareParams(params);

  func.done().call(this, params, options, callback);
};

// delete a loc by name/state/country
var deleteLoc = new Construct(_delete);

// delete a loc by name/state/country
var deleteAllLocs = new Construct(_deleteAll);

// static methods:

Loc.create = create;
Loc.createMany = createMany;
Loc.deleteLocation = deleteLoc.done();
Loc.deleteAllLocations = deleteAllLocs.done();
Loc.getAll = getAll.done();
Loc.getById = getById.done();
Loc.update = update;

module.exports = Loc;
