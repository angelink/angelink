Express Seed
=====================

This is a simple express server seed with multiple environment configurations and grunt integration. The main purpose of this is to serve as a server seed for other projects. Grunt tasks handle code validation and reloading on file changes.

### Features
- Grunt
- Configuration Files
- Colored terminal (console.log) output

### Configuration Files

Copy the config.example.js file => config.js and make changes as necessary. If you do not make a copy of this file, the first time you start up the server it will copy and create the config.js file for you.

### Getting Started

- Create your configuration file
- ```grunt serve``` will start an express server configured for development
- ```grunt serve:dist``` will start an express server configured to more closely resembe a production environment


### Directory Layout (coming soon)
    
- config
- middleware
- routes
- utils
- views

GIT Branches
------------

### Master

Basic server seed. Assumes that you will be compiling your view files server side. Currently there is no grunt compilation/packaging for client side javascript/css files, or even a directory for them right now. This was meant to be as simple a server seed as possible.

### SPA (For Single Page Applications)

Differences from Master
- All routes by default go to the index page so your clientside framework can take care of routing. My preferred framework is AngularJS, so this is designed to work with my [angular seed app](https://github.com/dremonkey/angular-seed).

### DB-Postgres (Work in Progress)

Differences from Master
- Added 'models' directory
- Helpers to connect to a PostgresDB and make queries

More Info
---------

For more on Express, http://expressjs.com/.

License
---------
MIT
