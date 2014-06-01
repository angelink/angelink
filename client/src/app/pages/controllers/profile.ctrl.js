'use strict';

angular.module('n4j.pages.controllers')
  .controller('ProfileCtrl', function ($scope) {
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
    };
  });