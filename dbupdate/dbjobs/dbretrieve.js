'use strict';

var request = require('request')
  , helpers = require('./dbjobshelpers.js');

var url = 'https://api.angel.co/1/jobs';
request({uri : url}, function(err, res, body){
  if (err) console.error(err);
  var jobs = JSON.parse(body).jobs;
  for (var i=0; i<jobs.length; i++){
    var job = helpers.parseObj(jobs[i]);
    var jobURL = 'https://api.angel.co/1/startups/' + job.company_id;
    request({uri : jobURL}, helpers.appendJob(job));
  }  
});

