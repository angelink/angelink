'use strict';

module.exports = {
  options: {
    // lets us delete stuff outside the current working directory
    force: true
  },

  serve: {
    files: '<%= paths.compiled.tld %>'
  },

  dist: {
    files: [{
      dot: true,
      src: [
        '<%= paths.compiled.tld %>',
        '<%= paths.dist.tld %>'
      ]
    }]
  },

  azure: {
    files: [{
      dot: true,
      src: [
        '<%= paths.azure.tld %>/client/scripts',
        '<%= paths.azure.tld %>/client/images',
        '<%= paths.azure.tld %>/client/fonts',
        '<%= paths.azure.tld %>/client/styles'
      ]
    }]
  },

  ngtemplates: '<%= paths.compiled.tld %>/scripts/*.templates.js'
};