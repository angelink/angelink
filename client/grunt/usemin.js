'use strict';

// Replaces references to non-optimized scripts or stylesheets in html files
// based on rev and the useminPrepare configuration

module.exports = {
  options: {
    assetsDirs: [
      // List of directories to look for revved version of the assets 
      // referenced in the currently looked at file.
      '<%= paths.dist.tld %>',
      '<%= paths.dist.tld %>/images'
    ],
    patterns: {
      js: [[/(images\/\w+\.(png|jpg|jpeg|gif|webp|svg))/, 'Replacing reference to images in js files']]
    }
  },
  html: [
    '<%= paths.dist.tld %>/{,*/}*.html',
  ],
  css: [
    '<%= paths.dist.tld %>/styles/*.css'
  ],
  js: [
    '<%= paths.dist.tld %>/scripts/*.templates.js'
  ]
};