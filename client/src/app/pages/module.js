'use strict';

angular.module('n4j.pages', [
  'angular-growl',
  'fx.animations',
  'highcharts-ng',
  'ngAnimate',
  'ngResource',
  'ngCookies',
  'restangular',
  'ui.bootstrap',
  'ui.router.compat',

  // app modules
  'n4j.pages.controllers',
  'n4j.pages.directives',
  'n4j.pages.services',
]);

angular.module('n4j.pages')
  .config(function ($stateProvider, RestangularProvider, $httpProvider, growlProvider) {

    $stateProvider
      .state('public', {
        abstract: true,
        url: '/',
        templateUrl: 'pages/templates/public.tpl.html'
      })

      .state('public.home', {
        url: '',
        templateUrl: 'pages/templates/home.tpl.html',
        controller: 'HomeCtrl',
        data: {
          bodyId: 'home'
        }
      })

      
      .state('public.login', {
        url: 'login',
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

      .state('public.about', {
        url: 'about',
        templateUrl: 'pages/templates/about.tpl.html',
        data: {
          bodyId: 'about'
        },
      })

      // Everything in app should be authenticated
      .state('app', {
        abstract: true,
        url: '/app',
        templateUrl: 'pages/templates/protected.tpl.html',
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
          },

          user: function ($n4User) {
            return $n4User.get();
          }
        }
      })

      .state('app.browse', {
        abstract: true,
        url: '^/browse',
        templateUrl: 'pages/templates/browse.tpl.html',
        controller: 'BrowseCtrl',
        resolve: {
          jobs: function ($n4Jobs) {
            return $n4Jobs.list();
          }
        }
      })

      .state('app.browse.list', {
        url: '',
        templateUrl: 'pages/templates/browse.list.tpl.html'
      })

      .state('app.browse.detail', {
        url: '/:id',
        views: {
          'detail': {
            controller: 'BrowseDetailCtrl',
            templateUrl: 'pages/templates/browse.detail.tpl.html',
          }
        }
      })

      .state('app.profile', {
        url: '^/profile',
        templateUrl: 'pages/templates/profile.tpl.html',
        controller: 'ProfileCtrl',
        data: {
          bodyId: 'profile'
        }
      })

      .state('app.setup', {
        abstract: true,
        url: '^/profile/setup',
        template: '<div ui-view></div>'
      })

      .state('app.setup.locations', {
        url: '/locations',
        templateUrl: 'pages/templates/setup.locations.tpl.html',
        controller: 'SetupCtrl',
        data: {
          bodyId: 'profile'
        }
      })
      
      .state('app.setup.skills', {
        url: '/skills',
        templateUrl: 'pages/templates/setup.skills.tpl.html',
        controller: 'SetupCtrl',
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

    // We need to send data as a query string but by default if the the data property 
    // of the request configuration object contains an object, it is serialized into JSON
    // but we need it to be sent as a query string...
    $httpProvider.defaults.transformRequest.unshift(function (data) {
      var key, result = [];

      for (key in data) {
        if (data.hasOwnProperty(key)) {
          result.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
      }
      return result.join('&');
    });

    growlProvider.globalTimeToLive(3000);
  });

angular.module('n4j.pages.controllers', []);
angular.module('n4j.pages.directives', []);
angular.module('n4j.pages.services', []);