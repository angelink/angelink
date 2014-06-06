'use strict';

/* jshint camelcase:false */

angular.module('n4j.pages.services')

  .service('$n4Auth', function ($cookies) {

    var user = $cookies.user;

    if (user) {

      // parse the user cookie
      // 
      // @NOTE 
      // this is pretty ghetto but angular cannot parse the express cookie
      // as it is so we are doing a regex to extract the necessary substring
      var matches = user.match(/({.+})+/gi);
      
      user = angular.fromJson(matches[0]);
    }

    this.isLoggedIn = function () {
      return !!user;
    };

    // This doesn't return all the user data it only returns some basic 
    // info (id, firstname, lastname). If you want the full user object
    // then you need to use $n4User.get()
    this.getUser = function () {
      return user;
    };

    return this;
  });