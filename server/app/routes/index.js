'use strict';

// Module Dependencies
var api = require('./api');
var auth = require('../auth');

// Initialize
auth.init();

exports.api = api;