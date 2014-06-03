'use strict';

// ## Module Dependencies
var auth = require('../auth');
var crypto = require('crypto');
var passport =require('passport');

// ## Initialize Auth
auth.init();

// ## Util Functions
var generateState = function (sessionID) {
  var state = '';
  var shasum = crypto.createHash('sha1');
  
  // generate the state
  shasum.update(sessionID);
  state = shasum.digest('hex');

  return state;
};

var setSignedUserCookie = function (user, res) {

  // remove the linkedin token from the user object for security...
  delete user.linkedInToken;
  res.cookie('user', user, {
    signed: true,
    maxAge: 15 * 24 * 60 * 60 * 1000
  });
};

module.exports = function (server) {
  
  server.get('/auth/linkedin', function (req, res, next) {

    // state is used for security during authentication
    // @see http://developer.linkedin.com/documents/authentication
    var state = generateState(req.sessionID);

    // save the referer
    req.session.referer = req.header('Referer') || '/';

    // save state to session
    req.session.state = state;

    // if user cookie is set, redirect... 
    if (req.signedCookies.user) {
      if (req.session.referer.indexOf('login')) {
        res.redirect('/recommended');
      } else {
        res.redirect(req.session.referer);
      }
    }

    // otherwise authenticate
    else {
      passport.authenticate('linkedin', {
        state: state
      })(req, res, next);
    }
  });
  

  server.get('/auth/linkedin/callback', function (req, res, next) {

    // Check state before auth redirect to prevent CRSF
    if (req.query.state === req.session.state) {

      passport.authenticate('linkedin', function (err, user) {

        // set user cookie
        setSignedUserCookie(user, res);

        if (req.session.referer.indexOf('login')) {
          res.redirect('/recommended');
        } else {
          res.redirect(req.session.referer);
        }

      })(req, res, next);
    }
  });
};