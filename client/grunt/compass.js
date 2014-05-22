'use strict';

module.exports = {
  options: {
    sassDir: '<%= paths.client.tld %>/assets/styles',
    imagesDir: '<%= paths.client.tld %>/assets/images',
    fontsDir: '<%= paths.client.tld %>/assets/fonts',
    importPath: '<%= paths.client.tld %>/components',
    httpImagesPath: '/images',
    httpGeneratedImagesPath: '/images/generated',
    httpFontsPath: '/styles/fonts',
    relativeAssets: false,
    assetCacheBuster: false,
    // raw: 'Sass::Script::Number.precision = 10\n'
  },
  serve: {
    options: {
      debugInfo: true,
      cssDir: '<%= paths.compiled.tld %>/styles',
      generatedImagesDir: '<%= paths.compiled.tld %>/images/generated'
    }
  },
  dist: {
    options: {
      cssDir: '<%= paths.compiled.tld %>/styles',
      generatedImagesDir: '<%= paths.dist.tld %>/images/generated',
      environment: 'production'
    }
  }
};