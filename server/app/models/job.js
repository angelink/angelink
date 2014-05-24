'use strict';

// ## Module Dependencies
var _ = require('lodash');
var Job = require('./neo4j/job.js');
var Architect = require('neo4j-architect');

Architect.init();

var Construct = Architect.Construct;
var Cypher = Architect.Cypher;

// ## Results Functions
// To be combined with queries using _.partial()

// return a single user
var _singleJob = function (results, callback) {
  if (results.length) {
    callback(null, new Job(results[0].job));
  } else {
    callback(null, null);
  }
};

// return many users
var _manyJobs = function (results, callback) {
  var jobs = _.map(results, function (result) {
    return new Job(result.job);
  });

  callback(null, jobs);
};


// ## Query Functions
// Should be combined with results functions using _.partial()

var _matchBy = function (keys, params, callback) {
  var cypherParams = _.pick(params, keys);

  var query = [
    'MATCH (job:Job)',
    Cypher.where('job', keys),
    'RETURN job'
  ].join('\n');

  console.log('_matchBy query', query);

  callback(null, query, cypherParams);
};

var _matchByJUID = _.partial(_matchBy, ['id']);

var _matchAll = _.partial(_matchBy, []);

// creates the user with cypher
var _create = function (params, callback) {
  var cypherParams = {
    id: params.id,
    title: params.title,
    applyURL: params.applyURL,
    created: params.created
  };

  var query = [
    'MERGE (job:Job {title: {title}, applyURL: {applyURL}, created: {created}, id: {id}})',
    'RETURN job'
  ].join('\n');

  console.log('create query', query);

  callback(null, query, cypherParams);
};

// update the user with cypher
// var _update = function (params, callback) {

//   var cypherParams = {
//     id : params.id,
//     firstname : params.firstname,
//     lastname : params.lastname,
//   };

//   var query = [
//     'MATCH (user:User {id:{id}})',
//     'SET user.firstname = {firstname}',
//     'SET user.lastname = {lastname}',
//     'RETURN user'
//   ].join('\n');

//   callback(null, query, cypherParams);
// };

// delete the user and any relationships with cypher
var _delete = function (params, callback) {
  var cypherParams = {
    id: params.id
  };

  var query = [
    'MATCH (job:Job {id:{id}})',
    'OPTIONAL MATCH (job)-[r]-()',
    'DELETE job, r',
  ].join('\n');

  callback(null, query, cypherParams);
};

// delete all users
var _deleteAll = function (params, callback) {
  var cypherParams = {};

  var query = [
    'MATCH (job:Job)',
    'OPTIONAL MATCH (job)-[r]-()',
    'DELETE job, r',
  ].join('\n');

  callback(null, query, cypherParams);
};

// create a new user
var create = new Construct(_create, _singleJob);

var getById = new Construct(_matchByJUID).query().then(_singleJob);

var getAll = new Construct(_matchAll, _manyJobs);

// get a user by id and update their properties
// var update = new Construct(_update, _singleUser);

// delete a user by id
var deleteJob = new Construct(_delete);

// delete a user by id
var deleteAllJobs = new Construct(_deleteAll);

// export exposed functions
module.exports = {
  getById: getById.done(),
  create: create.done(),
  getAll: getAll.done(),
  deleteJob: deleteJob.done(),
  deleteAllJobs: deleteAllJobs.done(),
};