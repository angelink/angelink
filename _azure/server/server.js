'use strict';

// ## Module dependencies
var express = require('express')
  , http = require('http');

var Config = require('./config/index.js')
  , log = require('./utils/logger')
  , middleware = require('./middleware')
  , routes = require('./app/routes');

var cfg = new Config().getSync();

// Initializes the main server and api server (subpath)
var server = express();
var subpath = express();

log.info('Using configurations for ' + process.env.NODE_ENV);
log.info('Configurations loaded... initializing the server');

// ## Middlesware
middleware(server, cfg);

// configure /api path for api versioning and setup to only serve json
server.use(cfg.server.apiBasePath, subpath);
subpath.configure(function () {
  
  // just using json for the api
  subpath.use(express.json());
  subpath.use(express.urlencoded());
  
  subpath.use(express.methodOverride());
});

// ## Initialize Routes
routes.auth(server, cfg);
routes.api(subpath, cfg);
routes.swaggerui(server);

// Forward remaining requests to index
server.all('/*', function (req, res) {
  res.sendfile('index.html', {root: server.get('views')});
});

// Start the server
server.set('port', cfg.server.port);
http.createServer(server).listen(server.get('port'), function () {
  log.info('Express server listening on port ' + server.get('port'));
});

module.exports = server;