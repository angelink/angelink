'use strict';

var livereload, log;

// Module Dependencies
log = require('../utils/logger');

livereload = function (server, config) {
  log.info('Injecting livereload script at port ' + config.livereload);
  server.use(require('connect-livereload')({port: config.livereload}));
};

module.exports = livereload;