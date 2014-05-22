'use strict';

/**
 * General Utility Services
 */
angular.module('n4j.common.utils')
  
  // Allows lodash to be injected
  .factory('_', function () {
    return window._;
  })

  // utility function
  .factory('utils', function () {
    var utils = {};

    /**
     * Returns a random integer between min and max
     * Using Math.round() will give you a non-uniform distribution!
     */
    utils.getRandomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    return utils;
  });