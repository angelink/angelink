'use strict';


// ## Module Dependencies
var _ = require('lodash');
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var passport = require('passport');
var request = require('request');

var Config = require('../config/index.js');
var cfg = new Config().getSync();

var getUser = function (params, callback) {

  var options = {
    url: 'http://127.0.0.1:3000/api/v0/users/' + params.id,
    method: 'GET',
    headers: {
      'api_key': 'special-key'
    },
    json: true
  };

  request(options, function (err, res, body) {
    
    if (err) {
      console.error('Error retrieving user', err);
      callback(err, null);
      return;
    }

    callback(err, body.node.data);
  });
};

var createOrUpdateUser = function (params, callback) {
  var options = {
    url: 'http://127.0.0.1:3000/api/v0/users',
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

    // return done(null, user.node.data);
    callback(err, user.node.data);
  });
};

exports.init = function () {

  passport.use(new LinkedInStrategy({
    clientID: cfg.linkedin.apiKey,
    clientSecret: cfg.linkedin.secret,
    callbackURL: cfg.server.baseUrl + '/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_fullprofile', 'r_network'],
  }, function (accessToken, refreshToken, profile, done) {
      
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
      getUser(params, function (err, user) {

        // if user doesn't exist or doesn't have a linkedin token...
        if (!user || !user.linkedInToken) {
          createOrUpdateUser(params, function (user) {
            return done(null, user);
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