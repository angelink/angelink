'use strict';

// ## Module Dependencies
var _ = require('lodash');

var Job = function (_node) {
  _.extend(this, _node.data);
};

module.exports = Job;
