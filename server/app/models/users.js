'use strict';

// ## Module Dependencies
var _ = require('lodash');
// var util = require('util');

var User = require('./neo4j/user.js');
var Architect = require('neo4j-architect');
var defaultResponseObject = require('../utils').defaultResponseObject;

Architect.init();

var Construct = Architect.Construct;
// var Cypher = Architect.Cypher;
var QueryBuilder = require('../neo4j-qb/qb.js');

var schema = {
  id: undefined,
  firstname: undefined,
  lastname: undefined,
  email: undefined,
  linkedInToken: undefined,
  profileImage: undefined
};

var qb = new QueryBuilder('User', schema);

// ## Helper Functions
// var _buildSetQuery = function (model, key, value) {
//   if (value !== undefined) {
//     return util.format('%s.%s = %s', model, key, value);
//   } else {
//     return util.format('%s.%s = {%s}', model, key, key);
//   }
// };

// ## Results Functions
// To be combined with queries using _.partial()

// return a single user
var _singleUser = function (results, callback) {
 
  var response = _.extend({}, defaultResponseObject);
  response.object = 'user';

  if (results.length) {
    response.data = new User(results[0].user);
    callback(null, response);
  } else {
    callback(null, response);
  }
};

// return many users
var _manyUsers = function (results, callback) {
  
  var response = _.extend({}, defaultResponseObject);
  var users = _.map(results, function (result) {
    return new User(result.user);
  });

  response.data = users;
  response.object = 'list';
  callback(null, response);
};


// ## Query Functions
// Should be combined with results functions using _.partial()

var _matchByUUID = qb.makeMatch(['id']);

var _matchAll = qb.makeMatch();

// creates the user with cypher
// @TODO 
// Need to change this so that an error is thrown if the user already exists
// or alternatively use MERGE instead of CREATE but only merge the items that
// that are not set
// var _create = function (params, callback) {

//   var defaults = {
//     id: params.id,
//     firstname: params.firstname,
//     lastname: params.lastname,
//     email: params.email,
//     linkedInToken: params.linkedInToken,
//     profileImage: params.profileImage
//   };

//   var cypherParams = _.pick(defaults, params);
  
//   // var cypherParams = {
//   //   id: params.id,
//   //   firstname: params.firstname,
//   //   lastname: params.lastname,
//   //   email: params.email,
//   //   linkedInToken: params.linkedInToken,
//   //   profileImage: params.profileImage
//   // };

//   var query = 'MERGE (user:User {id: {id}})';

//   var _userSetQuery = _.partial(_buildSetQuery, 'user');

//   // If parameters are present, build the query part for ON CREATE and ON MATCH
//   var onCreateQuery = [];
//   var onMatchQuery = [];
  
//   _.each(cypherParams, function (value, key) {
//     if (key !== 'id' && value) {
//       onCreateQuery.push(_userSetQuery(key));
//       onMatchQuery.push(_userSetQuery(key));
//     }
//   });

//   onCreateQuery.push(_userSetQuery('created', 'timestamp()'));
//   onCreateQuery = 'ON CREATE SET ' + onCreateQuery.join(', ');

//   if (onMatchQuery.length > 0) {
//     onMatchQuery = 'ON MATCH SET ' + onMatchQuery.join(', ');
//   }

//   // @NOTE
//   // Probably need to figure out a way to make sure that this cannot be changed once
//   // it has been set. The way this is currently implemented it can be overwritten
//   if (cypherParams.linkedInToken && cypherParams.email) {
//     onCreateQuery.push(_userSetQuery('joined', 'timestamp()'));
//     onMatchQuery.push(_userSetQuery('joined', 'timestamp()'));
//   }

//   // A MERGE query must be formatted something like this:
//   //
//   // MERGE (user:User {id: {id}}) 
//   // ON CREATE SET user.firstname = {firstname}, user.lastname = {lastname}
//   // ON MATCH SET user.firstname = {firstname}, user.lastname = {lastname}
//   // RETURN user
//   query = util.format('%s\n%s\n%s\n%s', query, onCreateQuery, onMatchQuery, 'RETURN user');

//   callback(null, query, cypherParams);
// };

var _create = qb.makeMerge(['id']);

// update the user with cypher
var _update = function (params, callback) {

  var cypherParams = {
    id: params.id,
    firstname: params.firstname,
    lastname: params.lastname,
    email: params.email,
    linkedInToken: params.linkedInToken,
    profileImage: params.profileImage,
  };

  var query = ['MATCH (user:User {id:{id}})'];
  
  // If parameters are present, set them
  if (cypherParams.firstname) query.push('SET user.firstname = {firstname}');
  if (cypherParams.lastname) query.push('SET user.lastname = {lastname}');
  if (cypherParams.email) query.push('SET user.email = {email}');
  if (cypherParams.linkedInToken) query.push('SET user.linkedInToken = {linkedInToken}');
  if (cypherParams.profileImage) query.push('SET user.profileImage = {profileImage}');
  
  query.push('RETURN user');
  query.join('\n');

  callback(null, query, cypherParams);
};

// delete the user and any relationships with cypher
var _delete = function (params, callback) {
  var cypherParams = {
    id: params.id
  };

  var query = [
    'MATCH (user:User {id:{id}})',
    'OPTIONAL MATCH (user)-[r]-()',
    'DELETE user, r',
  ].join('\n');

  callback(null, query, cypherParams);
};

// delete all users
var _deleteAll = function (params, callback) {
  var cypherParams = {};

  var query = [
    'MATCH (user:User)',
    'OPTIONAL MATCH (user)-[r]-()',
    'DELETE user, r',
  ].join('\n');

  callback(null, query, cypherParams);
};

// ## Constructed Functions

var create = new Construct(_create, _singleUser);

var getById = new Construct(_matchByUUID).query().then(_singleUser);

var getAll = new Construct(_matchAll, _manyUsers);

// get a user by id and update their properties
var update = new Construct(_update, _singleUser);

// delete a user by id
var deleteUser = new Construct(_delete);

// delete a user by id
var deleteAllUsers = new Construct(_deleteAll);

// export exposed functions
module.exports = {
  getById: getById.done(),
  create: create.done(),
  getAll: getAll.done(),
  deleteUser: deleteUser.done(),
  deleteAllUsers: deleteAllUsers.done(),
  update: update.done()
};