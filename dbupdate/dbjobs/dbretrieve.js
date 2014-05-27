var request = require('request')
  , fs = require('fs')
  , helpers = require('./dbjobshelpers.js');

var url = 'https://api.angel.co/1/jobs';
request({uri : url}, function(err, res, body){
  if (err) console.error(err);
  var jobs = body.jobs;
  for (var i=0; i<jobs.length; i++){
    var job = helpers.parseObj(jobs[i]);
    var jobURL = 'https://api.angel.co/1/startups/' + job.company_id;
    request({uri : jobURL}, function(err, res, body){
      if (err) console.error(err);
      job.size = body.company_size;
      fs.appendFile('db.txt', job + '\n', function(err){
        if (err) console.error(err);
      });
    });
  }

  // console.log(helpers.parseAngelObj);
  
});