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


module.exports = function (server) {
  
  server.get('/auth/linkedin', function (req, res, next) {

    // state is used for security during authentication
    // @see http://developer.linkedin.com/documents/authentication
    var state = generateState(req.sessionID);

    // save the referer
    req.session.referer = req.header('Referer') || '/';

    // save state to session
    req.session.state = state;

    console.log(req.session);

    passport.authenticate('linkedin', {
      state: state
    })(req, res, next);
  });
  

  server.get('/auth/linkedin/callback', function (req, res) {

    // Check state before auth redirect to prevent CRSF
    if (req.query.state === req.session.state) {
      if (req.session.referer.indexOf('login')) {
        res.redirect('/recommended/123');
      } else {
        res.redirect(req.session.referer);
      }
    }
  });
};