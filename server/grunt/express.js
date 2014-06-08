'use strict';

/* jshint camelcase:false */

var path = require('path');

module.exports = {
  options: {
    script: path.resolve(__dirname, '../server.js'),
    port: 3000
  },
  dev: {
    options: {
      node_env: 'development',
      debug: true
    }
  },
  dist: {
    options: {
      node_env: 'production'
    }
  },
  azure: {
    options: {
      node_env: 'azure'
    }
  }
};