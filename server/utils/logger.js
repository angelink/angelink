'use strict';

/* jshint unused:false */

// Module Dependencies
var util = require('util')
  , colors = require('colors');

var log = {
  info: function () {

    var output = ''
      , args = Array.prototype.slice.call(arguments);

    for (var i = 0; i < args.length; i++) {
      output += util.inspect(args[i]) + '\n';
    }

    console.log(''); // add a new line
    console.log('Info:'.blue, output.blue);
  },
  warn: function () {

    var output = ''
      , args = Array.prototype.slice.call(arguments);

    for (var i = 0; i < args.length; i++) {
      output += util.inspect(args[i]) + '\n';
    }

    console.log(''); // add a new line
    console.log('Warning:'.yellow, output.yellow);
  },
  error: function () {

    var output = ''
      , args = Array.prototype.slice.call(arguments);

    for (var i = 0; i < args.length; i++) {
      output += util.inspect(args[i]) + '\n';
    }

    console.error(''); // add a new line
    console.error('ERROR:'.red, output.red);
  }
};

module.exports = log;