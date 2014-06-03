'use strict';

angular.module('n4j.pages')
  .controller('BrowseCtrl', function (_, $scope, $state, $resource, $n4Jobs) {
    
    // Scope Assignments
    $n4Jobs.list().then(function (jobs) {
      $scope.jobs = jobs;
    });


    // Scope Assignments

    $scope.jobs = {};
    $scope.currentJob = null;
    $scope.listType = 'Recommended';

    // $scope.snapOpts = {
    //   disable: 'right'
    // };

    $scope.goTo = function (job) {
      $scope.currentJob = job;
      $state.go('app.recommended.detail', {id: job.id});
    };

    $scope.like = function (jobId) {
      console.log('like', jobId);
    };

    $scope.dislike = function (jobId) {
      console.log('dislike', jobId);
    };
  });
