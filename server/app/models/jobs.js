'use strict';

// ## Module Dependencies
var _ = require('lodash');
var Architect = require('neo4j-architect');
var db = require('../db');
var QueryBuilder = require('../neo4j-qb/qb.js');
var utils = require('../utils');

Architect.init();

var Construct = Architect.Construct;

var schema = {
  id: String,
  title: String,
  created: String
};

var qb = new QueryBuilder('Job', schema);

// ## Model

var Job = function(_data) {
  _.extend(this, _data);
  //get the unique node id
  this.nodeId = +this.self.split('/').pop();
};

Job.prototype.modelName = 'Job';

// ## Results Functions

var _singleJob = _.partial(utils.formatSingleResponse, Job);
var _manyJobs = _.partial(utils.formatManyResponse, Job);

// ## Query Functions
// Should be combined with results functions using _.partial()

var _matchByJUID = qb.makeMatch(['id']);

var _matchAll = qb.makeMatch();

var _create = qb.makeMerge(['id']);

// var _createRelationship = qb.makeRelate();

var _update = qb.makeUpdate(['id']);

var _delete = qb.makeDelete(['id']);

var _deleteAll = qb.makeDelete();

var _createManySetup = function (params, callback) {
  if (params.list && _.isArray(params.list)) {
    callback(null, _.map(params.list, function (job) {
      return _.pick(job, Object.keys(schema));
    }));
  } else {
    callback(null, []);
  }
};


// ## Constructed Functions

// create a new user
var create = new Construct(_create, _singleJob);

var createMany = new Construct(_createManySetup).map(create);

var getById = new Construct(_matchByJUID).query().then(_singleJob);

var getAll = new Construct(_matchAll, _manyJobs);

var update = new Construct(_update, _singleJob);

// delete a user by id
var deleteJob = new Construct(_delete);

// delete a user by id
var deleteAllJobs = new Construct(_deleteAll);

// ## Building relationships

Job.prototype.hasRole = function (toRole, callback) {
  var that = this;
  var query = [];
  
  query.push('START a=node({from}), b=node({to})');
  query.push('CREATE UNIQUE (a)-[:HAS_ROLE]->(b)');
  var qs = query.join('\n');

  db.query(qs, {from: that.nodeId, to: toRole.nodeId}, callback);
};

Job.prototype.atLocation = function (toLocation, callback) {
  var that = this;
  var query = [];
  
  query.push('START a=node({from}), b=node({to})');
  query.push('CREATE UNIQUE (a)-[:AT]->(b)');
  var qs = query.join('\n');

  db.query(qs, {from: that.nodeId, to: toLocation.nodeId}, callback);
};

Job.prototype.requiresSkill = function (toSkill, callback) {
  var that = this;
  var query = [];
  
  query.push('START a=node({from}), b=node({to})');
  query.push('CREATE UNIQUE (a)-[:REQUIRES_SKILL]->(b)');
  var qs = query.join('\n');

  db.query(qs, {from: that.nodeId, to: toSkill.nodeId}, callback);
};

Job.prototype.atCompany = function (toCompany, callback) {
  var that = this;
  var query = [];
  
  query.push('START a=node({from}), b=node({to})');
  query.push('CREATE UNIQUE (a)-[:AT_COMPANY]->(b)');
  var qs = query.join('\n');

  db.query(qs, {from: that.nodeId, to: toCompany.nodeId}, callback);
};

Job.prototype.hasSalary = function (toSalary, callback) {
  var that = this;
  var query = [];
  
  query.push('START a=node({from}), b=node({to})');
  query.push('CREATE UNIQUE (a)-[:HAS_SALARY]->(b)');
  var qs = query.join('\n');

  db.query(qs, {from: that.nodeId, to: toSalary.nodeId}, callback);
};

Job.prototype.hasEquity = function (toEquity, callback) {
  var that = this;
  var query = [];
  
  query.push('START a=node({from}), b=node({to})');
  query.push('CREATE UNIQUE (a)-[:HAS_EQUITY]->(b)');
  var qs = query.join('\n');

  db.query(qs, {from: that.nodeId, to: toEquity.nodeId}, callback);
};

// static methods
Job.create = create.done();
Job.createMany = createMany.done();
Job.deleteJob = deleteJob.done();
Job.deleteAllJobs = deleteAllJobs.done();
Job.getById = getById.done();
Job.getAll = getAll.done();
Job.update = update.done();

module.exports = Job;
