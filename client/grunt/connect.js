'use strict';

// The connect server settings
var liveReloadPort = 35720;

module.exports = {
  options: {
    port: 9000,
    // Change this to '0.0.0.0' to access the server from outside.
    hostname: 'localhost',
    livereload: liveReloadPort
  },
  
  livereload: {
    options: {
      open: false,
      base: [
        // Directories to serve static files from
        '<%= paths.compiled.tld %>',
        '<%= paths.client.tld %>',
        '<%= paths.client.tld %>/assets',
      ]
    }
  },

  dist: {
    options: {
      // Directories to serve static files from
      base: '<%= paths.dist.tld %>'
    }
  }
};