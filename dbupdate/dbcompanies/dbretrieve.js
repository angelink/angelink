var request = require('request')
  , fs = require('fs');

var ids = fs.readFileSync('id.txt');
for (var i = 0; i < ids.length; i++){
  var url = 'https://api.angel.co/1/startups/' + ids[i];
  request({uri : url}, function(err, res, body){
    if (err) console.error(err);
    fs.appendFile('db.txt', body, function(err){
      if (err) console.error(err);
    });
  });
}