'use strict';

/* jshint camelcase:false */

angular.module('n4j.pages.services')

  .service('$n4Jobs', function (_, Restangular) {

    this.list = function () {
      return Restangular.all('jobs').getList().then(function (jobs) {
        jobs = _.map(jobs, function (job) {
          var data = job.data;
          return data;
        });

        return jobs;
      });
    };

    this.get = function (id) {
      return Restangular.one('jobs', id).get();
    };

    return this;
  });