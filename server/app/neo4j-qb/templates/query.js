'use strict';

// ## Module Dependencies
var _ = require('lodash');
var statement = require('./statement');

exports.match = function (name, keys) {
  var query = [];
  var queryStr = '';

  name = name.toLowerCase();
  query.push(statement.match(name));
  query.push(statement.where(name, keys));
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
exports.merge = function (name, keys, filtered, onCreate, onMatch) {
  // var filtered = _.pick(schema, params);
  var onCreateStatement = '';
  var onMatchStatement = '';
  var query = [];
  var queryStr = '';

  name = name.toLowerCase();

  _.each(keys, function (val) {
    delete filtered[val];
  });

  console.log('merge:36', filtered);

  onCreateStatement = statement.set(name, _.extend(filtered, onCreate));
  onMatchStatement = statement.set(name, _.extend(filtered, onMatch));

  if (onCreateStatement) onCreateStatement = 'ON CREATE ' + onCreateStatement;
  if (onMatchStatement) onMatchStatement = 'ON MATCH ' + onMatchStatement;

  query.push(statement.merge(name, keys));
  query.push(onCreateStatement);
  query.push(onMatchStatement);
  query.push('RETURN ' + name);
  queryStr = query.join('\n');

  return queryStr;
};