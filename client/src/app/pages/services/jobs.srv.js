'use strict';

/* jshint camelcase:false */

angular.module('n4j.pages.services')

  .service('$n4Jobs', function (_, Restangular, $n4Auth) {

    var user = $n4Auth.getUser();

    var _extractJobs = function (jobs) {
      var res = _.map(jobs, function (job) {
        var data = job.data;
        return data;
      });

      return res;
    };

    this.list = function () {
      // Just ONE GET to /users/:id/jobs
      return Restangular.one('users', user.id).getList('jobs').then(function (jobs) {
        return _extractJobs(jobs);
      });
    };

    return this;
  });