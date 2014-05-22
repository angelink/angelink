Particle Angular Seed
---------------------

Simple Angular Seed for my client side needs.

Usage
--------

- ```npm install``` to install node dependencies
- ```bower install``` to install bower components
- ```grunt serve``` to start the development server
- ```grunt serve:dist``` to run the distribution build task and start the server

Features
--------

#### AngularJS

[Amazing clientside framework](http://angularjs.org/) highly suited for web application development.

#### No jQuery

Trying to avoid it like the plague. Angular and [Lo-dash](http://lodash.com/) provides basically everything you need anyway

#### Bootstrap CSS

CSS framework making it easy to create good looking apps. Uses v3.0.2. Does not use the bootstrap javascript because that requires a dependency on jQuery. Instead uses [Angular UI Bootstrap](http://angular-ui.github.io/bootstrap) for a pure Angular implementation. Bootstrap SASS files can be found in the assets/styles directory.

#### Angular UI Router

[Improves on Angular routing](https://github.com/angular-ui/ui-router)

#### Restangular

[Improves on Angular resources](https://github.com/mgonto/restangular) to make it easier to have Angular interact with standard REST APIs.

#### Grunt

Workhorse that takes the pain out of getting your app up and running and ready for production. Among other things I use [grunt-bower-install](https://github.com/stephenplusplus/grunt-bower-install) to make sure all my bower components are included automagically, [grunt-angular-templates](https://github.com/ericclemmons/grunt-angular-templates) to precompile all angular templates, [grunt-ngmin](https://github.com/btford/grunt-ngmin) so that I can be lazy and not have to use the min-safe AngularJS syntax, and [grunt-usemin](https://github.com/yeoman/grunt-usemin) to concat/minify etc.

#### Karma

Spectacular Test Runner for JavaScript. @TODO Need to make better use of this.
