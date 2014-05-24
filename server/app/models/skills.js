'use strict';

// ## Module Dependencies
var _ = require('lodash');
var Skill = require('./neo4j/skill.js');
var Architect = require('neo4j-architect');
var defaultResponseObject = require('../utils').defaultResponseObject;

Architect.init();

var Construct = Architect.Construct;
var Cypher = Architect.Cypher;

// ## Results Functions
// To be combined with queries using _.partial()

// return a single skill
var _singleSkill = function (results, callback) {
 
  var response = _.extend({}, defaultResponseObject);
  response.object = 'skill';

  if (results.length) {
    response.data = new Skill(results[0].skill);
    callback(null, response);
  } else {
    callback(null, response);
  }
};

// return many skills
var _manySkills = function (results, callback) {
  
  var response = _.extend({}, defaultResponseObject);
  var skills = _.map(results, function (result) {
    return new Skill(result.skill);
  });

  response.data = skills;
  response.object = 'list';
  callback(null, response);
};


// ## Query Functions
// Should be combined with results functions using _.partial()

var _matchBy = function (keys, params, callback) {
  
  var cypherParams = _.pick(params, keys);

  var query = [
    'MATCH (skill:Skill)',
    Cypher.where('skill', keys),
    'RETURN skill'
  ].join('\n');

  console.log('_matchBy query', query);

  callback(null, query, cypherParams);
};

var _matchByName = _.partial(_matchBy, ['name']);

var _matchAll = _.partial(_matchBy, []);

// creates the skill with cypher
var _create = function (params, callback) {
  
  var cypherParams = {
    name: params.name
  };

  var query = [
    'MERGE (skill:Skill {name: {name}})',
    'RETURN skill'
  ].join('\n');

  console.log('create query', query);

  callback(null, query, cypherParams);
};

var _createManySetup = function (params, callback) {
  if (params.names && _.isArray(params.names)) {
    callback(null, _.map(params.names, function (name) {
      return {name: name};
    }));
  } else if (params.skills && _.isArray(params.skills)) {
    callback(null, _.map(params.skills, function (skill) {
      return _.pick(skill, 'name');
    }));
  } else {
    callback(null, []);
  }
};

// update the skill with cypher
var _update = function (params, callback) {

  var cypherParams = {
    name: params.name
  };

  var query = [
    'MATCH (skill:Skill {name:{name}})',
    'SET skill.name = {name}',
    'RETURN skill'
  ].join('\n');

  callback(null, query, cypherParams);
};

// delete the skill and any relationships with cypher
var _delete = function (params, callback) {
  
  var cypherParams = {
    name: params.name
  };

  var query = [
    'MATCH (skill:Skill {name:{name}})',
    'OPTIONAL MATCH (skill)-[r]-()',
    'DELETE skill, r',
  ].join('\n');

  callback(null, query, cypherParams);
};

// delete all skills
var _deleteAll = function (params, callback) {
  
  var cypherParams = {};

  var query = [
    'MATCH (skill:Skill)',
    'OPTIONAL MATCH (skill)-[r]-()',
    'DELETE skill, r',
  ].join('\n');

  callback(null, query, cypherParams);
};

// create a new skill
var create = new Construct(_create, _singleSkill);

// create many new skills
var createMany = new Construct(_createManySetup).map(create);

var getByName = new Construct(_matchByName).query().then(_singleSkill);

var getAll = new Construct(_matchAll, _manySkills);

// get a skill by name and update it
var update = new Construct(_update, _singleSkill);

// delete a skill by name
var deleteSkill = new Construct(_delete);

// delete all skills
var deleteAllSkills = new Construct(_deleteAll);

// export exposed functions
module.exports = {
  create: create.done(),
  createMany: createMany.done(),
  getByName: getByName.done(),
  getAll: getAll.done(),
  deleteSkill: deleteSkill.done(),
  deleteAllSkills: deleteAllSkills.done(),
  update: update.done()
};