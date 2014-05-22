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
  client: {
    tld: path.resolve(__dirname, '../src')
  },

  compiled: {
    tld: path.resolve(__dirname, '../.tmp')
  },

  test: {
    tld: path.resolve(__dirname, '../test')
  },

  dist: {
    tld: path.resolve(__dirname, '../dist')
  },

  heroku: {
    tld: path.resolve(__dirname, '../../_heroku')
  },

  azure: {
    tld: path.resolve(__dirname, '../../_azure')
  }
};