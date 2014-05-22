'use strict';

// Add vendor prefixed styles

module.exports = {
  options: {
    browsers: ['last 1 version']
  },
  dist: {
    files: [{
      expand: true,
      cwd: '<%= paths.compiled.tld %>/styles/',
      src: '{,*/}*.css',
      dest: '<%= paths.compiled.tld %>/styles/'
    }]
  }
};