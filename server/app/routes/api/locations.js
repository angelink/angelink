'use strict';

// ## Module Dependencies
var _ = require('lodash');
var sw = require('swagger-node-express');
var utils = require('../../utils');


// ## Models
var Loc = require('../../models/locations');

var param = sw.params;
var swe = sw.errors;


// ## Helpers
var _prepareParams = function (req) {
  var params = req.body;

  params.id = req.params.id || req.body.id;

  // Create id from city
  if (params.city) {
    params.id = utils.urlSafeString(params.city);
  }

  return params;
};

// callback helper function
// 
// This is meant to be bound to a new function within the endpoint request callback
// using _partial(). The first two parameters should be provided by the request callback 
// for the endpoint this is being used in.
//
// Example:
//
// action: function(req, res) {
//   var errLabel = 'Route: POST /locations';
//   var callback = _.partial(_callback, res, errLabel);
// }
var _callback = function (res, errLabel, err, results, queries) {
  var start = new Date();

  if (err || !results) {
    if (err) console.error(errLabel + ' ', err);
    swe.invalid('input', res);
    return;
  }

  utils.writeResponse(res, results, queries, start);
};


// ## API Specs


// Route: GET '/locations'
exports.list = {

  spec: {
    description : 'List all locations',
    path : '/locations',
    method: 'GET',
    summary : 'Find all locations',
    notes : 'Returns all locations',
    type: 'object',
    items: {
      $ref: 'Location'
    },
    produces: ['application/json'],
    parameters : [],
    responseMessages: [swe.notFound('locations')],
    nickname : 'getLocations'
  },

  action: function (req, res) {
    var options = {};
    var errLabel = 'Route: GET /locations';
    var callback = _.partial(_callback, res, errLabel);
    
    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Loc.getAll(null, options, callback);
  }
};


// Route: POST '/locations'
exports.addLocation = {
  
  spec: {
    path : '/locations',
    notes : 'adds a location to the graph',
    summary : 'Add a new location to the graph',
    method: 'POST',
    type : 'array',
    items : {
      $ref: 'Location'
    },
    parameters : [
      param.query('city', 'City', 'string', true),
    ],
    responseMessages : [swe.invalid('city')],
    nickname : 'addLocation'
  },

  action: function(req, res) {
    var options = {};
    var params = {};
    var errLabel = 'Route: POST /locations';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Loc.create(params, options, callback);
  }
};


// Route: POST '/locations/batch'
exports.addLocations = {
  
  spec: {
    path : '/locations/batch',
    notes : 'add locations to the graph',
    summary : 'Add multiple locations to the graph',
    method: 'POST',
    type : 'object',
    parameters : [
      param.form('list', 'Array of location object JSON strings', 'array', true),
    ],
    responseMessages : [swe.invalid('list')],
    nickname : 'addLocations'
  },

  action: function(req, res) {
    var options = {};
    var params = req.body;
    var errLabel = 'Route: POST /locations/batch';
    var callback = _.partial(_callback, res, errLabel);
    var list = JSON.parse(params.list);

    if (!list.length) throw swe.invalid('list');

    // @TODO 
    // should probably check to see if all location objects contain the minimum
    // required properties and stop if not.
    list = _.map(list, function (loc) {
      return _prepareParams({body: loc});
    });

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Loc.createMany({list:list}, options, callback);
  }
};

// Route: DELETE '/locations'
exports.deleteAllLocations = {
  spec: {
    path: '/locations',
    notes: 'Deletes all locations and their relationships',
    summary: 'Delete all locations',
    method: 'DELETE',
    type: 'object',
    nickname : 'deleteAllLocations'
  },

  action: function (req, res) {
    var options = {};
    var errLabel = 'Route: DELETE /locations';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Loc.deleteAllLocations(null, options, callback);
  }
};


// Route: GET '/locations/:id'
exports.findById = {
  
  spec: {
    description : 'find a location',
    path : '/locations/{id}',
    notes : 'Returns a location based on id',
    summary : 'Find location by id',
    method: 'GET',
    parameters : [
      param.path('id', 'ID of location that needs to be fetched', 'string'),
    ],
    type : 'Location',
    responseMessages : [swe.invalid('id'), swe.notFound('location')],
    nickname : 'getLocationById'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: GET /locations/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    console.log(params);

    Loc.getById(params, options, callback);
  }
};


// Route: POST '/locations/:id'
exports.updateById = {

  spec: {
    path: '/locations/{id}',
    notes: 'Updates an existing location',
    summary: 'Update a location',
    method: 'POST',
    type: 'object',
    items: {
      $ref: 'Location'
    },
    parameters : [
      param.path('id', 'ID of location that needs to be fetched', 'string'),
      param.form('city', 'City. A normalized id will be created from this.', 'string', true),
    ],
    responseMessages : [swe.invalid('input')],
    nickname : 'updateLocation'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: POST /locations/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Loc.update(params, options, callback);
  }
};

// Route: DELETE '/locations/:id'
exports.deleteLocation = {

  spec: {
    path: '/locations/{id}',
    notes: 'Deletes an existing location and its relationships',
    summary: 'Delete a location',
    method: 'DELETE',
    type: 'object',
    parameters: [
      param.path('id', 'ID of location to be deleted', 'string'),
    ],
    responseMessages: [swe.invalid('input')],
    nickname : 'deleteLocation'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: DELETE /locations/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Loc.deleteLocation(params, options, callback);
  }
};
