'use strict';

/* jshint camelcase:false */

angular.module('n4j.pages.services')

  .service('$n4Jobs', function (_, Restangular, $n4Auth) {

    var user = $n4Auth.getUser();

    var _extractJobs = function (jobs) {
      var res = _.map(jobs, function (job) {
        var data = job.data;
        // console.log(data);
        return data;
      });

      console.log(res);
      return res;
    };

    this.list = function () {
      // Just ONE GET to /users/:id/jobs
      return Restangular.one('users', user.id).getList('jobs').then(function (jobs) {
        return _extractJobs(jobs);
      });

      // Restangular.one('users', user.id).get().then(function (user) {
      //   console.log(user);
      // });

      // Get all jobs
      // return Restangular.all('jobs').getList().then(function (jobs) {
      //   jobs = _.map(jobs, function (job) {
      //     var data = job.data;
      //     return data;
      //   });

      //   return jobs;
      // });
    };

    this.get = function (id) {
      return Restangular.one('jobs', id).get();
    };

    return this;
  });