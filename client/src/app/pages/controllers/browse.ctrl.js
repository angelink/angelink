'use strict';

angular.module('n4j.pages')
  .controller('BrowseCtrl', function (_, $scope) {
    $scope.snapOpts = {
      disable: 'right'
    };

    $scope.listType = 'Recommended';


    // temp
    $scope.jobs = _.map(_.range(20), function () {
      var job = {
        company: 'Twitter',
        title: 'Frontend Engineer',
        salary: {
          min: '80000',
          max: '120000'
        },
        skills: ['AngularJS', 'BackboneJS', 'HTML/CSS', 'NodeJS'],
        posted: 'June 1, 2014'
      };

      console.log(job);

      return job;
    });

    $scope.currentJob = null;

    var colors = ['#F25A29', '#AD62CE', '#30B6AF', '#FCC940', '#FF6C7C', '#4356C0', '#DFE1E3'];

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
        height: 250
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
