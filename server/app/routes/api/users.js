'use strict';

// ## Module Dependencies
var sw = require('swagger-node-express');
var utils = require('../../utils');


// ## Models
var Users = require('../../models/users');

var param = sw.params;
var swe = sw.errors;


// ## Helpers
var _prepareUserDataForInsert = function (req) {
  var params = {};

  // params.id = req.params.id || utils.getQueryValue(req, 'id');
  // params.firstname = utils.getQueryValue(req, 'firstname');
  // params.lastname = utils.getQueryValue(req, 'lastname');
  // params.email = utils.getQueryValue(req, 'email');
  // params.linkedInToken = utils.getQueryValue(req, 'linkedInToken');
  // params.profileImage = utils.getQueryValue(req, 'profileImage');

  params = req.body;
  params.id = req.params.id || req.body.id;

  return params;
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
    var start = new Date();
    
    options.neo4j = utils.existsInQuery(req, 'neo4j');

    function callback (err, results, queries) {
      if (err || !results) {
        swe.notFound('users', res);
        return;
      }

      utils.writeResponse(res, results, queries, start);
    }

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
    var start = new Date();

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    var callback = function (err, results, queries) {
      if (err || !results) {
        swe.invalid('input', res);
        return;
      }

      utils.writeResponse(res, results, queries, start);
    };

    params = _prepareUserDataForInsert(req);

    Users.create(params, options, callback);
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
    var start = new Date();

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    if (!id) throw swe.invalid('id');

    params.id = id;

    var callback = function (err, results, queries) {
      if (err) throw swe.notFound('user');
      utils.writeResponse(res, results, queries, start);
    };

    Users.getById(params, options, callback);
  }
};

// Route: POST '/users/:id'
exports.updateById = {

  spec: {
    path: '/users/{id}',
    notes: 'updates an existing user',
    summary: 'Update a user',
    method: 'POST',
    type: 'object',
    items: {
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
    nickname : 'updateUser'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};
    var start = new Date();

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    if (!id) throw swe.invalid('id');

    var callback = function (err, results, queries) {
      if (err) throw swe.notFound('user');
      utils.writeResponse(res, results, queries, start);
    };

    params = _prepareUserDataForInsert(req);

    Users.update(params, options, callback);
  }
};
