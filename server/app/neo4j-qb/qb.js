'use strict';

// ## Utility Functions to help build cypher queries

// ## Module Dependencies
var _ = require('lodash');
var query = require('./templates/query');
var utils = require('./utils');

/**

When defining a schema, only schema properties are being used in the query builder. 
The value doesn't matter currently. Schema properties are used to prevent non-schema
defined properties from being inserted accidentally into the database.

Example Usage:

var schema = {
  id: String,
  firstname: String,
  lastname: String,
  email: String,
  linkedInToken: String,
  profileImage: String
};

qb = new QueryBuilder('ModelName', schema);

var _matchAll = qb.makeMatch();
var _matchByUUID = qb.makeMatch(['id']);

*/

var QueryBuilder = function (modelName, schema) {
  this.modelName = modelName;
  this.schema = schema;
};

QueryBuilder.prototype.makeDelete = function (keys) {

  var name = this.modelName;

  // Make sure that keys is an array
  keys = utils.forceArray(keys);
  var func = function (keys, params, callback) {
    var queryStr = query.del(name, keys);
    callback(null, queryStr, params);
  };

  return _.partial(func, keys);
};

QueryBuilder.prototype.makeMatch = function (keys) {

  var name = this.modelName;

  // Make sure that keys is an array
  keys = utils.forceArray(keys);

  var func = function (keys, params, callback) {
    var cypherParams = _.pick(params, keys);
    var queryStr = query.match(name, keys);
    
    callback(null, queryStr, cypherParams);
  };

  return _.partial(func, keys);
};


// Returns a 'merge' function
//
// Params of returned function:
// @param {params} object with data to be merged
// @param {callback} function to execute on completion of the merge
QueryBuilder.prototype.makeMerge = function (keys, onCreate, onMatch) {
  
  var name = this.modelName;
  var schema = this.schema;

  // Make sure that keys is an array
  keys = utils.forceArray(keys);

  var func = function (keys, params, callback) {

    var filtered = {};
    var queryStr = '';

    // Use the model schema to create a filtered params object.
    // Any property not defined in schema will not be copied over.
    // Value of all properties in the filtered params object will be set to 
    // 'undefined' so that the statement builder knows to use a placeholder.
    _.each(schema, function (val, key) {
      if (params[key]) {
        filtered[key] = undefined;
      }
    });

    queryStr = query.merge(name, keys, filtered, onCreate, onMatch);

    callback(null, queryStr, params);
  };

  return _.partial(func, keys);
};


QueryBuilder.prototype.makeUpdate = function (keys) {
  
  var name = this.modelName;
  var schema = this.schema;

  // Make sure that keys is an array
  keys = utils.forceArray(keys);

  var func = function (keys, params, callback) {

    var filtered = {};
    var queryStr = '';

    // Use the model schema to create a filtered params object.
    // Any property not defined in schema will not be copied over.
    // Value of all properties in the filtered params object will be set to 
    // 'undefined' so that the statement builder knows to use a placeholder.
    _.each(schema, function (val, key) {
      if (params[key]) {
        filtered[key] = undefined;
      }
    });

    queryStr = query.update(name, keys, filtered);

    callback(null, queryStr, params);
  };

  return _.partial(func, keys);
};

module.exports = QueryBuilder;