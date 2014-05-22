'use strict';

var path = require('path');

// ## Directory and File Path Configuration

// To reference files from within your grunt tasks use:
// - <%= paths.client.tld %>
// - <%= paths.compiled.tld %>
// - <%= paths.test.tld %>
// - <%= paths.dist.tld %>
// - <%= paths.heroku.tld %>
// - <%= paths.azure.tld %>

module.exports = {
  server: {
    tld: path.resolve(__dirname, '../')
  },

  heroku: {
    tld: path.resolve(__dirname, '../../_heroku')
  },

  azure: {
    tld: path.resolve(__dirname, '../../_azure')
  }
};