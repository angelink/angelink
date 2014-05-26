'use strict';

exports.capitalize = function (str) {
  str = str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
};