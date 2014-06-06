'use strict';

/* jshint camelcase:false */

angular.module('n4j.pages.services')

  .service('$n4Skills', function (_, Restangular) {

    this.list = function () {
      return Restangular.all('skills').getList().then(function (nodes) {
        nodes = _.map(nodes, function (node) {
          var data = node.data;
          return data;
        });

        return nodes;
      });
    };

    this.get = function (id) {
      return Restangular.one('skills', id).get();
    };

    return this;
  });