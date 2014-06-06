'use strict';

angular.module('n4j.pages.controllers')
  .controller('ProfileCtrl', function (_, $state, $scope, $n4User, growl) {

    var _user = null;

    $n4User.get().then(function (user) {
      _user = _.pick(user, ['firstname', 'lastname', 'email']);
      $scope.user = _.clone(_user);
    });

    $n4User.getSkills().then(function (skills) {
      $scope.skills = skills;
    });

    $n4User.getLocations().then(function (locations) {
      $scope.locations = locations;
    });

    $scope.save = function () {
      // see if the data actually changed
      if (_.isEqual(_user, $scope.user)) {
        growl.addInfoMessage('Nothing Changed');
      } else {
        // @TODO set up some data validation before saving
        $n4User.save($scope.user).then(function () {
          growl.addSuccessMessage('Profile Successfully Updated');
        });
      }
    };

    $scope.deleteAccount = function () {
      $n4User.del().then(function () {
        growl.addSuccessMessage('Sorry to see you go.');

        // Give us time to display the success message
        setTimeout(function () {
          $state.go('home');
        }, 1500);
      });
    };
  });