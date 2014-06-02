'use strict';


// ## Module Dependencies
var _ = require('lodash');
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var passport = require('passport');
var request = require('request');

var Config = require('../config/index.js');
var cfg = new Config().getSync();

exports.init = function () {

  passport.use(new LinkedInStrategy({
    clientID: cfg.linkedin.apiKey,
    clientSecret: cfg.linkedin.secret,
    callbackURL: cfg.server.baseUrl + '/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_fullprofile', 'r_network'],
  }, function (accessToken, refreshToken, profile, done) {

      // console.log('profile', typeof profile._json);
      
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
          return console.error('Could not create user', err);
        }
        
        var arr = _.remove(body, function (obj) {
          return obj.object === 'User';
        });

        var user = arr[0];

        return done(null, user.node.data);
      });


      // asynchronous verification, for effect...
      // process.nextTick(function () {
      //   // In a typical application, you would want to associate the account 
      //   // with a user record in your database, and return that user instead.
        
      // });
    }
  ));

  // ** This happens after the above callback.
  // @NOTE Auth will fail without this for some reason
  passport.serializeUser(function(user, done) {
    done(null, user);
  });
};