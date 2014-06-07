'use strict';

// ## Module Dependencies
var _ = require('lodash');
var Architect = require('neo4j-architect');
var db = require('../db');
var QueryBuilder = require('../neo4j-qb/qb.js');
var util = require('util');
var utils = require('../utils');
var when = require('when');

// ## Models
var Salary = require('./salaries');
var Equity = require('./equities');
var Company = require('./companies');
var Loc = require('./locations');
var Role = require('./roles');
var Skill = require('./skills');

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

var _update = qb.makeUpdate(['id']);

var _delete = qb.makeDelete(['id']);

var _deleteAll = qb.makeDelete();


// ## Helper Functions
var _prepareParams = function (params) {

  // make sure that params.id is a string
  params.id = String(params.id);

  return params;
};

// ## Constructed Functions

var create = function (params, options) {
  var func = new Construct(_create, _singleJob);
  var p1 = when.promise(function (resolve) {

    // @NOTE Do any data cleaning/prep here...
    
    func.done().call(null, params, options, function (err, results, queries) {
      resolve({results: results, queries: queries});
    });
  });

  //Create related nodes from params
  var p2 = Salary.create(JSON.parse(params.salary), options);
  var p3 = Equity.create(JSON.parse(params.equity), options);
  var p4 = Company.create(JSON.parse(params.company), options);
  var p5 = Loc.create(JSON.parse(params.loc), options);
  var p6 = Role.createMany(JSON.parse(params.roles), options);
  var p7 = Skill.createMany(JSON.parse(params.skills), options);

  var all = when.join(p1,p2,p3,p4,p5,p6,p7);

  all.then(function (results) {
    var jobResults = results[0];
    var salaryResults = results[1];
    var equityResults = results[2];
    var companyResults = results[3];
    var locResults = results[4];
    var roleResults = results[5];
    var skillResults = results[6];

    var jobNode = jobResults.results.node;

    var skills = _.map(skillResults, function (res) {
      return res.results.node;
    });
    var roles = _.map(roleResults, function (res) {
      return res.results.node;
    });

    // console.log(companyResults[0]);
    jobNode.hasSalary(salaryResults.results.node, _.noop);
    jobNode.hasEquity(equityResults.results.node, _.noop);
    jobNode.atCompany(companyResults[0].results.node, _.noop);
    jobNode.atLocation(locResults.results.node, _.noop);
    jobNode.requiresSkill(skills, _.noop);
    jobNode.hasRole(roles, _.noop);

    return results;
  });

  return all;
};

var createMany = function (list, options) {
  var promises = [];
  
  if (!list) return;

  if (typeof list === 'string') {
    list = JSON.parse(list);
  }

  _.each(list, function (data) {
    var filtered = _.pick(data, Object.keys(schema));
    var promise = create(filtered, options);

    promises.push(promise);
  });

  return when.all(promises);
};

// create a new user
// var create = new Construct(_create, _singleJob);

// var createMany = new Construct(_createManySetup).map(create);

// var getById = function (params, options, callback) {
//   var func = new Construct(_matchByJUID).query().then(_singleJob);

//   params = _prepareParams(params);

//   func.done().call(this, params, options, callback);
// };

var _queryRelationship = function (from, relationship) {

  return when.promise(function (resolve){
    var all = {
      'company': 'AT_COMPANY',
      'salary': 'HAS_SALARY',
      'equity': 'HAS_EQUITY',
      'skills': 'REQUIRES_SKILL',
      'roles': 'HAS_ROLE'
    };

    var query = [];
    var qs = '';
    var cypherParams = {
      id: from.node.data.id,
    };

    query.push(util.format('MATCH (a:%s {id:{id}})-[:%s]->(node)', from.object, all[relationship]));
    query.push('RETURN node');

    qs = query.join('\n');

    // console.log(qs);

    db.query(qs, cypherParams, function (err, results) {
      results = _.map(results, function (result) {
        return result.node._data;
      });

      var res = {};
      res[relationship] = results;
      resolve(res);
    });
  });
};

