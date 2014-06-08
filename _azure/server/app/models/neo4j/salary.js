'use strict';

// ## Module Dependencies
var _ = require('lodash');

var Salary = function (_node) {
  _.extend(this, _node.data);
};

module.exports = Salary;