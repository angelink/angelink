'use strict';

angular.module('n4j.pages', [
  'ngAnimate',
  'ui.router.compat',
  'n4j.pages.controllers',
  'n4j.pages.directives',
  'snap'
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

        templateUrl: 'pages/templates/layout.tpl.html'
      })

      .state('app.recommended.list', {
        url: '',

        templateUrl: 'pages/templates/list.tpl.html'

        // views: {
        //   'list': {
        //     templateUrl: 'pages/templates/detail.tpl.html',
        //     controller: 'BrowseCtrl'
        //   }
        // }
      })

      .state('app.recommended.detail', {
        url: '/:id',

        views: {
          'detail': {
            templateUrl: 'pages/templates/detail.tpl.html',
            controller: 'BrowseCtrl'
          }
        }
      })

      .state('landing', {
        url: '/landing',
        templateUrl: 'pages/templates/landing.tpl.html',
        controller: 'LandingCtrl',
        data: {
          bodyId: 'landing'
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