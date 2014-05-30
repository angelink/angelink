'use strict';

// ## Module Dependencies
var _ = require('lodash');
var sw = require('swagger-node-express');
var utils = require('../../utils');

// ## Models
var Company = require('../../models/companies');

var param = sw.params;
var swe = sw.errors;


// ## Helpers
var _prepareParams = function (req) {
  var params = req.body;

  params.id = (req.params && req.params.id) || (req.body && req.body.id);

  // Create normalized name from name
  if (params.name) {
    params.normalized = utils.normalizeString(params.name);
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
//   var errLabel = 'Route: POST /companies';
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


// Route: GET '/companies'
exports.list = {

  spec: {
    description : 'List all companies',
    path : '/companies',
    method: 'GET',
    summary : 'Find all companies',
    notes : 'Returns all companies',
    type: 'array',
    items: {
      $ref: 'Company'
    },
    produces: ['application/json'],
    parameters : [],
    responseMessages: [swe.notFound('companies')],
    nickname : 'getCompany'
  },

  action: function (req, res) {
    var options = {};
    var errLabel = 'Route: GET /companies';
    var callback = _.partial(_callback, res, errLabel);
    
    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Company.getAll(null, options, callback);
  }
};


// Route: POST '/companies'
exports.addCompany = {
  
  spec: {
    path : '/companies',
    notes : 'adds a company to the graph',
    summary : 'Add a new company to the graph',
    method: 'POST',
    type : 'array',
    items : {
      $ref: 'Company'
    },
    parameters : [
      param.form('name', 'Company name. A normalized name will be created from this.', 'string', true),
      param.form('id', 'Company AngelList ID.', 'string', false),
    ],
    responseMessages : [swe.invalid('name')],
    nickname : 'addCompany'
  },

  action: function(req, res) {
    var options = {};
    var params = {};
    var errLabel = 'Route: POST /companies';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Company.create(params, options).done(function(results){
      callback(null, results);
    });
  }
};


// Route: POST '/companies/batch'
exports.addCompanies = {
  
  spec: {
    path : '/companies/batch',
    notes : 'add companies to the graph',
    summary : 'Add multiple companies to the graph',
    method: 'POST',
    type : 'object',
    parameters : [
      param.form('list', 'Array of company object JSON strings', 'array', true),
    ],
    responseMessages : [swe.invalid('list')],
    nickname : 'addCompanies'
  },

  action: function(req, res) {
    var options = {};
    var params = req.body;
    var errLabel = 'Route: POST /companies/batch';
    var callback = _.partial(_callback, res, errLabel);
    var list = JSON.parse(params.list);

    if (!list.length) throw swe.invalid('list');

    // @TODO 
    // should probably check to see if all company objects contain the minimum
    // required properties and stop if not.
    list = _.map(list, function (data) {
      return _prepareParams({body: data});
    });

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Company.createMany({list:list}, options).done(function(results){
      callback(null, results);
    });
  }
};


// Route: DELETE '/companies'
exports.deleteAllCompanies = {
  spec: {
    path: '/companies',
    notes: 'Deletes all companies and their relationships',
    summary: 'Delete all companies',
    method: 'DELETE',
    type: 'object',
    nickname : 'deleteAllCompanies'
  },

  action: function (req, res) {
    var options = {};
    var errLabel = 'Route: DELETE /companies';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Company.deleteAllCompanies(null, options, callback);
  }
};


// Route: GET '/companies/:id'
exports.findById = {
  
  spec: {
    description : 'find a company',
    path : '/companies/{id}',
    notes : 'Returns a company based on id',
    summary : 'Find company by id',
    method: 'GET',
    parameters : [
      param.path('id', 'ID of company that needs to be fetched', 'string'),
    ],
    type : 'Company',
    responseMessages : [swe.invalid('id'), swe.notFound('company')],
    nickname : 'getCompanyById'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: GET /companies/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Company.getById(params, options, callback);
  }
};


// Route: POST '/companies/:id'
exports.updateById = {

  spec: {
    path: '/companies/{id}',
    notes: 'Updates an existing company',
    summary: 'Update a company',
    method: 'POST',
    type: 'object',
    items: {
      $ref: 'Company'
    },
    parameters : [
      param.path('id', 'ID of company that needs to be fetched', 'string'),
      param.form('name', 'Company name. A normalized name will be created from this.', 'string', true),
    ],
    responseMessages : [swe.invalid('input')],
    nickname : 'updateCompany'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: POST /companies/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Company.update(params, options).done(function(results){
      callback(null, results);
    });
  }
};

// Route: DELETE '/companies/:id'
exports.deleteCompany = {

  spec: {
    path: '/companies/{id}',
    notes: 'Deletes an existing company and its relationships',
    summary: 'Delete a company',
    method: 'DELETE',
    type: 'object',
    parameters: [
      param.path('id', 'ID of company to be deleted', 'string'),
    ],
    responseMessages: [swe.invalid('input')],
    nickname : 'deleteCompany'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: DELETE /companies/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Company.deleteCompany(params, options, callback);
  }
};
