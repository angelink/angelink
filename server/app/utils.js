'use strict';

// ## Module Dependencies
var _ = require('lodash');
var url = require('url');
var crypto = require('crypto');

// ## Default Response Object

var defaultResponseObject = {
  object: '', // String descriptor for data type, either model name or list 
  data: null // Null, Object, Array
};

exports.defaultResponseObject = defaultResponseObject;

// ## Utility Functions

exports.setHeaders = function (res, queries, start) {
  res.header('Duration-ms', new Date() - start);
  if (queries) {
    res.header('Neo4j', JSON.stringify(queries));
  }
};

exports.writeResponse = function (res, results, queries, start) {
  exports.setHeaders(res, queries, start);
  res.send(results);
};

exports.getQueryValue = function (req, key) {
  return url.parse(req.url, true).query[key];
};

exports.getBodyParam = function (req, key) {
  // console.log(req.body)
  return req.body[key];
};

exports.existsInQuery = function (req, key) {
  return url.parse(req.url, true).query[key] !== undefined;
};

exports.createId = function (obj) {
  var shasum = crypto.createHash('sha1');
    
  shasum.update(JSON.stringify(obj), 'utf8');
  var id = shasum.digest('hex').slice(0, 6);

  return id;
};

exports.normalizeString = function (string) {
  var res = string.toLowerCase().trim();
  return res;
};

exports.urlSafeString = function (string) {
  var res = string.toLowerCase().trim();
  res = res.replace(/([^\w-_])/gi, '-');
  return res;
};

exports.formatSingleResponse = function (Model, results, callback) {
  var response = _.extend({}, defaultResponseObject);
  var modelName = Model.prototype.modelName;

  response.object = modelName;

  if (results.length) {
    var _data = results[0][modelName.toLowerCase()]._data;

    response.data = new Model(_data);
    callback(null, response);
  } else {
    callback(null, response);
  }
};

exports.formatManyResponse = function (Model, results, callback) {
  var response = _.extend({}, defaultResponseObject);
  var modelName = Model.prototype.modelName;

  var list = _.map(results, function (result) {
    var _data = result[modelName.toLowerCase()]._data;

    return new Model(_data);
  });

  response.data = list;
  response.object = 'list';
  callback(null, response);
};