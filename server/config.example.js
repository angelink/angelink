'use strict';

// ## Configurations
// Setup your installations for various environments

// Module dependencies
var path = require('path');

var config = {};

var PORT = process.env.PORT || 3000;
var API_VERSION = 'v0';

// ## Development Environment Configurations
config.development = {
  db: {},
  
  dirs: {
    views: path.resolve(__dirname, '../client'),
    static: [
      path.resolve(__dirname, '../client/src'),
      path.resolve(__dirname, '../client/src/assets'),
      path.resolve(__dirname, '../client/.tmp'),
      path.resolve(__dirname, '../client/.tmp/concat')
    ]
  },

  livereload: 35729,
  
  server: {
    // Host to be passed to node's `net.Server#listen()`
    host: '127.0.0.1',

    // secret to be used for sessions
    secret: 'shhhhhhhhhhhh',

    // base url for site
    baseUrl: process.env.BASE_URL || 'http://127.0.0.1:' + PORT,

    apiBasePath: '/api/' + API_VERSION,

    // Port to be passed to node's `net.Server#listen()`
    port: PORT
  },

  // viewEngine: 'ect'
};


// ## Production Environment Configurations
config.production = {
  db: {},
  
  dirs: {
    views: path.resolve(__dirname, '../client'),
    static: path.resolve(__dirname, '../client')
  },
  
  livereload: false,
  
  server: {
    // Host to be passed to node's `net.Server#listen()`
    host: '127.0.0.1',

    // secret to be used for sessions
    secret: 'shhhhhhhhhhhh',

    // base url for site
    baseUrl: process.env.BASE_URL || 'http://127.0.0.1:' + PORT,

    apiBasePath: '/api/' + API_VERSION,

    // Port to be passed to node's `net.Server#listen()`
    port: process.env.PORT || 3000
  },

  // viewEngine: 'ect'
};

module.exports = config;