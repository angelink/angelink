var request = require('request')
  , fs = require('fs');

var url = 'https://api.angel.co/1/jobs';
request({uri : url}, function(err, res, body){
  if (err) console.error(err);
  //TODO: parse body before writing to db.txt
  fs.appendFile('db.txt', body, function(err){
    if (err) console.error(err);
  });
});