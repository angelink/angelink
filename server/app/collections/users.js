'use strict';

// ## Module Dependencies
var _ = require('lodash');
var Architect = require('neo4j-architect');
var db = require('../db');
var QueryBuilder = require('../neo4j-qb/qb.js');
var utils = require('../utils');

Architect.init();

var Construct = Architect.Construct;

// Presently only schema properties are being used in the query builder. 
// The value doesn't matter right now.
var schema = {
  count: Number,
};

// The first variable is the label and should be exactly the same as
// the Class variable name and Class.prototype.collectionName
var qb = new QueryBuilder('Users', schema);


var Users = function (_data) {
  _.extend(this, _data);

  // get the id from the self property returned by neo4j
  this.nodeId = +this.self.split('/').pop();
};

// Must be exactly the same as the Class variable name above
Users.prototype.collectionName = 'Users'; // NOT USED 

// Must be exactly the same name as the Model Class Variable
Users.prototype.modelName = 'User';


// ## Results Functions
// To be combined with queries using _.partial()

var _collection = _.partial(utils.formatSingleResponse, Users);
var _collectionNodes = _.partial(utils.formatManyResponse, Users);


// ## Query Functions
// Should be combined with results functions using _.partial()

var _delete = qb.makeDelete();

var _getNodes = function (params, callback) {
  var qs = '';
  var query = [];

  query.push('MATCH (users:Users)-[joined:JOINED]-(user)');
  query.push('RETURN user');
  qs = query.join('\n');

  callback(null, qs, {});
};

var _match = qb.makeMatch();

// ## Constructed Functions

var get = new Construct(_match, _collection);

var getNodes = new Construct(_getNodes, _collectionNodes);

// delete collection
var deleteCollection = new Construct(_delete);

// static methods:

Users.create = function () {
  var qs = '';
  var query = [];

  query.push('MERGE (u:Users)');
  query.push('RETURN u');
  qs = query.join('\n');

  db.query(qs, {}, _.noop);
};

Users.getNode = get.done();
Users.get = getNodes.done();
Users.deleteCollection = deleteCollection.done();

// Create Collection:
//
// This is done here because it needs to be done only once 
// and we know we will always need it.
Users.create();

module.exports = Users;