'use strict';

module.exports = {
  express: {
    files: [
      'app/**/*.js',
      'middleware/**/*.js',
      'models/**/*.js',
      'routes/**/*.js',
      'server.js',
      'utils/**/*.js'
    ],
    tasks:  ['express:dev']
  },
  options: {
    //Without this option the specified express won't be reloaded
    nospawn: true
  }
};
