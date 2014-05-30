'use strict';

// ## Module Dependencies
var _ = require('lodash');
var sw = require('swagger-node-express');
var utils = require('../../utils');


// ## Models
var Salary = require('../../models/salaries');

var param = sw.params;
var swe = sw.errors;


// ## Helpers
var _prepareParams = function (req) {
  var params = req.body;

  params.id = (req.params && req.params.id) || (req.body && req.body.id);

  // // Create ID if it doesn't exist
  // if (!params.id) {
  //   params.id = utils.createId(params);
  // }

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


// Route: GET '/salaries'
exports.list = {

  spec: {
    description : 'List all salaries',
    path : '/salaries',
    method: 'GET',
    summary : 'Find all salaries',
    notes : 'Returns all salaries',
    type: 'object',
    items: {
      $ref: 'Salary'
    },
    produces: ['application/json'],
    parameters : [],
    responseMessages: [swe.notFound('salaries')],
    nickname : 'getSalaries'
  },

  action: function (req, res) {
    var options = {};
    var errLabel = 'Route: GET /salaries';
    var callback = _.partial(_callback, res, errLabel);
    
    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Salary.getAll(null, options, callback);
  }
};


// Route: POST '/salaries'
exports.addSalary = {
  
  spec: {
    path : '/salaries',
    notes : 'adds a salary to the graph',
    summary : 'Add a new salary to the graph',
    method: 'POST',
    type : 'object',
    items : {
      $ref: 'Salary'
    },
    parameters : [
      param.form('currency', 'Currency', 'string', true),
      param.form('salaryMax', 'SalaryMax', 'string', true),
      param.form('salaryMin', 'SalaryMin', 'string', true)
    ],
    responseMessages : [swe.invalid('salary')],
    nickname : 'addSalary'
  },

  action: function(req, res) {
    var options = {};
    var params = {};
    var errLabel = 'Route: POST /salaries';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Salary.create(params, options).done(function(results){
      callback(null, results);
    });
  }
};


// Route: POST '/salaries/batch'
exports.addSalaries = {
  
  spec: {
    path : '/salaries/batch',
    notes : 'add salaries to the graph',
    summary : 'Add multiple salaries to the graph',
    method: 'POST',
    type : 'object',
    parameters : [
      param.form('list', 'Array of salaries object JSON strings', 'array', true),
    ],
    responseMessages : [swe.invalid('list')],
    nickname : 'addSalaries'
  },

  action: function(req, res) {
    var options = {};
    var params = req.body;
    var errLabel = 'Route: POST /salaries/batch';
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

    Salary.createMany({list:list}, options).done(function(results){
      callback(null, results);
    });
  }
};

// Route: DELETE '/salaries'
exports.deleteAllSalaries = {
  spec: {
    path: '/salaries',
    notes: 'Deletes all salaries and their relationships',
    summary: 'Delete all salaries',
    method: 'DELETE',
    type: 'object',
    nickname : 'deleteAllSalaries'
  },

  action: function (req, res) {
    var options = {};
    var errLabel = 'Route: DELETE /salaries';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Salary.deleteAllSalaries(null, options, callback);
  }
};


// Route: GET '/salaries/:id'
exports.findById = {
  
  spec: {
    description : 'find a salary',
    path : '/salaries/{id}',
    notes : 'Returns a salaries based on id',
    summary : 'Find salary by id',
    method: 'GET',
    parameters : [
      param.path('id', 'ID of salary that needs to be fetched', 'string'),
    ],
    type : 'Salary',
    responseMessages : [swe.invalid('id'), swe.notFound('salary')],
    nickname : 'getSalaryById'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: GET /salaries/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    console.log(params);

    Salary.getById(params, options, callback);
  }
};


// Route: POST '/salaries/:id'
exports.updateById = {

  spec: {
    path: '/salaries/{id}',
    notes: 'Updates an existing salary',
    summary: 'Update a salary',
    method: 'POST',
    type: 'object',
    items: {
      $ref: 'Salary'
    },
    parameters : [
      param.path('id', 'ID of salary that needs to be fetched', 'string'),
      param.form('currency', 'Currency', 'string', true),
      param.form('salaryMax', 'SalaryMax', 'string', true),
      param.form('salaryMin', 'SalaryMin', 'string', true)
    ],
    responseMessages : [swe.invalid('input')],
    nickname : 'updateSalary'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: POST /salary/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Salary.update(params, options, callback);
  }
};

// Route: DELETE '/salaries/:id'
exports.deleteSalary = {

  spec: {
    path: '/salaries/{id}',
    notes: 'Deletes an existing salary and its relationships',
    summary: 'Delete a salary',
    method: 'DELETE',
    type: 'object',
    parameters: [
      param.path('id', 'ID of salary to be deleted', 'string'),
    ],
    responseMessages: [swe.invalid('input')],
    nickname : 'deleteSalary'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: DELETE /salaries/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Salary.deleteSalary(params, options, callback);
  }
};
