'use strict';

// ## Module Dependencies
var _ = require('lodash');
var User = require('./neo4j/user.js');
var Architect = require('neo4j-architect');
var defaultResponseObject = require('../utils').defaultResponseObject;

Architect.init();

var Construct = Architect.Construct;
var Cypher = Architect.Cypher;

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

var _matchBy = function (keys, params, callback) {
  var cypherParams = _.pick(params, keys);

  var query = [
    'MATCH (user:User)',
    Cypher.where('user', keys),
    'RETURN user'
  ].join('\n');

  console.log('_matchBy query', query);

  callback(null, query, cypherParams);
};

var _matchByUUID = _.partial(_matchBy, ['id']);

var _matchAll = _.partial(_matchBy, []);

// creates the user with cypher
var _create = function (params, callback) {
  var cypherParams = {
    id: params.id,
    firstname: params.firstname,
    lastname: params.lastname
  };

  var query = [
    'MERGE (user:User {firstname: {firstname}, lastname: {lastname}, id: {id}})',
    'ON CREATE',
    'SET user.created = timestamp()',
    'ON MATCH',
    'SET user.lastLogin = timestamp()',
    'RETURN user'
  ].join('\n');

  console.log('create query', query);

  callback(null, query, cypherParams);
};

// update the user with cypher
// var _update = function (params, callback) {

//   var cypherParams = {
//     id : params.id,
//     firstname : params.firstname,
//     lastname : params.lastname,
//   };

//   var query = [
//     'MATCH (user:User {id:{id}})',
//     'SET user.firstname = {firstname}',
//     'SET user.lastname = {lastname}',
//     'RETURN user'
//   ].join('\n');

//   callback(null, query, cypherParams);
// };

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

// create a new user
var create = new Construct(_create, _singleUser);

var getById = new Construct(_matchByUUID).query().then(_singleUser);

var getAll = new Construct(_matchAll, _manyUsers);

// get a user by id and update their properties
// var update = new Construct(_update, _singleUser);

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
};