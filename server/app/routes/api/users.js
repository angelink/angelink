'use strict';

// ## Module Dependencies
var _ = require('lodash');
var sw = require('swagger-node-express');
var utils = require('../../utils');

// ## Collections
var Users = require('../../collections/users');

// ## Models
var User = require('../../models/users');

var param = sw.params;
var swe = sw.errors;


// ## Helpers
var _prepareParams = function (req) {
  var params = req.body;

  params.id = (req.params && req.params.id) || (req.body && req.body.id);

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
//   var errLabel = 'Route: POST /users';
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
    parameters : [
      param.query('type', 'Can be "all" or "users". Defaults to "users"', 'string', false),
    ],
    responseMessages: [swe.notFound('users')],
    nickname : 'getUsers'
  },

  action: function (req, res) {
    var options = {};
    var errLabel = 'Route: GET /users';
    var callback = _.partial(_callback, res, errLabel);
    
    options.neo4j = utils.existsInQuery(req, 'neo4j');

    if (req.query.type === 'all') {
      User.getAll(null, options, callback);
    } else {
      // User.getAll(null, options, callback);
      Users.get(null, options, callback);
    }
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
      param.form('skills', 'User skills. Should be an array of stringified skill objects.', 'array', false),
      param.form('roles', 'User past and present roles', 'array', false),
      param.form('location', 'User\'s current location', 'object', false)
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

    User.create(params, options).done(function (results) {
      var _results = [];
      var _queries = [];

      results = _.flatten(results);
      _.each(results, function (res) {
        if (res) {
          _results.push(res.results);
          _queries.push(res.queries);
        }
      });
      
      callback(null, _results, _queries);
    });
  }
};

// Route: POST '/users/batch'
exports.addUsers = {
  
  spec: {
    path : '/users/batch',
    notes : 'adds users to the graph',
    summary : 'Add multiple users to the graph',
    method: 'POST',
    type : 'object',
    parameters : [
      param.form('list', 'Array of user object JSON strings', 'array', true),
    ],
    responseMessages : [swe.invalid('list')],
    nickname : 'addUsers'
  },

  action: function(req, res) {
    var options = {};
    var params = req.body;
    var errLabel = 'Route: POST /users';
    var callback = _.partial(_callback, res, errLabel);
    var list = JSON.parse(params.list);

    if (!list.length) throw swe.invalid('list');

    // @TODO 
    // should probably check to see if all user objects contain the minimum
    // required properties (id, firstname, lastname, etc) and stop if not.

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    var getNextUser = function (index, length, collection) {
      var next = index + 1;
      if (next >= length) {
        next = 0;
      }

      return collection[next].node;
    };

    User.createMany({list:list}, options, function (err, results) {
      _.each(results, function (user, index, results) {
        var nextUser = getNextUser(index, results.length, results);

        user.node.knows(nextUser, function (err, res) {
          console.log(err, res);
        });
      });

      callback(err, results);
    });
  }
};

// Route: DELETE '/users'
exports.deleteAllUsers = {
  spec: {
    path: '/users',
    notes: 'Deletes all users and their relationships',
    summary: 'Delete all users',
    method: 'DELETE',
    type: 'object',
    nickname : 'deleteAllUsers'
  },

  action: function (req, res) {
    var options = {};
    var errLabel = 'Route: DELETE /users';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    User.deleteAllUsers(null, options, callback);
  }
};


