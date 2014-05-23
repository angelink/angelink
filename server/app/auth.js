'use strict';

var passport = require('passport');
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

var Config = require('../config/index.js');
var cfg = new Config().getSync();

exports.init = function () {

  passport.use(new LinkedInStrategy({
    clientID: cfg.linkedin.apiKey,
    clientSecret: cfg.linkedin.secret,
    callbackURL: cfg.server.baseUrl + '/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_fullprofile', 'r_network'],
  }, function (accessToken, refreshToken, profile, done) {

      // console.log('profile', profile._json);

      // Need to save the token to databases and/or client session / JWT

      // asynchronous verification, for effect...
      process.nextTick(function () {
        // In a typical application, you would want to associate the account 
        // with a user record in your database, and return that user instead.
        return done(null, profile);
      });
    }
  ));

  // ** This happens after the above callback.
  passport.serializeUser(function(user, done) {
    console.log('serialize', user);
    done(null, user);
  });
};