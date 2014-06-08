'use strict';

// ## Module Dependencies
var crypto = require('crypto');

exports.capitalize = function (str) {
  str = str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
};

exports.forceArray = function (obj) {
  var res = obj;

  if (!res) return [];
  if (Array.isArray(res)) return res;

  // Make sure that res is an array
  if (typeof res === 'string') res = res.split(', ');
  if (typeof res === 'object') res = Object.keys(res);

  return res;
};

exports.createId = function (obj) {
  var shasum = crypto.createHash('sha1');
    
  shasum.update(JSON.stringify(obj), 'utf8');
  var id = shasum.digest('hex').slice(0, 6);

  return id;
};