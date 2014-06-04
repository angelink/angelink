'use strict';

/* jshint camelcase:false */

angular.module('n4j.pages.services')

  .factory('$n4Auth', function ($cookies) {

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

    this.getUser = function () {
      return user;
    };

    return this;
  });