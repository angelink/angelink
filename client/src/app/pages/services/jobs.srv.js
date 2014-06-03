'use strict';

/* jshint camelcase:false */

angular.module('n4j.pages.services')

  .service('$n4Jobs', function (_, Restangular) {

    this.list = function () {
      return Restangular.all('jobs').getList().then(function (jobs) {
        jobs = _.map(jobs, function (job) {
          var data = job.data;
          
          data.company = 'Twitter';
          data.posted = data.created;
          data.salary = {
            min: '80000',
            max: '120000'
          };

          return data;
        });

        return jobs;
      });
    };

    this.get = function (id) {
      return Restangular.one('jobs', id).get().then(function (job) {
        job.company = 'Twitter';
        job.posted = job.created;
        job.salary = {
          min: '80000',
          max: '120000'
        };

        return job;
      });
    };

    return this;
  });