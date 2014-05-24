'use strict';

// ## Module Dependencies
var _ = require('lodash');

var Person = function (_node) {
  _.extend(this, _node.data);
};

module.exports = Person;
