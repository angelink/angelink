'use strict';

// ## Module Dependencies
var _ = require('lodash');
var sw = require('swagger-node-express');
var utils = require('../../utils');


// ## Models
var Equity = require('../../models/equities');

var param = sw.params;
var swe = sw.errors;


// ## Helpers
var _prepareParams = function (req) {
  var params = req.body;

  params.id = (req.params && req.params.id) || (req.body && req.body.id);

  // Create ID if it doesn't exist
  if (!params.id) {
    params.id = utils.createId(params);
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


// Route: GET '/equities'
exports.list = {

  spec: {
    description : 'List all equities',
    path : '/equities',
    method: 'GET',
    summary : 'Find all equities',
    notes : 'Returns all equities',
    type: 'object',
    items: {
      $ref: 'Equity'
    },
    produces: ['application/json'],
    parameters : [],
    responseMessages: [swe.notFound('equities')],
    nickname : 'getEquities'
  },

  action: function (req, res) {
    var options = {};
    var errLabel = 'Route: GET /equities';
    var callback = _.partial(_callback, res, errLabel);
    
    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Equity.getAll(null, options, callback);
  }
};


// Route: POST '/equities'
exports.addEquity = {
  
  spec: {
    path : '/equities',
    notes : 'adds a equity to the graph',
    summary : 'Add a new equity to the graph',
    method: 'POST',
    type : 'array',
    items : {
      $ref: 'Equity'
    },
    parameters : [
      param.form('equityMax', 'EquityMax', 'string', true),
      param.form('equityMin', 'EquityMin', 'string', true)
    ],
    responseMessages : [swe.invalid('equity')],
    nickname : 'addEquity'
  },

  action: function(req, res) {
    var options = {};
    var params = {};
    var errLabel = 'Route: POST /equities';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Equity.create(params, options, callback);
  }
};


// Route: POST '/equities/batch'
exports.addEquities = {
  
  spec: {
    path : '/equities/batch',
    notes : 'add equities to the graph',
    summary : 'Add multiple equities to the graph',
    method: 'POST',
    type : 'object',
    parameters : [
      param.form('list', 'Array of equities object JSON strings', 'array', true),
    ],
    responseMessages : [swe.invalid('list')],
    nickname : 'addEquities'
  },

  action: function(req, res) {
    var options = {};
    var params = req.body;
    var errLabel = 'Route: POST /equities/batch';
    var callback = _.partial(_callback, res, errLabel);
    var list = JSON.parse(params.list);

    if (!list.length) throw swe.invalid('list');

    // @TODO 
    // should probably check to see if all location objects contain the minimum
    // required properties and stop if not.
    list = _.map(list, function (salary) {
      return _prepareParams({body: salary});
    });

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Equity.createMany({list:list}, options, callback);
  }
};

// Route: DELETE '/equities'
exports.deleteAllEquities = {
  spec: {
    path: '/equities',
    notes: 'Deletes all equities and their relationships',
    summary: 'Delete all equities',
    method: 'DELETE',
    type: 'object',
    nickname : 'deleteAllEquities'
  },

  action: function (req, res) {
    var options = {};
    var errLabel = 'Route: DELETE /equities';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Equity.deleteAllEquities(null, options, callback);
  }
};


// Route: GET '/equities/:id'
exports.findById = {
  
  spec: {
    description : 'find a equity',
    path : '/equities/{id}',
    notes : 'Returns a equities based on id',
    summary : 'Find equity by id',
    method: 'GET',
    parameters : [
      param.path('id', 'ID of equity that needs to be fetched', 'string'),
    ],
    type : 'Equity',
    responseMessages : [swe.invalid('id'), swe.notFound('equity')],
    nickname : 'getEquityById'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: GET /equities/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    console.log(params);

    Equity.getById(params, options, callback);
  }
};


// Route: POST '/equities/:id'
exports.updateById = {

  spec: {
    path: '/equities/{id}',
    notes: 'Updates an existing equity',
    summary: 'Update a equity',
    method: 'POST',
    type: 'object',
    items: {
      $ref: 'Equity'
    },
    parameters : [
      param.path('id', 'ID of equity that needs to be fetched', 'string'),
      param.form('equityMax', 'EquityMax', 'string', true),
      param.form('equityMin', 'EquityMin', 'string', true)
    ],
    responseMessages : [swe.invalid('input')],
    nickname : 'updateEquity'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: POST /equity/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Equity.update(params, options, callback);
  }
};

// Route: DELETE '/equities/:id'
exports.deleteEquity = {

  spec: {
    path: '/equities/{id}',
    notes: 'Deletes an existing equity and its relationships',
    summary: 'Delete a equity',
    method: 'DELETE',
    type: 'object',
    parameters: [
      param.path('id', 'ID of equity to be deleted', 'string'),
    ],
    responseMessages: [swe.invalid('input')],
    nickname : 'deleteEquity'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: DELETE /equities/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Equity.deleteEquity(params, options, callback);
  }
};
