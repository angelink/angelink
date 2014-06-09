'use strict';

angular.module('n4j.pages.directives')

  .directive('setChartSize', function ($timeout) {
    
    var link = function (scope, el) {
      $timeout(function () {
        scope.chartConfig.size.width = el[0].clientWidth;
      }, 300);
    };

    return {
      link: link
    };
  });
