'use strict';

// ## Module Dependencies
var _ = require('lodash');
var sw = require('swagger-node-express');
var utils = require('../../utils');


// ## Models
var Users = require('../../models/users');

var param = sw.params;
var swe = sw.errors;


// ## Helpers
var _prepareParams = function (req) {
  var params = req.body;

  params.id = req.params.id || req.body.id;

  return params;
};

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

// Route: GET '/users'
exports.list = {

  spec: {
    description : 'List all users',
    path : '/users',
    method: 'GET',
    summary : 'Find all users',
    notes : 'Returns all users',
    type: 'object',
    items: {
      $ref: 'User'
    },
    produces: ['application/json'],
    parameters : [],
    responseMessages: [swe.notFound('users')],
    nickname : 'getUsers'
  },

  action: function (req, res) {
    var options = {};
    var errLabel = 'Route: GET /users';
    var callback = _.partial(_callback, res, errLabel);
    
    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Users.getAll(null, options, callback);
  }
};


// Route: POST '/users'
exports.addUser = {
  
  spec: {
    path : '/users',
    notes : 'adds a user to the graph',
    summary : 'Add a new user to the graph',
    method: 'POST',
    type : 'object',
    items : {
      $ref: 'User'
    },
    parameters : [
      param.form('id', 'User UUID', 'string', true),
      param.form('firstname', 'User firstname', 'string', true),
      param.form('lastname', 'User lastname', 'string', true),
      param.form('email', 'User email', 'string', false),
      param.form('linkedInToken', 'LinkedIn OAuth Token', 'string', false),
      param.form('profileImage', 'User profile image url', 'string', false),
    ],
    responseMessages : [swe.invalid('input')],
    nickname : 'addUser'
  },

  action: function(req, res) {
    var options = {};
    var params = {};
    var errLabel = 'Route: POST /users';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Users.create(params, options, callback);
  }
};

// Route: DELETE '/users'
exports.deleteAllUsers = {
  spec: {
    description : 'delete all users',
    path: '/users',
    notes: 'Deletes all users and their relationships',
    summary: 'Find user by ID',
    method: 'DELETE',
    type: 'object',
    nickname : 'deleteAllUsers'
  },

  action: function (req, res) {
    var options = {};
    var errLabel = 'Route: DELETE /users';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Users.deleteAllUsers({}, options, callback);
  }
};


// Route: GET '/users/:id'
exports.findById = {
  
  spec: {
    description : 'find a user',
    path: '/users/{id}',
    notes: 'Returns a user based on ID',
    summary: 'Find user by ID',
    method: 'GET',
    type: 'object',
    parameters : [
      param.path('id', 'ID of user that needs to be fetched', 'string'),
    ],
    responseMessages : [swe.invalid('id'), swe.notFound('user')],
    nickname : 'getUserById'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: GET /users/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Users.getById(params, options, callback);
  }
};

// Route: POST '/users/:id'
exports.updateById = {

  spec: {
    path: '/users/{id}',
    notes: 'Updates an existing user',
    summary: 'Update a user',
    method: 'POST',
    type: 'object',
    items: {
      $ref: 'User'
    },
    parameters : [
      param.path('id', 'ID of user that needs to be fetched', 'string'),
      param.form('firstname', 'User firstname', 'string', true),
      param.form('lastname', 'User lastname', 'string', true),
      param.form('email', 'User email', 'string', false),
      param.form('linkedInToken', 'LinkedIn OAuth Token', 'string', false),
      param.form('profileImage', 'User profile image url', 'string', false),
    ],
    responseMessages : [swe.invalid('input')],
    nickname : 'updateUser'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: POST /users/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Users.update(params, options, callback);
  }
};

// Route: DELETE '/users/:id'
exports.deleteUser = {

  spec: {
    path: '/users/{id}',
    notes: 'Deletes an existing user and his/her relationships',
    summary: 'Delete a user',
    method: 'DELETE',
    type: 'object',
    parameters: [
      param.path('id', 'ID of user to be deleted', 'string'),
    ],
    responseMessages: [swe.invalid('input')],
    nickname : 'deleteUser'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: DELETE /users/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Users.deleteUser(params, options, callback);
  }
};
