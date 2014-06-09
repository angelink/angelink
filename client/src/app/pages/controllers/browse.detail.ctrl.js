'use strict';

angular.module('n4j.pages')
  .controller('BrowseDetailCtrl', function (_, $rootScope, $scope, $stateParams, $n4Jobs, jobs, user, $timeout) {

    // Make sure that the currentJob matches the id in the url
    // 
    // @TODO figure out why we can't deeplink to a job direcly
    // if (!$scope.currentJob || String($scope.currentJob.id) !== $stateParams.id) {
    //   var currentJob = _.find(jobs, function (job) {
    //     return String(job.id) === $stateParams.id;
    //   });

    //   $rootScope.$emit('set:currentJob', currentJob);
    //   $scope.currentJob = currentJob;
    // }

    var userSkills = _.map(user.skills, function (skill) {
      return skill.data.normalized;
    });

    // Chart colors
    var colors = ['#F25A29', '#AD62CE', '#30B6AF', '#FCC940', '#FF6C7C', '#4356C0', '#DFE1E3'];


    // Map all properties of $scope.currentJob to $scope
    _.each($scope.currentJob, function (val, key) {
      $scope[key] = val;
    });

    $scope.jobTitle = $scope.title;

    $scope.hasSkill = function (skill) {
      return _.contains(userSkills, skill.normalized);
    };

    $scope.isOldJob = function (date) {

      var today = new Date();

      date = Date.parse(date);

      return (today - date) > 6 * 30 * 24 * 60 * 60 * 1000;
    };

    // ## Highchart Configurations
    $scope.chartDateRange = 'day';

    $scope.chartConfig = {
      options: {
        colors: colors,
        legend: {
          align: 'center',
          floating: false,
          itemStyle: {
            fontSize: '10px'
          },
          symbolHeight: 12,
          symbolWidth: 12,
          verticalAlign: 'top'
        },
        plotOptions: {
          series: {
            lineWidth: 2
          },
          area: {
            fillOpacity: 0.2,
            dashStyle: 'ShortDot'
          }
        },
        chart: {
          type: 'area',
        }
      },
      series: [
        {
          name: 'Applicants',
          yAxis: 0,
          pointInterval: 24 * 60 * 60 * 1000,
          pointStart: Date.UTC(2014, 5, 28),
          data: [5, 10, 15, 12, 8, 7, 18],
          style: {
            color: colors[0]
          }
        },
        {
          name: 'Angel List Score',
          yAxis: 1,
          pointInterval: 24 * 60 * 60 * 1000,
          pointStart: Date.UTC(2014, 5, 28),
          data: [36, 51, 47, 67, 72, 80, 74],
          style: {
            color: colors[1]
          }
        }
      ],
      size: {
        height: 300,
        width: 300
      },
      title: {
        style: {
          display: 'none'
        }
      },
      xAxis: [
        {
          // tickInterval: 24 * 60 * 1000,
          dateTimeLabelFormats: {
            month: '%b %y',
            year: '%y',
            day: '%d'
          },
          // minRange: 7 * 24 * 60 * 60 * 1000, // 7 days
          type: 'datetime',
          showFirstLabel: false,
          showLastLabel: false,
          startOnTick: false,
          // tickPixelInterval: 24 * 60 * 1000,
        }
      ],
      yAxis: [
        { // Primary yAxis
          title: {
            text: 'Applicants',
            style: {
              display: 'none',
              color: colors[0]
            }
          },
          labels: {
            style: {
              'font-size': '10px',
              'font-weight': 'bold',
              color: colors[0]
            }
          }
        }, { // Secondary yAxis
          gridLineWidth: 0,
          title: {
            text: 'Angel List Score',
            style: {
              display: 'none',
              color: colors[1]
            }
          },
          labels: {
            style: {
              'font-size': '10px',
              'font-weight': 'bold',
              color: colors[1]
            }
          },
          opposite: true
        }
      ],
      loading: false
    };
  });
