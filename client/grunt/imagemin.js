'use strict';

module.exports = {
  dist: {
    files: [{
      expand: true,
      cwd: '<%= paths.client.tld %>/assets/images',
      src: '{,*/}*.{png,jpg,jpeg,gif,webp}',
      dest: '<%= paths.dist.tld %>/images'
    }]
  }
};