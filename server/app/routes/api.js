'use strict';

/* jshint camelcase:false */

// ## Module Dependencies
var swagger = require('swagger-node-express');
var url = require('url');
var users = require('./api/users');
var companies = require('./api/companies');
var jobs = require('./api/jobs');
var models = require('../models/swagger');

module.exports = function (subpath, cfg) {

  // Set the main handler in swagger to the express subpath
  swagger.setAppHandler(subpath);

  // This is a sample validator.  It simply says that for _all_ POST, DELETE, PUT
  // methods, the header `api_key` OR query param `api_key` must be equal
  // to the string literal `special-key`.  All other HTTP ops are A-OK
  swagger.addValidator(
    function validate(req, path, httpMethod) {
      //  example, only allow POST for api_key="special-key"
      if ('POST' === httpMethod || 'DELETE' === httpMethod || 'PUT' === httpMethod) {
        var apiKey = req.headers.api_key;
        
        if (!apiKey) apiKey = url.parse(req.url,true).query.api_key;
        if ('special-key' === apiKey) return true;
        return false;
      }

      return true;
    }
  );

  // Add models and methods to swagger
  swagger.addModels(models)
    // .addGet(users.list)
  //   .addGet(users.userCount)
    .addGet(users.findById)
  //   .addGet(users.getRandom)
    .addPost(users.addUser)
  //   .addPost(users.addRandomUsers)
  //   .addPost(users.manyRandomFriendships)
  //   .addPost(users.friendRandomUser)
  //   .addPost(users.friendUser)
  //   .addPost(users.unfriendUser)
    // .addPut(users.updateUser)
    // .addDelete(users.deleteUser)
  //   .addDelete(users.deleteAllUsers)
  //   .addPut(users.resetUsers)
    .addGet(companies.findById)
    .addPost(companies.addCompany)
    .addGet(jobs.findById)
    .addPost(jobs.addJob)
    ;

  // swagger.configureDeclaration('users', {
  //   description: 'User Operations',
  //   // authorizations: ['oath2'],
  //   produces: ['application/json']
  // });

  // set api info
  swagger.setApiInfo({
    title: 'Neo4j-Swagger API',
    description: 'This a sample server built on top of Neo4j, a graph database. The neo4j toggle (<b>top right</b>) controls whether the underlying neo4j cypher queries are returned to the client. Learn more at <a href="https://github.com/tinj/node-neo4j-swagger-api">https://github.com/tinj/node-neo4j-swagger-api</a>'
  });

  swagger.setAuthorizations({
    apiKey: {
      type: 'apiKey',
      passAs: 'header'
    }
  });

  // put the resource listing under /api-docs
  // and ditch the .{format} on each of the apis
  swagger.configureSwaggerPaths('', 'api-docs', '');

  swagger.configure(cfg.server.baseUrl + cfg.server.apiBasePath, '0.1.4');
};