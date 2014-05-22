'use strict';

module.exports = {
  dist: {
    options: {
      removeCommentsFromCDATA: true,
      collapseBooleanAttributes: true,
      removeOptionalTags: true,
      // collapseWhitespace: true
    },
    files: {
      '<%= paths.dist.tld %>/index.html': '<%= paths.client.tld %>/index.html'
    }
  }
};