'use strict';

angular.module('n4j.pages')
  .controller('BrowseCtrl', function (_, $scope, $state, $stateParams, $resource, jobs, $n4Jobs) {

    // Scope Assignments
    $scope.jobs = jobs;
    $scope.currentJob = null;
    $scope.listType = 'Recommended';

    $scope.goTo = function (job) {
      $scope.currentJob = job;
      $state.go('app.browse.detail', {id: job.id});
    };

    $scope.like = function (jobId) {
      console.log('like', jobId);
    };

    $scope.dislike = function (jobId) {
      console.log('dislike', jobId);
    };

    // Currently there is nothing to show on the browse.list page so instead
    // send the user to the first recommended job.
    //
    // @TODO 
    // use the browse.list page to display some sort of summary of jobs for the user
    if (!$stateParams.id) {
      $scope.goTo(jobs[0]);
    }
  });
