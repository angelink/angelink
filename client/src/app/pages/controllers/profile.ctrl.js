'use strict';

angular.module('n4j.pages.controllers')
  .controller('ProfileCtrl', function ($scope, $http, SkillsFactory) {
    console.log($scope);

    //user details should be from UserService created on login
    $scope.user = {
      firstname: 'Peter',
      profileImage: 'http://cartwa.com/Puppies_files/PuppyIcon.jpg'
    };

    // SkillsFactory.get().then(function(skills){
    //   $scope.skills = {
    //     value: [],
    //     options: skills
    //   };
    // });

    $scope.skills = {
      value: [],
      options: ['backbonejs', 'angularjs', 'html', 'css', 'javascript', 'codingskillz']
    };

    //POST user data with skills as property to connect nodes to user
    $scope.submitSkills = function(){
      console.log($scope.skills.value);
      $http({method: 'POST', url: 'localhost:/3000/user', data: $scope.skills.value}).
        success(function() {
          console.log('POST skills success');
        }).
        error(function() {
          console.log('POST skills error');
        });
    };
  });