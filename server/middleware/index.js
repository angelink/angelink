'use strict';

// Module dependencies
var express = require('express');

var livereload = require('./livereload');
// var enableCORS = require('./enableCORS');

var middleware = function (server, config) {

  // log requests to the console
  server.use(express.logger('dev'));

  // setup encrypted session cookies
  if (config.server.secret) {
    server.use(express.cookieParser());
    server.use(express.session({secret: config.server.secret}));
  }

  // For security sake, it's better to disable file upload if your application doesn't need it. 
  // To do this, don't use the bodyParser and multipart() middleware
  // @see http://expressjs.com/api.html#bodyParser
  server.use(express.json());
  server.use(express.urlencoded());

  server.use(express.methodOverride());

  // allow CORS
  // server.use(enableCORS);

  var viewEngine;

  // ## Views

  // views directory
  server.set('views', config.dirs.views);

  // view engine
  switch (config.viewEngine) {
    case 'jade':
      server.set('view engine', 'jade');
      break;
    case 'ect':
      viewEngine = require('ect')({watch: true, root: server.get('views')});
      server.engine('ect', viewEngine.render);
      server.set('view engine', 'ect');
      break;
    case 'html' :
      viewEngine = require('ect')({watch: true, root: server.get('views')});
      server.engine('html', viewEngine.render); // assign ect as the engine for html files
      server.set('view engine', 'html'); // set .html as the default extension
      break;
  }

  // ## Livereload 
  if (config.livereload) {
    livereload(server, config);
  }

  // ## Static Files
  
  // return the correct mime type for woff filess
  express.static.mime.define({'application/font-woff': ['woff']});

  // Set the directory(s) to serve static files from
  if (config.dirs.static) {
    var staticDirs, maxAge;
    staticDirs = [].concat(config.dirs.static);
    maxAge = 30 * 24 * 60 * 60 * 1000; // 30 day cache control in milliseconds 
    for (var i = staticDirs.length - 1; i >= 0; i--) {
      server.use(express.static(staticDirs[i], {maxAge: maxAge}));
    }
  }

  // ## Error Handler
  // Picks up any left over errors and returns a nicely formatted server 500 error
  server.use(express.errorHandler());
};

module.exports = middleware;