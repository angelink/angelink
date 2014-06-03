'use strict';

// ## Module Dependencies
var _ = require('lodash');
var sw = require('swagger-node-express');
var utils = require('../../utils');
var when = require('when');

// ## Models
var Job = require('../../models/jobs');
var Salary = require('../../models/salaries');
var Equity = require('../../models/equities');
var Company = require('../../models/companies');
var Loc = require('../../models/locations');
var Role = require('../../models/roles');
var Skill = require('../../models/skills');

var param = sw.params;
var swe = sw.errors;

// ## Helpers
var _prepareParams = function (req) {
  var params = req.body;

  params.id = (req.params && req.params.id) || (req.body && req.body.id);

  return params;
};

var _callback = function (res, errLabel, err, results, queries) {
  var start = new Date();

  if (err || !results) {
    if (err) console.error(errLabel + ' ', err);
    swe.invalid('input', res);
    return;
  }

  utils.writeResponse(res, results, queries, start);
};

// ## API Specs


// Route: GET '/jobs'
exports.list = {

  spec: {
    description : 'List all jobs',
    path : '/jobs',
    method: 'GET',
    summary : 'Find all jobs',
    notes : 'Returns all jobs',
    type: 'object',
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
    var errLabel = 'Route: GET /users';
    var callback = _.partial(_callback, res, errLabel);
    
    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Job.getAll(null, options, callback);
  }
};


// Route: POST '/jobs'
exports.addJob = {
  
  spec: {
    path : '/jobs',
    notes : 'adds a job to the graph',
    summary : 'Add a new job to the graph',
    method: 'POST',
    type : 'object',
    items : {
      $ref: 'Job'
    },
    parameters : [
      param.form('id', 'Job JUID', 'string', true),
      param.form('title', 'Job title', 'string', true),
      param.form('created', 'Job created', 'string', true),
      param.form('salary', 'stringified salary object', 'object', true),
      param.form('equity', 'stringified equity object', 'object', true),
      param.form('company', 'stringified company object', 'object', true),
      param.form('loc', 'stringified location object', 'object', true),
      param.form('roles', 'stringified array of role objects', 'object', true),
      param.form('skills', 'stringified array of skill objects', 'object', true)
    ],
    responseMessages : [swe.invalid('input')],
    nickname : 'addJob'
  },

  action: function(req, res) {
    var options = {};
    var params = {};
    var errLabel = 'Route: POST /jobs';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    when.join(
      Job.create(params, options),
      Salary.create(JSON.parse(params.salary), options),
      Equity.create(JSON.parse(params.equity), options),
      Company.create(JSON.parse(params.company), options),
      Loc.create(JSON.parse(params.loc), options),
      Role.createMany({list:JSON.parse(params.roles)}, options),
      Skill.createMany(params.skills, options)
    ).then(function (results) {
      var jobResults = results[0];
      var salaryResults = results[1];
      var equityResults = results[2];
      var companyResults = results[3];
      var locResults = results[4];
      var roleResults = results[5];
      var skillResults = results[6];
      // console.log(results, 'results');
      // console.log(roleResults, 'roleResults');
      // console.log(skillResults, 'skillResults');
      jobResults.results.node.hasSalary(salaryResults.results.node, function(err){
        if (err) throw err;
      });
      jobResults.results.node.hasEquity(equityResults.results.node, function(err){
        if (err) throw err;
      });
      jobResults.results.node.atCompany(companyResults.results.node, function(err){
        if (err) throw err;
      });
      jobResults.results.node.atLocation(locResults.results.node, function(err){
        if (err) throw err;
      });
      for (var i=0; i<roleResults.length; i++){
        jobResults.results.node.hasRole(roleResults[i].results.node, function(err){
          if (err) throw err;
        });
      }
      for (var j=0; j<skillResults.length; j++){
        jobResults.results.node.requiresSkill(skillResults[j].results.node, function(err){
          if (err) throw err;
        });
      }
      callback(null, results);
    });
  }
};

// Route: POST '/jobs/batch'
exports.addJobs = {
  
  spec: {
    path : '/jobs/batch',
    notes : 'adds many jobs to the graph',
    summary : 'Add multiple jobs to the graph',
    method: 'POST',
    type : 'object',
    parameters : [
      param.form('list', 'Array of job object JSON strings', 'array', true),
    ],
    responseMessages : [swe.invalid('list')],
    nickname : 'addJobs'
  },

  action: function(req, res) {
    var options = {};
    var params = req.body;
    var errLabel = 'Route: POST /jobs/batch';
    var callback = _.partial(_callback, res, errLabel);
    var list = JSON.parse(params.list);

    if (!list.length) throw swe.invalid('list');

    // @TODO 
    // should probably check to see if all user objects contain the minimum
    // required properties (userId, firstname, lastname, etc) and stop if not.

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Job.createMany({list:list}, options).done(function(results){
      callback(null, results);
    });

    // ## test relationship creation for new Job node
    // var getNextJob = function (index, length, collection) {
    //   var next = index + 1;
    //   if (next >= length) {
    //     next = 0;
    //   }

    //   return collection[next].data;
    // };

    // Job.createMany({list:jobs}, options, function (err, results) {
    //   _.each(results, function (job, index, results) {
    //     var nextJob = getNextJob(index, results.length, results);

    //     job.data.hasSalary(nextJob, function (err, res) {
    //       console.log(err, res);
    //     });
    //   });

    //   callback(err, results);
    // });

  }
};

// Route: DELETE '/jobs'
exports.deleteAllJobs = {
  spec: {
    path: '/jobs',
    notes: 'Deletes all jobs and their relationships',
    summary: 'Delete all jobs',
    method: 'DELETE',
    type: 'object',
    nickname : 'deleteAllJobs'
  },

  action: function (req, res) {
    var options = {};
    var errLabel = 'Route: DELETE /jobs';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Job.deleteAllJobs(null, options, callback);
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

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: GET /jobs/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Job.getById(params, options, callback);
  }
};


// Route: POST '/jobs/:id'
exports.updateById = {

  spec: {
    path: '/jobs/{id}',
    notes: 'Updates an existing job',
    summary: 'Update a job',
    method: 'POST',
    type: 'object',
    items: {
      $ref: 'Job'
    },
    parameters : [
      param.path('id', 'ID of job that needs to be fetched', 'string'),
      param.form('id', 'Job JUID', 'string', true),
      param.form('title', 'Job title', 'string', true),
      param.form('created', 'Job created', 'string', true)
    ],
    responseMessages : [swe.invalid('input')],
    nickname : 'updateJob'
  },

  action: function (req, res) {
    var id = req.params.id;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('userId');

    var errLabel = 'Route: POST /jobs/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Job.update(params, options, callback);
  }
};

// Route: DELETE '/users/:userId'
exports.deleteJob = {

  spec: {
    path: '/jobs/{id}',
    notes: 'Deletes an existing job and relationships',
    summary: 'Delete a job',
    method: 'DELETE',
    type: 'object',
    parameters: [
      param.path('id', 'ID of job to be deleted', 'string'),
    ],
    responseMessages: [swe.invalid('input')],
    nickname : 'deleteUser'
  },

  action: function (req, res) {
    var id = req.params.userId;
    var options = {};
    var params = {};

    if (!id) throw swe.invalid('id');

    var errLabel = 'Route: DELETE /jobs/{id}';
    var callback = _.partial(_callback, res, errLabel);

    options.neo4j = utils.existsInQuery(req, 'neo4j');
    params = _prepareParams(req);

    Job.deleteJob(params, options, callback);
  }
};
