'use strict';

// ## Utility Functions to help build cypher queries

// ## Module Dependencies
var _ = require('lodash');

var query = require('./templates/query');

/**

Example Usage:

qb = new QueryBuilder('ModelName');

var _matchAll = qb.makeMatch();
var _matchByUUID = qb.makeMatch(['id']);

*/

var QueryBuilder = function (modelName, schema) {
  this.model = modelName;
  this.schema = schema;
};

QueryBuilder.prototype.makeMatch = function (keys) {

  var name = this.model;

  // Make sure that keys is an array
  keys = keys || [];
  if (typeof keys === 'string') keys = keys.split(', ');

  var func = function (keys, params, callback) {
    var cypherParams = _.pick(params, keys);
    var queryStr = query.match(name, keys);
    
    callback(null, queryStr, cypherParams);
  };

  return _.partial(func, keys);
};

QueryBuilder.prototype.makeMerge = function (keys) {
  
  var name = this.model;
  var schema = this.schema;

  var func = function (keys, params, callback, onCreate, onMatch) {

    // @TODO Make sure filtered parameters are part of the schema definition
    var filtered = _.extend(params, schema);
    var queryStr = query.merge(name, keys, filtered, onCreate, onMatch);

    console.log(queryStr);

    callback(null, queryStr, params);
  };

  return _.partial(func, keys);
};

module.exports = QueryBuilder;