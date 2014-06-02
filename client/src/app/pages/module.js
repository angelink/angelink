'use strict';

angular.module('n4j.pages', [
  'highcharts-ng',
  'ngAnimate',
  'snap',
  'ui.bootstrap',
  'ui.router.compat',

  // app modules
  'n4j.pages.controllers',
  'n4j.pages.directives',
]);

angular.module('n4j.pages')
  .config(function ($stateProvider) {
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
        template: '<ui-view class="layout"/>'

        // resolve: {
        //   auth: function () {

        //   }
        // }
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
  });

angular.module('n4j.pages.controllers', []);
angular.module('n4j.pages.directives', []);