'use strict';

/* jshint camelcase:false */

angular.module('n4j.pages.services')

  .service('$n4User', function (_, $http, $n4Auth, Restangular) {

    var baseUrl = '/api/v0/users/';

    var config = {
      headers: {
        'api_key': 'special-key',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    var restAuth = Restangular.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl('/auth');
    });

    var user = $n4Auth.getUser();

    this.save = function (data) {

      var url = baseUrl + user.id;
      
      // @TODO 
      // Figure out how to make Restangular send the put request
      // The issue right now is that when using User.put() the data
      // is sent as a query string instead of as form-data
      //
      // var User = Restangular.one('users', user.id);
      // return User.put(data);

      // make sure any property that is an array or object is stringified
      _.each(data, function (value, key, collection) {
        if (typeof value === 'object') {
          collection[key] = JSON.stringify(value);
        }
      });

      return $http.put(url, data, config);
    };

    this.get = function () {
      return restAuth.one('currentUser').get().then(function (user) {
        return user;
      });
    };

    this.getSkills = function () {
      return restAuth.one('currentUser').get().then(function (user) {

        var skills = _.map(user.skills, function (node) {
          return node.data;
        });

        return skills;
      });
    };

    this.getLocations = function () {
      return restAuth.one('currentUser').get().then(function (user) {

        var locations = _.map(user.locations, function (node) {
          return node.data;
        });

        // @NOTE 
        // we are temporarily setting SF as the location because
        // that is the only data we are pulling in.
        locations = locations.length > 0 && locations || [{city: 'San Francisco'}];

        return locations;
      });
    };

    this.rateJob = function (jobId, rating) {
      var like = rating === 'like' && true || false;
      var url = baseUrl + user.id + '/jobs/' + jobId;
      var data = {
        like: like
      };

      return $http.post(url, data, config);
    };

    this.removeRelationships = function (data) {

      var url = baseUrl + user.id + '/relationships';

      // make sure any property that is an array or object is stringified
      _.each(data, function (value, key, collection) {
        if (typeof value === 'object') {
          collection[key] = JSON.stringify(value);
        }
      });

      return $http.put(url, data, config);
    };

    this.del = function () {
      var url = baseUrl + user.id;

      return $http.delete(url, config);
    };

    return this;
  });