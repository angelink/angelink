'use strict';

// ## Module Dependencies
var _ = require('lodash');

// var User = require('./neo4j/user.js');
var Architect = require('neo4j-architect');
var defaultResponseObject = require('../utils').defaultResponseObject;

Architect.init();

var Construct = Architect.Construct;
var QueryBuilder = require('../neo4j-qb/qb.js');


// Presently only schema properties are being used in the query builder. 
// The value doesn't matter right now.
var schema = {
  id: String,
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
    var user = new User(results[0].user);
    response._node = user._node;
    response.data = user._node.data;
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
// Should be combined with results functions using Construct

var _matchByUUID = qb.makeMatch(['id']);

var _matchAll = qb.makeMatch();

var _create = (function () {
  
  var onCreate = {
    created: 'timestamp()'
  };

  return qb.makeMerge(['id'], onCreate);
})();

var _update = qb.makeUpdate(['id']);

var _delete = qb.makeDelete(['id']);

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

// create = new Construct().query(_create).query(_createSkill).then(_singleUser);

var create = new Construct(_create, _singleUser);

// create many new users
var createMany = new Construct(_createManySetup).map(create);

var getById = new Construct(_matchByUUID).query().then(_singleUser);
// var getById = new Construct(_matchByUUID, _singleUser);

var getAll = new Construct(_matchAll, _manyUsers);

// get a user by id and update their properties
var update = new Construct(_update, _singleUser);

// delete a user by id
var deleteUser = new Construct(_delete);

// delete a user by id
var deleteAllUsers = new Construct(_deleteAll);


// ## User Model

var User = function (_node) {
  // All we store is the node. The rest of our properties will be
  // derivable or just pass-through properties.
  this._node = _node;
};

Object.defineProperty(User.prototype, '_id', {
  get: function () { return this._node.id; }
});

// Object.defineProperty(User.prototype, 'name', {
//   get: function () {
//     return this._node.data.name;
//   },
//   set: function (name) {
//     this._node.data.name = name;
//   }
// });

// instance methods:

// relationships:
User.prototype.knows = function (node, callback) {
  this._node.createRelationshipTo(node._node, 'knows', {}, callback);
};

User.prototype.joined = function (node, callback) {
  this._node.createRelationshipTo(node._node, 'joined', {}, callback);
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
