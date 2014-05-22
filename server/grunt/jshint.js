'use strict';

var path = require('path');

module.exports = {
  options: {
    jshintrc: '.jshintrc',
    reporter: require('jshint-stylish')
  },
  all: [
    path.resolve(__dirname, '../**/*.js'),
    '!' + path.resolve(__dirname, '../node_modules/**/*.js')
  ]
};