var getById = function (params, options) {
  var func = new Construct(_matchByJUID).query().then(_singleJob);

  // console.log('jobs', Array.isArray(params));
  var clone = _.clone(params);

  var p1 =  when.promise(function (resolve) {
    
    if (!clone.id && clone.jobId) clone.id = clone.jobId;

    // force id to be a number
    // not sure why this is needed... and its causing probs
    // clone.id = +clone.id;
    
    // console.log(clone, 'CLONE');

    func.done().call(null, clone, options, function (err, results, queries) {
      // console.log('211', results);
      resolve({results: results, queries: queries});
    });
  });

  // console.log(clone);
  if (!clone.related) {
    return p1;
  } else if (clone.related === 'all') {
    return p1.then(function (jobResults) {
      var related = ['company', 'salary', 'equity', 'skills', 'roles'];
      var p = [];
      _.each(related, function (value) {
        p.push(_queryRelationship(jobResults.results, value));
      });
      // console.log(p, 'promise array');
      
      return when.all(p).then(function (relatedResults) {
        // console.log(relatedResults, 'RELATED RESULTS');

        _.each(relatedResults, function (related) {
          _.extend(jobResults.results.node.data, related);
        });

        // console.log(jobResults);
        // console.log('\n\n');
        // console.log(jobResults.results.node.data);

        return jobResults;
      });
    });
  } else {
    return p1.then(function (jobResults) {
      // console.log(userResults, 'USERRESULTS');
      var p = [];

      _.each(clone.related, function (value) {
        p.push(_queryRelationship(jobResults.results, value));
      });
      // console.log(p, 'promise array');
      
      return when.all(p).then(function (relatedResults) {
        // console.log(relatedResults, 'RELATED RESULTS');

        _.each(relatedResults, function (related) {
          _.extend(jobResults.results.node.data, related);
        });

        // console.log(jobResults);
        // console.log('\n\n');
        // console.log(jobResults.results.node.data);

        return jobResults;
      });
    });
  }
};

var getAll = new Construct(_matchAll, _manyJobs);

// var update = new Construct(_update, _singleJob);
var update = function (params, options, callback) {
  var func = new Construct(_update, _singleJob);

  params = _prepareParams(params);

  func.done().call(this, params, options, callback);
};

// delete a user by id
var deleteJob = new Construct(_delete);

// delete a user by id
var deleteAllJobs = new Construct(_deleteAll);

// ## Building relationships

var _hasRelationship = function (rel, to, callback) {
  
  if (!rel.label) throw new Error('You must give this relationship a label');
  
  var label = rel.label;
  var props = rel.props || {};
  var that = this;
  var query = [];
  var qs = '';
  var toArr = [];
  var cypherParams = {};

  // Make sure to is an array
  if (!Array.isArray(to)) toArr.push(to);
  else toArr = to;

  // Build the cypherParams
  cypherParams.from = that.nodeId; // add the 'from' nodeID

  _.each(toArr, function (toNode, index) {
    var ident = 'ident_' + index;

    cypherParams[ident] = toNode.nodeId;

    // @NOTE 
    // MATCH statement must come before CREATE
    //
    // START may be deprecated soon... starting with Neo4J 2.0 so using 
    // MATCH + WHERE is the recommended way to find a node by nodeId
  
    // query.unshift('START a=node({from}), b=node({to})');
    query.unshift(util.format('MATCH (%s) WHERE id(%s) = {%s}', ident, ident, ident));
    query.push(util.format('CREATE UNIQUE (a)-[:%s %s]->(%s)', label, JSON.stringify(props), ident));
  });

  // add the user node to the front
  query.unshift('MATCH (a) WHERE id(a) = {from}');

  qs = query.join('\n');

  db.query(qs, cypherParams, callback);
};


// ## algorithm for finding most recent user specific jobs
var getLatest = function (userNode) {

  return when.promise(function (resolve) {

    var query = [];
    var qs = '';
    var cypherParams = {
      id: userNode.data.id,
    };

    // Query looks like:
    // MATCH (user:User {id:'_gDgNhqNKU'}), (job:Job)
    // WHERE NOT (user)-[:LIKES]->(job) AND NOT (user)-[:DISLIKES]->(job)
    // WITH job
    // LIMIT 5
    // MATCH (job)-[relType]-(relationship)
    // RETURN job,relType,relationship

    query.push('MATCH (user:User {id:{id}}), (job:Job)');
    query.push('WHERE NOT (user)-[:LIKES]->(job) AND NOT (user)-[:DISLIKES]->(job)');
    query.push('WITH job');
    query.push('ORDER BY job.created DESC');
    query.push('LIMIT 20'); // @TODO make this dynamic
    query.push('MATCH (job)-[r]-(rel)');
    query.push('RETURN job, type(r), rel');

    qs = query.join('\n');

    // console.log(qs);

    var relMap = {
      'AT_LOCATION': 'location',
      'AT_COMPANY': 'company',
      'HAS_SALARY': 'salary',
      'REQUIRES_SKILL': 'skills',
      'HAS_EQUITY': 'equity',
      'HAS_ROLE': 'roles'
    };

    db.query(qs, cypherParams, function (err, results) {

      var jobs = {};

      _.each(results, function (result) {

        var job = result.job;
        var id = job._data.data.id;

        // Check if the job already exists in the jobs object
        if (jobs[id]) {
          job = jobs[id];
        }

        // Get the relationship label
        var relType = result['type(r)'];
        var relLabel = relMap[relType];

        // Add the relationship
        var relationships = result.rel._data;

        if (relLabel === 'skills' || relLabel === 'roles') {
          job._data.data[relLabel] = job.data[relLabel] || [];
          job._data.data[relLabel].push(relationships.data);
        } else {
          job._data.data[relLabel] = relationships.data;
        }

        // Save the updated job
        jobs[id] = job;
      });


      // We only need the values of jobs and we need to map it to 'job'
      // so that _manyJobs parses it correctly.
      //
      // @NOTE
      // For some reason even though the query returns results in the correct
      // order by the time we have mapped it to jobs (or loop over it), it is reversed.
      // Not sure why but it may be for efficiency... in any case that is why we use unshift
      var res = [];
      _.each(jobs, function (job) {
        res.unshift({job: job});
      });

      // Format the response in the way we expect it to look
      // This is ugly... need to change this so it doesn't require a callback
      _manyJobs(res, function (err, results) {
        resolve(results);
      });
    });
  });
};

