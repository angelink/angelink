'use strict';

module.exports = {
  options: {
    module: 'particle.templates', //  needs to match the name of an existing angular module
    htmlmin: {
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      removeComments: true, // Only if you don't use comment directives!
      removeEmptyAttributes: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    }
  },
  serve: {
    cwd: '<%= paths.client.tld %>/app',
    src: ['**/*.tpl.html'],
    dest: '<%= paths.compiled.tld %>/scripts/app.templates.js'
  },
  dist: {
    cwd: '<%= paths.client.tld %>/app',
    src: ['**/*.tpl.html'],
    dest: '<%= paths.dist.tld %>/scripts/app.templates.js'
  }
};