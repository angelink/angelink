'use strict';

// Handle cache busting for static files
module.exports = {
  images: '<%= paths.dist.tld %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
  js: '<%= paths.dist.tld %>/scripts/{,*/}*.js',
  css: '<%= paths.dist.tld %>/styles/{,*/}*.css',
  other: '<%= paths.dist.tld %>/fonts/*'
};