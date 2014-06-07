'use strict';

angular.module('n4j.pages')
  .controller('BrowseCtrl', function (_, $rootScope, $scope, $state, $stateParams, $resource, jobs, $n4User, $n4Jobs, growl) {

    // Scope Assignments
    $scope.jobs = jobs;
    $scope.currentJob = null;
    $scope.listType = 'Recommended';

    // @TODO figure out why we can't deeplink to a job direcly
    // $rootScope.$on('set:currentJob', function (currentJob) {
    //   $scope.currentJob = currentJob;
    // });

    var loadMore = function () {

      var type = '';
      var listType = $scope.listType;

      if (listType === 'Likes') type = 'likes';
      if (listType === 'Latest') type = 'latest';

      $n4Jobs.list(type).then(function (jobs) {
        
        var ids = _.map(jobs, function (job) {
          return job.id;
        });

        jobs = _.filter(jobs, function (job) {
          return !_.contains(ids, job.id);
        });

        $scope.jobs = $scope.jobs.concat(jobs);
      });
    };

    $scope.goTo = function (job) {
      $scope.currentJob = job;
      $state.go('app.browse.detail', {id: job.id});
    };

    $scope.rate = function (job, rating) {
      var jobId = job.id;
      var msg = '';

      // Find the index of the job in the list so that we can
      // remove it
      var index = _.findIndex(jobs, function (job) {
        return job.id === jobId;
      });

      if (rating === 'like') {
        msg = 'Successfully liked ' + job.title;
      } else {
        msg = 'Successfully disliked ' + job.title;
      }

      $n4User.rateJob(jobId, rating).then(function () {

        growl.addSuccessMessage(msg);

        // Remove the job from $scope.jobs and if 
        // currentJob.id === jobId load the next job
        if ($scope.currentJob.id === jobId) {
          $scope.goTo($scope.jobs[index+1]);
        }

        $scope.jobs.splice(index, 1);

        if ($scope.jobs.length <= 10) {
          loadMore();
        }
      });
    };

    $scope.archive = function (job) {
      // @TODO
      console.log('@TODO Archive', job);
    };

    $scope.show = function (listType) {
      var type = '';

      if (listType === 'Likes') type = 'likes';
      if (listType === 'Latest') type = 'latest';

      $scope.listType = listType;

      $n4Jobs.list(type).then(function (jobs) {
        $scope.jobs = jobs;
      });
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
