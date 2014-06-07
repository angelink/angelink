'use strict';

var request = require('request')
  , helpers = require('./dbjobshelpers.js')
  , http = require('http')
  , cronJob = require('cron').CronJob
  , _ = require('lodash/dist/lodash.underscore');

var port = 8080;
var ip = '127.0.0.1';
var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello World\n");
});
server.listen(8080);
console.log('Server running at http://127.0.0.1:8080/');

var dbretrieveTest = function () {
  var url = 'https://api.angel.co/1//tags/1692/jobs?page=1';
  request({uri : url}, function(err, res, body){
    if (err) console.error(err);
    var jobs = JSON.parse(body).jobs;
    // ## Only make one job to test cronJob
    console.log('look at me, im dbretrieving test');
    var job = helpers.parseObj(jobs[0]);
    var jobURL = 'https://api.angel.co/1/startups/' + job.company.id;
    request({uri : jobURL}, helpers.appendJob(job));
  });
};

var jobTest = new cronJob({
  cronTime: '0 */1 * * * *',
  onTick: function() {
    // Runs every minute
    console.log('look at me, im cron-ing test');
    dbretrieveTest();
  },
  start: false
});

var dbretrieveLive = function () {
  console.log('look at me, im dbretrieving live');
  _.each(new Array(10), function(value, index){
    var page = index+1;
    var url = 'https://api.angel.co/1//tags/1692/jobs?page=' + page;
    request({uri : url}, function(err, res, body){
      if (err) console.error(err);
      var jobs = JSON.parse(body).jobs;

      //## Run through every job on the page
      _.each(jobs, function (value, index) {
        var job = helpers.parseObj(value);
        var jobURL = 'https://api.angel.co/1/startups/' + job.company.id;
        request({uri : jobURL}, helpers.appendJob(job));
      });
    });
  });
};

var jobLive = new cronJob({
  cronTime: '0 0 0 * * *',
  onTick: function() {
    // Runs every day at midnight
    console.log('look at me, im cron-ing live');
    dbretrieveLive();
  },
  start: false
});

// jobTest.start();
// jobLive.start();
// dbretrieveLive();
dbretrieveTest();