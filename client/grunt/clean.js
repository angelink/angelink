'use strict';

module.exports = {
  options: {
    // lets us delete stuff outside the current working directory
    // force: true 
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

  ngtemplates: '<%= paths.compiled.tld %>/scripts/*.templates.js'
};