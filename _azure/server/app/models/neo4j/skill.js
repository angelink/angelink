'use strict';

// ## Module Dependencies
var _ = require('lodash');

var Skill = function (_node) {
  _.extend(this, _node.data);
};

module.exports = Skill;