// Route: GET '/users/:id'
exports.findById = {
  
  spec: {
    path: '/users/{id}',
    notes: 'Returns a user based on ID',
    summary: 'Find user by ID',
    method: 'GET',
    type: 'object',
    parameters : [
      param.path('id', 'ID of user that needs to be fetched', 'string'),
      param.query('optionalNodes', 'Can be "skills", "companies", "location" etc. Defaults to none', 'string', false)
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

    if (req.query.optionalNodes) {
      if (req.query.optionalNodes !== 'all') {
        params.related = JSON.parse(req.query.optionalNodes);
      } else if (req.query.optionalNodes === 'all') {
        // @TODO add locations
        params.related = ['skills'];
      }
    }

    User.getById(params, options).then(function (results) {
      callback(null, results.results, results.queries);
    });
  }
};

// Route: PUT '/users/:id'
exports.updateById = {

  spec: {
    path: '/users/{id}',
    notes: 'Updates an existing user',
    summary: 'Update a user',
    method: 'PUT',
    type: 'object',
    items: {
      $ref: 'User'
    },
    parameters : [
      param.path('id', 'ID of user that needs to be fetched', 'string'),
      param.form('firstname', 'User firstname', 'string', false),
      param.form('lastname', 'User lastname', 'string', false),
      param.form('email', 'User email', 'string', false),
      param.form('linkedInToken', 'LinkedIn OAuth Token', 'string', false),
      param.form('profileImage', 'User profile image url', 'string', false),
      param.form('skills', 'User skills. Should be an array of stringified skill objects.', 'array', false),
      param.form('roles', 'User past and present roles', 'array', false),
      param.form('location', 'User\'s current location', 'object', false)
    ],
    responseMessages : [swe.invalid('input')],
    nickname : 'updateUser'
  },

  action: function (req, res) {
    // var id = req.params.id;
    // var options = {};
    // var params = {};

    // if (!id) throw swe.invalid('id');

    // var errLabel = 'Route: POST /users/{id}';
    // var callback = _.partial(_callback, res, errLabel);

    // options.neo4j = utils.existsInQuery(req, 'neo4j');
    // params = _prepareParams(req);

    // User.update(params, options, callback);

    var id = req.params.id;
    var options = {};
    var params = {};
    var errLabel = 'Route: PUT /users/:id';
    var callback = _.partial(_callback, res, errLabel);

    if (!id) throw swe.invalid('id');

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    User.update(params, options).done(function (results) {
      var _results = [];
      var _queries = [];

      results = _.flatten(results);
      _.each(results, function (res) {
        if (res) {
          _results.push(res.results);
          _queries.push(res.queries);
        }
      });
      
      callback(null, _results, _queries);
    });
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

    User.deleteUser(params, options, callback);
  }
};

// Route: POST '/users/:userid/jobs/:jobid'
exports.rateJob = {

  spec: {
    path: '/users/{userId}/jobs/{jobId}',
    notes: 'Like or dislike job entry',
    summary: 'Rate job',
    method: 'POST',
    type: 'object',
    items: {
      $ref: 'User'
    },
    parameters : [
      param.path('userId', 'ID of user', 'string'),
      param.path('jobId', 'ID of job to be rated', 'string'),
      param.form('like', 'Like status', 'boolean', true)
    ],
    responseMessages : [swe.invalid('input')],
    nickname : 'rateJob'
  },

  action: function (req, res) {
    var id = req.params.userId;
    var jobId = req.params.jobId;
    var options = {};
    var params = {};

    if (!id || !jobId) throw swe.invalid('id');

    var errLabel = 'Route: POST /users/{userId}/jobs/{jobId}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    // params = _prepareParams(req);

    params.userId = req.params.userId;
    params.jobId = req.params.jobId;
    params.like = req.body.like;

    User.rateJob(params, options).done(function (results) {
      var _results = [];
      var _queries = [];

      results = _.flatten(results);
      _.each(results, function (res) {
        _results.push(res.results);
        _queries.push(res.queries);
      });
      
      callback(null, _results, _queries);
    });
  }
};

// Route: GET '/users/:id/jobs'
exports.getRecommendations = {
  
  spec: {
    path: '/users/{id}/jobs',
    notes: 'Returns recommended jobs to user',
    summary: 'Recommended jobs',
    method: 'GET',
    type: 'object',
    parameters : [
      param.path('id', 'ID of user that needs to be fetched', 'string')
    ],
    responseMessages : [swe.invalid('id'), swe.notFound('user')],
    nickname : 'getRecommendations'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    // params.id = req.params.id;

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: GET /users/{id}/jobs';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    User.getRecommendations(params, options).then(function (results) {
      // console.log(results);
      // array of all latest 20 jobs recommended
      callback(null, results);
    });
  }
};

// Route: DELETE '/users/:id/relationships'
exports.removeRelationships = {
  spec: {
    path: '/users/{id}/relationships',
    notes: 'Deletes user relationships',
    summary: 'Remove relationships',
    method: 'DELETE',
    type: 'object',
    parameters : [
      param.path('id', 'ID of user', 'string'),
      param.form('skills', 'User skills. Should be an array of stringified skill objects.', 'array', false),
      param.form('roles', 'User past and present roles', 'array', false),
      param.form('location', 'User\'s current location', 'object', false)
    ],
    responseMessages : [swe.invalid('id'), swe.notFound('user')],
    nickname : 'removeRelationships'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    // params.id = req.params.id;

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: DELETE /users/{id}/relationships';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    User.removeRelationships(params, options).then(function (results) {
      // console.log(results);
      // array of all latest 20 jobs recommended
      callback(null, results);
    });
  }
};
