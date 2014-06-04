'use strict';

angular.module('n4j.pages', [
  'highcharts-ng',
  'ngAnimate',
  'ngResource',
  'ngCookies',
  'restangular',
  'snap',
  'ui.bootstrap',
  'ui.router.compat',

  // app modules
  'n4j.pages.controllers',
  'n4j.pages.directives',
  'n4j.pages.services',
]);

angular.module('n4j.pages')
  .config(function ($stateProvider, RestangularProvider) {

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'pages/templates/home.tpl.html',
        controller: 'HomeCtrl',
        data: {
          bodyId: 'home'
        }
      })

      // Everything in app should be authenticated
      .state('app', {
        abstract: true,
        url: '/app',
        template: '<ui-view class="layout"/>',
        resolve: {
          auth: function ($q, $window, $n4Auth) {
            var deferred = $q.defer();

            if (!$n4Auth.isLoggedIn()) {
              // @NOTE 
              // for some reason $state.go doesn't work here
              // so we are using $window.location.href
              $window.location.href = '/login';
            } else {
              deferred.resolve();
            }

            return deferred.promise;
          }
        }
      })

      .state('app.recommended', {
        abstract: true,
        url: '^/recommended',
        templateUrl: 'pages/templates/layout.tpl.html',
        controller: 'BrowseCtrl'
      })

      .state('app.recommended.list', {
        url: '',
        templateUrl: 'pages/templates/list.tpl.html'
      })

      .state('app.recommended.detail', {
        url: '/:id',
        views: {
          'detail': {
            controller: 'BrowseDetailCtrl',
            templateUrl: 'pages/templates/detail.tpl.html',
          }
        }
      })

      .state('login', {
        url: '/login',
        templateUrl: 'pages/templates/login.tpl.html',
        controller: 'AuthCtrl',
        data: {
          bodyId: 'auth'
        },
        resolve: {
          auth: function ($q, $window, $n4Auth) {
            var deferred = $q.defer();

            if ($n4Auth.isLoggedIn()) {
              // @NOTE 
              // for some reason $state.go doesn't work here
              // so we are using $window.location.href
              $window.location.href = '/profile';
            } else {
              deferred.resolve();
            }

            return deferred.promise;
          }
        }
      })

      .state('profile', {
        url: '/profile',
        templateUrl: 'pages/templates/profile.tpl.html',
        controller: 'ProfileCtrl',
        data: {
          bodyId: 'profile'
        }
      });

    // ## Restangular Configurations
    RestangularProvider.setBaseUrl('/api/v0');
    
    RestangularProvider.setDefaultHeaders({
      /* jshint camelcase:false */
      api_key: 'special-key'
    });

    RestangularProvider.addResponseInterceptor(function (data, operation) {
      var extracted = null;
      
      if (operation === 'getList') {
        extracted = data.list;
      } else if (operation === 'get') {
        extracted = data.node.data;
        extracted.nodeId = data.node.nodeId;
      } else {
        extracted = data;
      }

      return extracted;
    });
  });

angular.module('n4j.pages.controllers', []);
angular.module('n4j.pages.directives', []);
angular.module('n4j.pages.services', []);