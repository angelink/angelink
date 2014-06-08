'use strict';

// ## Module Dependences
var _ = require('lodash')
  , path = require('path')
  , fs = require('fs')
  , when = require('when')
  , log = require('../utils/logger');

// File Paths
var pexcf = path.resolve(__dirname, '../config.example.js')
  , pconf = path.resolve(__dirname, '../config.js');


function Config () {
  if (!(this instanceof Config)) {
    return new Config();
  }

  this._config = null;
}


/**
 * Get config synchronously
 */
Config.prototype.getSync = function () {
  if (!this._config) {
    this.loadSync();
  }

  return this._config;
};


/**
 * Load config file synchronously
 */
Config.prototype.loadSync = function () {
  var env = process.env.NODE_ENV || 'development';

  if (!fs.existsSync(pconf)) {
    this.createSync(); // create new config file
  }

  this._original = require('../config.js')[env];
  this._config = _.clone(this._original);
};


/**
 * Create config file synchronously
 */
Config.prototype.createSync = function () {
  
  log.info('Creating new config file...');

  if (!fs.existsSync(pexcf)) {
    log.error('Could not find config.example.js for read');
    throw new Error();
  }

  // Copy config.example.js => config.js
  fs.writeFileSync(pconf, fs.readFileSync(pexcf));
};


/**
 * Load config file asynchronously
 */
Config.prototype.load = function () {
  
  var self = this
    , deferred = when.defer();
  
  // Check for config file and copy from config.example.js if it doesn't
  fs.exists(pconf, function checkConfig (exists) {
    
    var pending = null;
    var env = process.env.NODE_ENV || 'development';

    if (!exists) pending = self.create();
    when(pending).then(function () {
      
      // save the original and create a clone
      self._original = require('../config.js')[env];
      self._config = _.clone(self._original);

      deferred.resolve();
    });
  });

  return deferred.promise;
};


/** 
 * Create config file asynchronously
 */
Config.prototype.create = function () {

  var written = when.defer();

  // Copy from config.example.js => config.js
  fs.exists(pexcf, function checkTemplate (exists) {
    
    var read, write;

    log.info('Creating new config file...');

    if (!exists) {
      log.error('Could not find config.example.js for read');
    }

    // Copy config.example.js => config.js
    read = fs.createReadStream(pexcf);
    read.on('error', function (err) {
      log.error('Could not open config.example.js for read', err);
      return;
    });

    write = fs.createWriteStream(pconf);
    write.on('error', function (err) {
      log.error('Could not open config.js for write', err);
      return;
    });

    read.pipe(write);
    read.on('end', written.resolve);
  });

  return written.promise;
};

module.exports = Config;
