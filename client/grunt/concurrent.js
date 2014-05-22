'use strict';

// Tasks to run concurrently to speed up the build process

module.exports = {
  serve: [
    'compass:serve'
  ],
  dist: [
    'compass:dist',
    'newer:imagemin'
  ]
};