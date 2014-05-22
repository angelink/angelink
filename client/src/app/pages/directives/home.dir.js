'use strict';

angular.module('n4j.pages.directives')

  .directive('home', function () {
    var def = {};
    
    def = {
      priority: 10,
      link: function () {}
    };

    return def;
  });