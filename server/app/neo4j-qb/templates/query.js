'use strict';

// ## Module Dependencies
var _ = require('lodash');
var statement = require('./statement');
var util = require('util');


// ## Exports

exports.del = function (name, keys) {
  var query = [];
  var queryStr = '';

  name = name.toLowerCase();

  query.push(statement.match(name, keys));
  query.push(util.format('OPTIONAL MATCH (%s)-[rel]-()', name));
  query.push(util.format('DELETE %s, rel', name));
  queryStr = query.join('\n');

  return queryStr;
};

exports.match = function (name, keys) {
  var query = [];
  var queryStr = '';

  name = name.toLowerCase();

  // Either the uncommented or commented version below will work
  // There is no difference between the two expect that the second
  // uses the where clause while the first just uses a match pattern
  query.push(statement.match(name, keys));

  // alt version... comment out the above if used
  // query.push(statement.match(name)); 
  // query.push(statement.where(name, keys));

  query.push('RETURN ' + name);
  queryStr = query.join('\n');

  return queryStr;
};


// Returns a 'merge' query
//
// @params keys {array} array of keys to use to build the matching pattern
//
// @params schema {object}
//  Object containing a key value map of model.property to its value. If the value is
//  undefined then the model.property will map to a placeholder. This should be a subset 
//  of the model schema.
//
// @params onCreate {object} 
//  Object containing onCreate specific set patterns. If the value is undefined then
//  the model.property will map to a placeholder. If value is set then it will map to that 
//  value in the pattern, for example:
//    
//  {firstname: undefined} ===> model.firstname = {firstname}
//  {created: 'timestamp()'} ===> model.created = 'timestamp()'
//
// @params onMatch {object}
//  Object containing onCreate specific set patterns. Works the same as onCreate.
//
exports.merge = function (name, keys, params, onCreate, onMatch) {
  var onCreateStatement = '';
  var onMatchStatement = '';
  var query = [];
  var queryStr = '';

  // Clone params so that we don't accidentally cause side effects
  var clonedParams = _.clone(params);

  name = name.toLowerCase();

  _.each(keys, function (val) {
    delete clonedParams[val];
  });

  onCreateStatement = statement.set(name, _.extend(_.clone(clonedParams), onCreate));
  onMatchStatement = statement.set(name, _.extend(_.clone(clonedParams), onMatch));

  if (onCreateStatement) onCreateStatement = 'ON CREATE ' + onCreateStatement;
  if (onMatchStatement) onMatchStatement = 'ON MATCH ' + onMatchStatement;

  query.push(statement.merge(name, keys));
  query.push(onCreateStatement);
  query.push(onMatchStatement);
  query.push('RETURN ' + name);
  queryStr = query.join('\n');

  return queryStr;
};

// @TODO
exports.relate = function (from, to, relName, props) {};

exports.update = function (name, keys, params) {
  var query = [];
  var queryStr = '';

  // Clone params so that we don't accidentally cause side effects
  var clonedParams = _.clone(params);

  name = name.toLowerCase();

  _.each(keys, function (val) {
    delete clonedParams[val];
  });

  query.push(statement.match(name, keys));
  query.push(statement.set(name, clonedParams));
  query.push('RETURN ' + name);
  queryStr = query.join('\n');

  return queryStr;
};