var getLiked = function (userNode) {

  return when.promise(function (resolve) {

    var query = [];
    var qs = '';
    var cypherParams = {
      id: userNode.data.id,
    };

    // Query looks like:
    // MATCH (user:User {id:'_gDgNhqNKU'}), (job:Job)
    // WHERE NOT (user)-[:LIKES]->(job) AND NOT (user)-[:DISLIKES]->(job)
    // WITH job
    // LIMIT 5
    // MATCH (job)-[relType]-(relationship)
    // RETURN job,relType,relationship

    query.push('MATCH (user:User {id:{id}}), (job:Job)');
    query.push('WHERE (user)-[:LIKES]->(job)');
    query.push('WITH job');
    // query.push('LIMIT 20');
    query.push('MATCH (job)-[r]-(rel)');
    query.push('RETURN job, r, rel');
    query.push('ORDER BY job.created');

    qs = query.join('\n');

    var relMap = {
      'AT_LOCATION': 'location',
      'AT_COMPANY': 'company',
      'HAS_SALARY': 'salary',
      'REQUIRES_SKILL': 'skills',
      'HAS_EQUITY': 'equity',
      'HAS_ROLE': 'roles'
    };

    db.query(qs, cypherParams, function (err, results) {

      var jobs = {};

      _.each(results, function (result) {

        var job = result.job;
        var id = job._data.data.id;

        // Check if the job already exists in the jobs object
        if (jobs[id]) {
          job = jobs[id];
        }

        // Get the relationship label
        var relType = result.r._data.type;
        var relLabel = relMap[relType];

        // Add the relationship
        var relationships = result.rel._data;

        if (relLabel === 'skills' || relLabel === 'roles') {
          job._data.data[relLabel] = job.data[relLabel] || [];
          job._data.data[relLabel].push(relationships.data);
        } else {
          job._data.data[relLabel] = relationships.data;
        }

        // Save the updated job
        jobs[id] = job;
      });

      // We only need the values of jobs and we need to map it to 'job'
      // so that _manyJobs parses it correctly
      var res = _.map(jobs, function (job) {
        return {job: job};
      });

      // Format the response in the way we expect it to look
      // This is ugly... need to change this so it doesn't require a callback
      _manyJobs(res, function (err, results) {
        resolve(results);
      });
    });
  });
};

