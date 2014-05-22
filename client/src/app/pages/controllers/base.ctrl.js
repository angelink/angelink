'use strict';

angular.module('n4j.pages.controllers')
  .controller('BaseCtrl', function ($rootScope, $scope, $state, $stateParams, _) {
    var getBodyId, getBodyClasses;

    getBodyId = function () {
      if ($state.current.data && $state.current.data.bodyId)
        return $state.current.data.bodyId;
    };

    getBodyClasses = function () {
      var classes, merged;
      
      // List of element classes to return
      classes = [];
      
      // Retrieve the Custom Classes 
      if ($state.current.data && $state.current.data.bodyClasses) {
        classes = classes.concat($state.current.data.bodyClasses.split(' '));
      }
      
      // Set Default Classes
      if ($stateParams.page) {
        // if the page parameter is included, ignore the page part and grab the parent state name
        classes.push('page-' + $state.$current.parent.name.replace(/\./,'-'));
      }
      else {
        classes.push('page-' + $state.current.name.replace(/\./g,'-'));
      }

      // Class name built using merged $stateParam values
      merged = 'page';
      _.forEach($stateParams, function (val, key) {
        if ('page' === key) return; // skip page number
        merged += '-' + val;
        classes.push(merged);
      });

      return classes.join(' ');
    };

    $rootScope.$on('$stateChangeSuccess', function () {
      $scope.bodyId = getBodyId();
      $scope.bodyClasses = getBodyClasses();
    });
  });