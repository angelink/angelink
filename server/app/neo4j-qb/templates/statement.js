'use strict';

// ## Query Statement Mixin Functions

// ## Module Dependencies
var _ = require('lodash');
var util = require('util');
var utils = require('../utils');


// ## Utilities

var _setTemplate = function (name, key, value) {
  if (value !== undefined) {
    return util.format('%s.%s = %s', name, key, value);
  } else {
    return util.format('%s.%s = {%s}', name, key, key);
  }
};

var _whereTemplate = function (name, key, paramKey) {
  return util.format('%s.%s = {%s}', name, key, paramKey || key);
};

// ## Exports


// Returns a 'match' statement
exports.match = function (name) {
  return util.format('MATCH (%s:%s)', name.toLowerCase(), utils.capitalize(name));
};


// Returns a 'merge' statement
exports.merge = function (name, keys) {
  var pattern = _.map(keys, function (key) {
    return util.format('%s:{%s}', key, key);
  });

  return util.format('MERGE (%s:%s {%s})', name.toLowerCase(), utils.capitalize(name), pattern);
};


// Returns a 'set' statement
exports.set = function (name, params) {
  var qs = 'SET ';
  var query = _.map(params, function (val, key) {
    return _setTemplate(name, key, val);
  });

  if (query.length) {
    return qs + query.join(', ');
  } else {
    return '';
  }
};


// Returns a 'where' statement
exports.where = function (name, keys) {
  name = name.toLowerCase();

  if (_.isArray(name)) {
    _.map(name, function (obj) {
      return _whereTemplate(obj.name, obj.key, obj.paramKey);
    });
  } else if (keys && keys.length) {
    return 'WHERE '+_.map(keys, function (key) {
      return _whereTemplate(name, key);
    }).join(' AND ');
  }
};