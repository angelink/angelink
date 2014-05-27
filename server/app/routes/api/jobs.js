'use strict';

// ## Module Dependencies
var sw = require('swagger-node-express');
var url = require('url');


// ## Models
var Jobs = require('../../models/jobs');

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


// Route: GET '/jobs'
exports.list = {

  spec: {
    description : 'List all jobs',
    path : '/jobs',
    method: 'GET',
    summary : 'Find all jobs',
    notes : 'Returns all jobs',
    type: 'array',
    items: {
      $ref: 'Job'
    },
    produces: ['application/json'],
    parameters : [],
    responseMessages: [swe.notFound('jobs')],
    nickname : 'getJobs'
  },

  action: function (req, res) {
    var options = {};
    var start = new Date();
    
    options.neo4j = existsInQuery(req, 'neo4j');

    function callback (err, results, queries) {
      if (err || !results) throw swe.notFound('jobs');
      writeResponse(res, results, queries, start);
    }

    Jobs.getAll(null, options, callback);
  }
};


// Route: POST '/jobs'
exports.addJob = {
  
  spec: {
    path : '/jobs',
    notes : 'adds a job to the graph',
    summary : 'Add a new job to the graph',
    method: 'POST',
    type : 'array',
    items : {
      $ref: 'Job'
    },
    parameters : [
      param.query('title', 'Job title', 'string', true),
      param.query('applyURL', 'Job applyURL', 'string', true),
      param.query('created', 'Job created', 'string', true),
      param.query('id', 'Job id', 'string', true)
    ],
    responseMessages : [swe.invalid('input')],
    nickname : 'addJob'
  },

  action: function(req, res) {
    var options = {};
    var start = new Date();

    options.neo4j = existsInQuery(req, 'neo4j');

    Jobs.create({
      id: getQueryValue(req, 'id'),
      name: getQueryValue(req, 'name'),
      applyURL: getQueryValue(req, 'applyURL'),
      created: getQueryValue(req, 'created')
    }, options, function (err, results, queries) {
      if (err || !results) throw swe.invalid('input');
      writeResponse(res, results, queries, start);
    });
  }
};


// Route: GET '/jobs/:id'
exports.findById = {
  
  spec: {
    description : 'find a job',
    path : '/jobs/{id}',
    notes : 'Returns a job based on ID',
    summary : 'Find job by ID',
    method: 'GET',
    parameters : [
      param.path('id', 'ID of job that needs to be fetched', 'string'),
    ],
    type : 'Job',
    responseMessages : [swe.invalid('id'), swe.notFound('job')],
    nickname : 'getJobById'
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
      if (err) throw swe.notFound('job');
      writeResponse(res, results, queries, start);
    };

    Jobs.getById(params, options, callback);
  }
};