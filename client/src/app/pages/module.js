'use strict';

angular.module('n4j.pages', ['ui.router.compat', 'n4j.pages.controllers', 'n4j.pages.directives'])
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

      .state('about', {
        url: '/about',
        templateUrl: 'pages/templates/about.tpl.html',
        controller: 'HomeCtrl',
        data: {
          bodyId: 'about'
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