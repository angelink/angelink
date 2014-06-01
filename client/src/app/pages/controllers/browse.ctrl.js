'use strict';

angular.module('n4j.pages')
  .controller('BrowseCtrl', function (_, $scope) {
    $scope.snapOpts = {
      disable: 'right'
    };


    // temp
    $scope.jobs = _.map(_.range(5), function () {
      var job = {
        company: 'Twitter',
        title: 'Frontend Engineer',
        salary: {
          min: '80000',
          max: '120000'
        },
        skills: ['AngularJS', 'BackboneJS', 'HTML/CSS', 'NodeJS']
      };

      return job;
    });
  });
