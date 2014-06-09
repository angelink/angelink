'use strict';

// ## Module Dependencies
var _ = require('lodash');
var crypto = require('crypto');
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var passport = require('passport');
var request = require('request');
var url = require('url');

var Config = require('../config/index.js');
var cfg = new Config().getSync();

// ## Helpers

var _getTimeToNearestMin = function (min) {
  
  // Set Defaults
  min = min || 5;
  
  var coeff = 1000 * 60 * min;
  var date = new Date();
  var rounded = new Date(Math.round(date.getTime() / coeff) * coeff);

  return rounded;
};

var _getUser = function (req, params, callback) {

  var urlObj = _.pick(req, ['protocol', 'auth']);
  urlObj.host = req.get('host');
  urlObj.pathname = '/api/v0/users/' + params.id;

  var endpoint = url.format(urlObj);
  var oneTimeToken = exports.getOneTimeToken();

  var options = {
    url: endpoint,
    method: 'GET',
    headers: {
      'api_key': 'special-key',
      'X-AUTH-ONETIMETOKEN': oneTimeToken
    },
    json: true
  };

  request(options, function (err, res, body) {
    
    if (err) {
      console.error('Error retrieving user', err);
      callback(err, null);
      return;
    }

    // If the user is not found then body will not have 
    // a node property...
    if (body.node) {
      callback(err, body.node.data);
    } else {
      callback(err, null);
    }
  });
};

var _createOrUpdateUser = function (req, params, callback) {

  var urlObj = _.pick(req, ['protocol', 'auth']);
  urlObj.host = req.get('host');
  urlObj.pathname = '/api/v0/users/';

  var endpoint = url.format(urlObj);

  var options = {
    url: endpoint,
    method: 'POST',
    headers: {
      'api_key': 'special-key'
    },
    json: params
  };
  
  // Save the token and user info to databases
  request(options, function (err, res, body) {

    if (err) {
      console.error('Could not create user', err);
      callback(err, null);
      return;
    }
    
    var arr = _.remove(body, function (obj) {
      return obj.object === 'User';
    });

    var user = arr[0];

    callback(err, user.node.data);
  });
};

exports.init = function () {

  passport.use(new LinkedInStrategy({
    clientID: cfg.linkedin.apiKey,
    clientSecret: cfg.linkedin.secret,
    callbackURL: cfg.linkedin.baseUrl + '/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_fullprofile', 'r_network'],
    passReqToCallback: true
  }, function (req, accessToken, refreshToken, profile, done) {
      
      var params = {};

      // Prepare Data
      params.email = profile._json.emailAddress;
      params.firstname = profile._json.firstName;
      params.lastname = profile._json.lastName;
      params.id = profile._json.id;
      params.location = profile._json.location;
      params.profileImage = profile._json.pictureUrl;
      
      params.skills = _.map(profile._json.skills.values, function (obj) {
        return obj.skill;
      });

      params.linkedInToken = accessToken;

      // check if user exists
      _getUser(req, params, function (err, user) {

        // if user doesn't exist or doesn't have a linkedin token...
        if (!user || !user.linkedInToken) {
          _createOrUpdateUser(req, params, function (err, user) {

            if (err) {
              console.error('Error creating user');
            }

            return done(err, user);
          });
        } else {
          return done(null, user);
        }
      });
    }
  ));

  // ** This happens after the above callback.
  // @NOTE Auth will fail without this for some reason
  passport.serializeUser(function(user, done) {
    done(null, user);
  });
};

exports.getOneTimeToken = function () {
  var token = '';
  var shasum = crypto.createHash('sha1');
  var secret = cfg.server.secret;
  var time = _getTimeToNearestMin();

  // generate the token
  shasum.update(time + secret);
  token = shasum.digest('hex');

  return token;
};

exports.verifyOneTimeToken = function (token) {
  if (!token) return;
  return token === exports.getOneTimeToken();
};