// ## Simple recommendations based on similar skills between user and jobs
var getRecommended = function (userNode) {

  return when.promise(function (resolve) {

    var query = [];
    var qs = '';
    var cypherParams = {
      id: userNode.data.id
    };

    query.push('MATCH (user:User {id:{id}}), (job:Job)');
    query.push('WHERE NOT (user)-[:LIKES]->(job) AND NOT (user)-[:DISLIKES]->(job)');
    query.push('WITH user, job');
    query.push('MATCH (user)-[:HAS_SKILL]->(skill)<-[:REQUIRES_SKILL]-(job)');
    query.push('WITH job, count(skill) AS skillscount');
    query.push('ORDER BY job.created DESC');
    query.push('LIMIT 20');
    query.push('MATCH (job)-[r]-(rel)');
    query.push('RETURN job, r, rel, skillscount');
    query.push('ORDER BY skillscount DESC');

    qs = query.join('\n');

    // console.log(qs);

    var relMap = {
      'AT_LOCATION': 'location',
      'AT_COMPANY': 'company',
      'HAS_SALARY': 'salary',
      'REQUIRES_SKILL': 'skills',
      'HAS_EQUITY': 'equity',
      'HAS_ROLE': 'roles'
    };

    db.query(qs, cypherParams, function (err, results) {

      var jobs = {};

      _.each(results, function (result) {

        var job = result.job;
        var id = job._data.data.id;

        // Check if the job already exists in the jobs object
        if (jobs[id]) {
          job = jobs[id];
        } else {
          job._data.data.skillscount = result.skillscount;
        }

        // Get the relationship label
        var relType = result.r._data.type;
        var relLabel = relMap[relType];

        // Add the relationship
        var relationships = result.rel._data;

        if (relLabel === 'skills' || relLabel === 'roles') {
          job._data.data[relLabel] = job.data[relLabel] || [];
          job._data.data[relLabel].push(relationships.data);
        } else {
          job._data.data[relLabel] = relationships.data;
        }

        // Save the updated job
        jobs[id] = job;
      });

      var res = _.sortBy(jobs, function (job) {
        return -job._data.data.skillscount;
      });

      res = _.map(res, function (job) {
        return {job: job};
      });

      // Format the response in the way we expect it to look
      // This is ugly... need to change this so it doesn't require a callback
      _manyJobs(res, function (err, results) {
        resolve(results);
      });
    });
  });
};

// Job.prototype.hasRole = function (toRole, callback) {
//   var that = this;
//   var query = [];
  
//   query.push('START a=node({from}), b=node({to})');
//   query.push('CREATE UNIQUE (a)-[:HAS_ROLE]->(b)');
//   var qs = query.join('\n');

//   db.query(qs, {from: that.nodeId, to: toRole.nodeId}, callback);
// };

Job.prototype.hasRole = _.partial(_hasRelationship, {label:'HAS_ROLE'});
Job.prototype.atLocation = _.partial(_hasRelationship, {label:'AT_LOCATION'});
Job.prototype.requiresSkill = _.partial(_hasRelationship, {label:'REQUIRES_SKILL'});
Job.prototype.atCompany = _.partial(_hasRelationship, {label:'AT_COMPANY'});
Job.prototype.hasSalary = _.partial(_hasRelationship, {label:'HAS_SALARY'});
Job.prototype.hasEquity = _.partial(_hasRelationship, {label:'HAS_EQUITY'});


// Job.prototype.atLocation = function (toLocation, callback) {
//   var that = this;
//   var query = [];
  
//   query.push('START a=node({from}), b=node({to})');
//   query.push('CREATE UNIQUE (a)-[:AT_LOCATION]->(b)');
//   var qs = query.join('\n');

//   db.query(qs, {from: that.nodeId, to: toLocation.nodeId}, callback);
// };

// Job.prototype.requiresSkill = function (toSkill, callback) {
//   var that = this;
//   var query = [];
  
//   query.push('START a=node({from}), b=node({to})');
//   query.push('CREATE UNIQUE (a)-[:REQUIRES_SKILL]->(b)');
//   var qs = query.join('\n');

//   db.query(qs, {from: that.nodeId, to: toSkill.nodeId}, callback);
// };

// Job.prototype.atCompany = function (toCompany, callback) {
//   var that = this;
//   var query = [];
  
//   query.push('START a=node({from}), b=node({to})');
//   query.push('CREATE UNIQUE (a)-[:AT_COMPANY]->(b)');
//   var qs = query.join('\n');

//   db.query(qs, {from: that.nodeId, to: toCompany.nodeId}, callback);
// };

// Job.prototype.hasSalary = function (toSalary, callback) {
//   var that = this;
//   var query = [];
  
//   query.push('START a=node({from}), b=node({to})');
//   query.push('CREATE UNIQUE (a)-[:HAS_SALARY]->(b)');
//   var qs = query.join('\n');

//   db.query(qs, {from: that.nodeId, to: toSalary.nodeId}, callback);
// };

// Job.prototype.hasEquity = function (toEquity, callback) {
//   var that = this;
//   var query = [];
  
//   query.push('START a=node({from}), b=node({to})');
//   query.push('CREATE UNIQUE (a)-[:HAS_EQUITY]->(b)');
//   var qs = query.join('\n');

//   db.query(qs, {from: that.nodeId, to: toEquity.nodeId}, callback);
// };

// static methods
Job.create = create;
Job.createMany = createMany;
Job.deleteJob = deleteJob.done();
Job.deleteAllJobs = deleteAllJobs.done();
Job.getById = getById;
Job.getAll = getAll.done();
Job.update = update;
Job.getLatest = getLatest;
Job.getLiked = getLiked;
Job.getRecommended = getRecommended;

module.exports = Job;
