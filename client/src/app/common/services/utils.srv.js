'use strict';

/**
 * General Utility Services
 */

/* jshint bitwise:false */

angular.module('n4j.common.utils')
  
  // Allows lodash to be injected
  .factory('_', function () {
    return window._;
  })

  // utility function
  .factory('utils', function () {
    
    /**
     * Returns a random integer between min and max
     * Using ~~ because it is faster than Math.floor...
     */
    this.getRandomInt = function (min, max) {
      return ~~(Math.random() * (max - min + 1)) + min;
    };

    return this;
  });