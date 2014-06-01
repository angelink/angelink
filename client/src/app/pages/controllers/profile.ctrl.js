'use strict';

angular.module('n4j.pages.controllers')
  .controller('ProfileCtrl', function ($scope, $http) {
    console.log($scope);
    $scope.user = {
      firstname: 'Peter',
      profileImage: 'http://cartwa.com/Puppies_files/PuppyIcon.jpg'
    };

    $scope.skills = {
      value: [],
      options: ['backbonejs', 'angularjs', 'html', 'css', 'javascript']
    };

    $scope.submitSkills = function(){
      console.log($scope.skills.value);
      //POST skills to server and connect nodes to the user
      $http({method: 'POST', url: 'localhost:/3000/user', data: $scope.skills.value}).
        success(function() {
          console.log('POST skills success');
        }).
        error(function() {
          console.log('POST skills error');
        });
    };
  });