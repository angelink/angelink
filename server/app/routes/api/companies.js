'use strict';

// ## Module Dependencies
var sw = require('swagger-node-express');
var url = require('url');


// ## Models
var Companies = require('../../models/companies');

var param = sw.params;
var swe = sw.errors;


// ## Utility Functions

function setHeaders (res, queries, start) {
  res.header('Duration-ms', new Date() - start);
  if (queries) {
    res.header('Neo4j', JSON.stringify(queries));
  }
}

function writeResponse (res, results, queries, start) {
  setHeaders(res, queries, start);
  res.send(results);
}

function getQueryValue(req, key) {
  return url.parse(req.url,true).query[key];
}

function existsInQuery (req, key) {
  return url.parse(req.url,true).query[key] !== undefined;
}


// ## API Specs


// Route: GET '/companies'
exports.list = {

  spec: {
    description : 'List all companies',
    path : '/companies',
    method: 'GET',
    summary : 'Find all companies',
    notes : 'Returns all companies',
    type: 'array',
    items: {
      $ref: 'Company'
    },
    produces: ['application/json'],
    parameters : [],
    responseMessages: [swe.notFound('companies')],
    nickname : 'getCompanies'
  },

  action: function (req, res) {
    var options = {};
    var start = new Date();
    
    options.neo4j = existsInQuery(req, 'neo4j');

    function callback (err, results, queries) {
      if (err || !results) throw swe.notFound('companies');
      writeResponse(res, results, queries, start);
    }

    Companies.getAll(null, options, callback);
  }
};


// Route: POST '/companies'
exports.addCompany = {
  
  spec: {
    path : '/companies',
    notes : 'adds a company to the graph',
    summary : 'Add a new company to the graph',
    method: 'POST',
    type : 'array',
    items : {
      $ref: 'Company'
    },
    parameters : [
      param.query('name', 'Company name', 'string', true),
      param.query('id', 'Company id', 'string', true)
    ],
    responseMessages : [swe.invalid('input')],
    nickname : 'addCompany'
  },

  action: function(req, res) {
    var options = {};
    var start = new Date();

    options.neo4j = existsInQuery(req, 'neo4j');

    Companies.create({
      id: getQueryValue(req, 'id'),
      name: getQueryValue(req, 'name')
    }, options, function (err, results, queries) {
      if (err || !results) throw swe.invalid('input');
      writeResponse(res, results, queries, start);
    });
  }
};


// Route: GET '/companies/:id'
exports.findById = {
  
  spec: {
    description : 'find a company',
    path : '/companies/{id}',
    notes : 'Returns a company based on ID',
    summary : 'Find company by ID',
    method: 'GET',
    parameters : [
      param.path('id', 'ID of company that needs to be fetched', 'string'),
    ],
    type : 'Company',
    responseMessages : [swe.invalid('id'), swe.notFound('company')],
    nickname : 'getCompanyById'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};
    var start = new Date();

    options.neo4j = existsInQuery(req, 'neo4j');

    if (!id) throw swe.invalid('id');

    params.id = id;

    var callback = function (err, results, queries) {
      if (err) throw swe.notFound('company');
      writeResponse(res, results, queries, start);
    };

    Companies.getById(params, options, callback);
  }
};