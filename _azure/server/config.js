'use strict';

// ## Configurations
// Setup your installations for various environments

// Module dependencies
var path = require('path');

var config = {};

var PORT = process.env.PORT || 3000;
var SECRET = process.env.COOKIE_SECRET || 'secret';
var API_VERSION = 'v0';

console.log(process.env);

// ## Production Environment Configurations
config.production = {

  dirs: {
    views: path.resolve(__dirname, '../client'),
    static: path.resolve(__dirname, '../client')
  },
  
  livereload: false,
  
  server: {
    // Host to be passed to node's `net.Server#listen()`
    host: '127.0.0.1',

    secret: SECRET,

    // Port to be passed to node's `net.Server#listen()`
    port: PORT,

    // base url
    // baseUrl: 'http://angelink.azurewebsites.net',
    baseUrl: 'http://127.0.0.1:' + PORT,

    apiBasePath: '/api/' + API_VERSION
  },

  // https://developer.linkedin.com/documents/authentication
  linkedin: {
    // baseUrl: process.env.LINKEDIN_BASE_URL,
    baseUrl: 'http://angelink.azurewebsites.net',
    apiKey: process.env.LINKEDIN_APIKEY,
    secret: process.env.LINKEDIN_SECRET,
    state: process.env.LINKEDIN_STATE
  },

  // viewEngine: 'ect'
};

module.exports = config;