'use strict';

// ## Utility Functions

var _;

// Module dependencies
_ = require('lodash');

// Merge params with defaults... BUT unlike lodash.defaults 
// this ensures no value not in default are added
function params (args, defaults) {
  var merged, purge;
  
  args = args || {};
  purge = [];

  // if a parameter string was passed in turn it into an object
  if ('string' === typeof(args)) {
    var _args = {};
    args.split(/,\s?/).forEach(function (el) {
      var kv, key, val;

      kv = el.split('=');
      key = kv[0];
      val = kv[1];

      _args[key] = val;
    });

    args = _args;
  }

  // Merge with defaults... ensure no value not in default are added
  merged = _.mapValues(defaults, function (v, k) {

    var newval = v; // set to default value initially
    
    if (undefined !== args[k]) {
      newval = args[k];

      if ('string' === typeof(newval)) {
        // convert string bool to bool
        if (newval.match(/^true|false$/i)) {
          newval = /true/i.test(newval);
        }
        // convert string int to int
        else if (newval.match(/^\d+$/)) {
          newval = parseInt(newval);
        }
      }
    }

    // create a list of keys of undefined/null values so we can purge it later
    if (undefined === newval || null === newval) purge.push(k);
    return newval;
  });

  // remove all undefined from merged
  for (var i = purge.length - 1; i >= 0; i--) {
    delete merged[purge[i]];
  }

  return merged;
}

module.exports = {
  params: params
};