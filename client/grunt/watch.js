'use strict';

var liveReloadPort = 35729;

module.exports = {
  options: {
    livereload: liveReloadPort
  },

  gruntfile: {
    files: ['Gruntfile.js']
  },

  js: {
    files: ['<%= paths.client.tld %>/app/{,*/}*.js'],
    tasks: [
      'newer:jshint:app',
    ]
  },

  compass: {
    files: ['<%= paths.client.tld %>/assets/styles/{,*/}*.{scss,sass}'],
    tasks: ['compass:serve'],
  },

  livereload: {
    files: [
      '<%= paths.client.tld %>/index.html', // client side index file
      '<%= paths.client.tld %>/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
      '<%= paths.compiled.tld %>/scripts/**/*.js',
      '<%= paths.compiled.tld %>/styles/**/*.css'
    ]
  },

  // recompile angular templates
  ngtemplates: {
    files: ['<%= paths.client.tld %>/app/**/*.tpl.html'],
    tasks: ['clean:ngtemplates', 'ngtemplates:serve']
  }
}