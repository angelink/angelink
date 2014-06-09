'use strict';

// ## Module Dependencies
var _ = require('lodash');
var sw = require('swagger-node-express');
var utils = require('../../utils');


// ## Models
var Role = require('../../models/roles');

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
    description : 'List all roles',
    path : '/roles',
    method: 'GET',
    summary : 'Find all roles',
    notes : 'Returns all roles',
    type: 'object',
    items: {
      $ref: 'Role'
    },
    produces: ['application/json'],
    parameters : [],
    responseMessages: [swe.notFound('roles')],
    nickname : 'getRoles'
  },

  action: function (req, res) {
    var options = {};
    var errLabel = 'Route: GET /roles';
    var callback = _.partial(_callback, res, errLabel);
    
    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Role.getAll(null, options, callback);
  }
};


// Route: POST '/roles'
exports.addRole = {
  
  spec: {
    path : '/roles',
    notes : 'adds a role to the graph',
    summary : 'Add a new role to the graph',
    method: 'POST',
    type : 'object',
    items : {
      $ref: 'Role'
    },
    parameters : [
      param.form('name', 'name', 'string', true)
    ],
    responseMessages : [swe.invalid('role')],
    nickname : 'addRole'
  },

  action: function(req, res) {
    var options = {};
    var params = {};
    var errLabel = 'Route: POST /roles';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Role.create(params, options).done(function(results){
      callback(null, results);
    });
  }
};


// Route: POST '/roles/batch'
exports.addRoles = {
  
  spec: {
    path : '/roles/batch',
    notes : 'add roles to the graph',
    summary : 'Add multiple roles to the graph',
    method: 'POST',
    type : 'object',
    parameters : [
      param.form('list', 'Array of roles object JSON strings', 'array', true),
    ],
    responseMessages : [swe.invalid('list')],
    nickname : 'addRoles'
  },

  action: function(req, res) {
    var options = {};
    var params = req.body;
    var errLabel = 'Route: POST /roles/batch';
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

    Role.createMany({list:list}, options).done(function(results){
      callback(null, results);
    });
  }
};

// Route: DELETE '/roles'
exports.deleteAllRoles = {
  spec: {
    path: '/roles',
    notes: 'Deletes all roles and their relationships',
    summary: 'Delete all roles',
    method: 'DELETE',
    type: 'object',
    nickname : 'deleteAllRoles'
  },

  action: function (req, res) {
    var options = {};
    var errLabel = 'Route: DELETE /roles';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Role.deleteAllRoles(null, options, callback);
  }
};


// Route: GET '/roles/:id'
exports.findById = {
  
  spec: {
    description : 'find a role',
    path : '/roles/{id}',
    notes : 'Returns a role based on id',
    summary : 'Find role by id',
    method: 'GET',
    parameters : [
      param.path('id', 'ID of role that needs to be fetched', 'string'),
    ],
    type : 'Role',
    responseMessages : [swe.invalid('id'), swe.notFound('role')],
    nickname : 'getRoleById'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: GET /roles/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    // console.log(params);

    Role.getById(params, options, callback);
  }
};


// Route: POST '/roles/:id'
exports.updateById = {

  spec: {
    path: '/roles/{id}',
    notes: 'Updates an existing role',
    summary: 'Update a role',
    method: 'POST',
    type: 'object',
    items: {
      $ref: 'Role'
    },
    parameters : [
      param.path('id', 'ID of salary that needs to be fetched', 'string'),
      param.form('name', 'name', 'string', true)
    ],
    responseMessages : [swe.invalid('input')],
    nickname : 'updateRole'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: POST /roles/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Role.update(params, options).done(function(results){
      callback(null, results);
    });
  }
};

// Route: DELETE '/roles/:id'
exports.deleteRole = {

  spec: {
    path: '/roles/{id}',
    notes: 'Deletes an existing role and its relationships',
    summary: 'Delete a role',
    method: 'DELETE',
    type: 'object',
    parameters: [
      param.path('id', 'ID of role to be deleted', 'string'),
    ],
    responseMessages: [swe.invalid('input')],
    nickname : 'deleteRole'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: DELETE /roles/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Role.deleteSalary(params, options, callback);
  }
};
