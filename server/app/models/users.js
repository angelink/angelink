'use strict';

// ## Module Dependencies
var _ = require('lodash');

// var User = require('./neo4j/user.js');
var Architect = require('neo4j-architect');
var defaultResponseObject = require('../utils').defaultResponseObject;

Architect.init();

var Construct = Architect.Construct;
var QueryBuilder = require('../neo4j-qb/qb.js');

// var request = require('request');

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(
    process.env.NEO4J_URL ||
    process.env.GRAPHENEDB_URL ||
    'http://localhost:7474'
);

// Presently only schema properties are being used in the query builder. 
// The value doesn't matter right now.
var schema = {
  userId: String,
  firstname: String,
  lastname: String,
  email: String,
  linkedInToken: String,
  profileImage: String
};

var qb = new QueryBuilder('User', schema);
var User = null; // defined here to prevent jshint throwing a fit


// ## Results Functions
// To be combined with queries using Construct

// return a single user
var _singleUser = function (results, callback) {
 
  var response = _.extend({}, defaultResponseObject);
  response.object = 'user';

  if (results.length) {
    var _data = results[0].user._data;
    response.data = new User(_data);
    callback(null, response);
  } else {
    callback(null, response);
  }
};

// return many users
var _manyUsers = function (results, callback) {
  
  var response = _.extend({}, defaultResponseObject);
  var users = _.map(results, function (result) {
    var _data = result.user._data;
    return new User(_data);
  });

  response.data = users;
  response.object = 'list';
  callback(null, response);
};


// ## Query Functions
// Should be combined with results functions using Construct

var _matchByUUID = qb.makeMatch(['userId']);

var _matchAll = qb.makeMatch();

var _create = (function () {
  
  var onCreate = {
    created: 'timestamp()'
  };

  return qb.makeMerge(['userId'], onCreate);
})();

// var _createRelationship = qb.makeRelate();

var _update = qb.makeUpdate(['userId']);

var _delete = qb.makeDelete(['userId']);

var _deleteAll = qb.makeDelete();

var _createManySetup = function (params, callback) {
  if (params.users && _.isArray(params.users)) {
    callback(null, _.map(params.users, function (user) {
      return _.pick(user, Object.keys(schema));
    }));
  } else {
    callback(null, []);
  }
};


// ## Constructed Functions

var create = new Construct(_create, _singleUser);

// create many new users
var createMany = new Construct(_createManySetup).map(create);

// create relationship
// var createRelationship = new Construct(_createRelationship);

var getById = new Construct(_matchByUUID).query().then(_singleUser);
// var getById = new Construct(_matchByUUID, _singleUser);

var getAll = new Construct(_matchAll, _manyUsers);

// get a user by userId and update their properties
var update = new Construct(_update, _singleUser);

// delete a user by userId
var deleteUser = new Construct(_delete);

// delete a user by userId
var deleteAllUsers = new Construct(_deleteAll);


// ## User Model


// @param _data {object} the raw data object from neo4j
var User = function (_data) {
  _.extend(this, _data);

  // get the id from the self property returned by neo4j
  this.id = +this.self.split('/').pop();
};

// instance methods:

// relationships:
User.prototype.knows = function (toUser, callback) {
  var that = this;
  var query = [];
  
  query.push('START a=node({from}), b=node({to})');
  query.push('CREATE UNIQUE (a)-[:KNOWS]->(b)');
  var qs = query.join('\n');

  db.query(qs, {from: that.id, to: toUser.id}, callback);
};

User.prototype.joined = function (toUsers, callback) {
  var that = this;
  var query = [];
  
  query.push('START a=node({from}), b=node({to})');
  query.push('CREATE UNIQUE (a)-[:JOINED {date:timestamp()}]->(b)');
  var qs = query.join('\n');

  db.query(qs, {from: that.id, to: toUsers.id}, callback);
};

User.prototype.hasSkill = function (toSkill, callback) {
  var that = this;
  var query = [];
  
  query.push('START a=node({from}), b=node({to})');
  query.push('CREATE UNIQUE (a)-[:HAS_SKILL]->(b)');
  var qs = query.join('\n');

  db.query(qs, {from: that.id, to: toSkill.id}, callback);
};


// static methods:
User.create = create.done();
User.createMany = createMany.done();
User.deleteUser = deleteUser.done();
User.deleteAllUsers = deleteAllUsers.done();
User.getById = getById.done();
User.getAll = getAll.done();
User.update = update.done();

module.exports = User;
