'use strict';

// ## Module Dependencies
var _ = require('lodash');
var Loc = require('./neo4j/location.js');
var Architect = require('neo4j-architect');
var defaultResponseObject = require('../utils').defaultResponseObject;

Architect.init();

var Construct = Architect.Construct;
var Cypher = Architect.Cypher;

// ## Results Functions
// To be combined with queries using _.partial()

// return a single loc
var _singleLoc = function (results, callback) {
 
  var response = _.extend({}, defaultResponseObject);
  response.object = 'location';

  if (results.length) {
    response.data = new Loc(results[0].loc);
    callback(null, response);
  } else {
    callback(null, response);
  }
};

// return many locs
var _manyLocs = function (results, callback) {
  
  var response = _.extend({}, defaultResponseObject);
  var locations = _.map(results, function (result) {
    return new Loc(result.loc);
  });

  response.data = locations;
  response.object = 'list';
  callback(null, response);
};


// ## Query Functions
// Should be combined with results functions using _.partial()

var _matchBy = function (keys, params, callback) {
  var cypherParams = _.pick(params, keys);

  var query = [
    'MATCH (loc:Location)',
    Cypher.where('loc', keys),
    'RETURN loc'
  ].join('\n');

  console.log('_matchBy query', query);

  callback(null, query, cypherParams);
};

var _matchByCity = _.partial(_matchBy, ['city', 'state', 'country']);
var _matchByState = _.partial(_matchBy, ['state', 'country']);
var _matchByCountry = _.partial(_matchBy, ['country']);

var _matchAll = _.partial(_matchBy, []);

// creates the loc with cypher
var _create = function (params, callback) {
  var cypherParams = {
    city: params.city,
    state: params.state,
    country: params.country,
  };

  var query = [
    'MERGE (loc:Location {city: {city}, state: {state}, country: {country}})',
    'RETURN loc'
  ].join('\n');

  console.log('create query', query);

  callback(null, query, cypherParams);
};

// update the loc with cypher
var _update = function (params, callback) {

  var cypherParams = {
    city : params.city,
    state : params.state,
    country : params.country,
  };

  var query = [
    'MATCH (loc:Loc {city:{city}})',
    'SET loc.state = {state}',
    'SET loc.country = {country}',
    'RETURN loc'
  ].join('\n');

  callback(null, query, cypherParams);
};

// delete the loc and any relationships with cypher
var _delete = function (params, callback) {
  var cypherParams = {
    city: params.city,
    state: params.state,
    country: params.country,
  };

  var query = [
    'MATCH (loc:Location {city:{city}, state:{state}, country:{country}})',
    'OPTIONAL MATCH (loc)-[r]-()',
    'DELETE loc, r',
  ].join('\n');

  callback(null, query, cypherParams);
};

// delete all locs
var _deleteAll = function (params, callback) {
  var cypherParams = {};

  var query = [
    'MATCH (loc:Location)',
    'OPTIONAL MATCH (loc)-[r]-()',
    'DELETE loc, r',
  ].join('\n');

  callback(null, query, cypherParams);
};

// create a new location
var create = new Construct(_create, _singleLoc);

var getByCity = new Construct(_matchByCity).query().then(_singleLoc);
var getByState = new Construct(_matchByState).query().then(_singleLoc);
var getByCountry = new Construct(_matchByCountry).query().then(_singleLoc);

var getAll = new Construct(_matchAll, _manyLocs);

// get a loc by name/state/country and update its properties
var update = new Construct(_update, _singleLoc);

// delete a loc by name/state/country
var deleteLoc = new Construct(_delete);

// delete a loc by name/state/country
var deleteAllLocs = new Construct(_deleteAll);

// export exposed functions
module.exports = {
  create: create.done(),
  getByCity: getByCity.done(),
  getByState: getByState.done(),
  getByCountry: getByCountry.done(),
  getAll: getAll.done(),
  deleteLoc: deleteLoc.done(),
  deleteAllLocs: deleteAllLocs.done(),
  update: update.done(),
};