'use strict';

module.exports = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // All cross origin requests will be preceded by an options request...
  // so we need to make sure to respond with 200
  if ('OPTIONS' === req.method) {
    res.send(200);
    return;
  }
  
  next();
};