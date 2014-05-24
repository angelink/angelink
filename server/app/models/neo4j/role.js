'use strict';

// ## Module Dependencies
var _ = require('lodash');

var Role = function (_node) {
  _.extend(this, _node.data);
};

module.exports = Role;