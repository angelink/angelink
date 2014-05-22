'use strict';

// Allow the use of non-minsafe AngularJS files. Automatically makes it
// minsafe compatible so Uglify does not destroy the ng references

module.exports = {
  compiled: {
    files: [{
      expand: true,
      cwd: '<%= paths.compiled.tld %>/concat/scripts',
      src: [
        // List of files that need to be made min-safe
        'app.concat.js',
        'app.vendor.js'
      ],
      dest: '<%= paths.compiled.tld %>/concat/scripts'
    }]
  }
};