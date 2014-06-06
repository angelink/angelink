'use strict';

// ## Module Dependencies
var auth = require('../auth');
var crypto = require('crypto');
var passport =require('passport');
var request = require('request');

var Config = require('../../config/index.js');
var cfg = new Config().getSync();

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

var _login = function (user, req, res, next) {
  req.login(user, function (err) {

    if (err) {
      return next(err);
    }

    if (req.session.referer.indexOf('login')) {
      res.redirect('/browse/list');
    } else {
      res.redirect(req.session.referer);
    }
  });
};

module.exports = function (server) {

  server.get('/auth/currentUser', function (req, res) {
    
    if (req.signedCookies.user) {

      var user = req.signedCookies.user;
      var baseUrl = cfg.server.baseUrl;
      var options = {
        url: baseUrl + '/api/v0/users/' + user.id,
        method: 'GET',
        headers: {
          'api_key': 'special-key'
        },
        qs: {
          optionalNodes: 'all'
        },
        json: true
      };

      request(options, function (err, response, body) {
        
        if (err) {
          console.error('Error retrieving user', err);
          res.send(402, err);
          return;
        }

        res.send(200, {object: 'User', node: body.node});
      });

      return;
    }

    res.send(401, {
      message: 'Please login to view this'
    });
  });

  server.get('/auth/logout', function (req, res) {
    
    // Delete session and user cookie
    req.session = null;
    res.clearCookie('user');

    // send user back to index
    res.redirect('/');
  });
  
  server.get('/auth/linkedin', function (req, res, next) {

    // state is used for security during authentication
    // @see http://developer.linkedin.com/documents/authentication
    var state = generateState(req.sessionID);
    var user = req.signedCookies.user;

    // save the referer
    req.session.referer = req.header('Referer') || '/';

    // save state to session
    req.session.state = state;

    // if user cookie is set, login and redirect... 
    if (user) {

      // Because we are using a custom callback, we need to to establish 
      // a session by calling req.login() which is done in the _login func
      _login(user, req, res, next);
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

        if (err) {
          var errorMessage = new Error('Problem Authenticating with Linkedin');
          return console.error(errorMessage, err);
        }

        // set user cookie
        setSignedUserCookie(user, res);

        // Because we are using a custom callback, we need to to establish 
        // a session by calling req.login() which is done in the _login func
        _login(user, req, res, next);
        

      })(req, res, next);
    }
  });
};