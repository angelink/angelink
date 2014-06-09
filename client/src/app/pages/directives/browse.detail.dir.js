'use strict';

angular.module('n4j.pages.directives')

  .directive('setChartSize', function (_, $window) {

    var ctrl = function ($scope) {
      this.resizeHandler = function (el) {
        $scope.chartConfig.size.width = el[0].clientWidth;
        $scope.$apply();
      };
    };
    
    var link = function (scope, el, attrs, ctrl) {
      
      setTimeout(function () {
        ctrl.resizeHandler(el);
      }, 100);

      angular.element($window).bind('resize', _.debounce(function () {
        ctrl.resizeHandler(el);
      }, 100));
    };

    return {
      controller: ctrl,
      link: link
    };
  });
