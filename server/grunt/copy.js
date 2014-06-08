'use strict';

module.exports = {
  // Copy files from server -> heroku/server
  heroku: {
    files: [{
      expand: true,
      cwd: '<%= paths.server.tld %>',
      src: [
        'app/**/*.js',
        'config/**/*.js',
        'utils/**/*.js',
        'middleware/**/*.js',
        'server.js',
        '!config.js'
      ],
      dest: '<%= paths.heroku.tld %>/server'
    }]
  },

  azure: {
    files: [{
      expand: true,
      cwd: '<%= paths.server.tld %>',
      src: [
        'app/**/*.js',
        'config/**/*.js',
        'utils/**/*.js',
        'middleware/**/*.js',
        'server.js',
        '!config.js'
      ],
      dest: '<%= paths.azure.tld %>/server'
    }]
  }
};