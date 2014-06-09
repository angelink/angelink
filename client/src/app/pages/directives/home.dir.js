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

  // .directive('viewChangeFx', function ($animate) {
  //   var link = function (scope, el) {

  //     scope.$on('enter fade-normal', function (el) {
  //       console.log('enter');
  //     });

  //   };

  //   return {
  //     link: link
  //   };
  // });