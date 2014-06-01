'use strict';

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