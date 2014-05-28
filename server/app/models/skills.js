'use strict';

// ## Module Dependencies
var _ = require('lodash');
var Architect = require('neo4j-architect');
// var neo4j = require('neo4j');
var QueryBuilder = require('../neo4j-qb/qb.js');
var utils = require('../utils');

Architect.init();

var Construct = Architect.Construct;
// var db = new neo4j.GraphDatabase(
//     process.env.NEO4J_URL ||
//     process.env.GRAPHENEDB_URL ||
//     'http://localhost:7474'
// );

// Presently only schema properties are being used in the query builder. 
// The value doesn't matter right now.
var schema = {
  id: String,
  name: String
};

var qb = new QueryBuilder('Skill', schema);

// ## Model

var Skill = function (_data) {
  _.extend(this, _data);

  // get the id from the self property returned by neo4j
  this.nodeId = +this.self.split('/').pop();
};

Skill.prototype.modelName = 'Skill';

// ## Results Functions
// To be combined with queries using _.partial()

var _singleSkill = _.partial(utils.formatSingleResponse, Skill);
var _manySkills = _.partial(utils.formatManyResponse, Skill);


// ## Query Functions
// Should be combined with results functions using _.partial()

var _matchById = qb.makeMatch(['id']);

var _matchAll = qb.makeMatch();

var _create = (function () {
  
  var onCreate = {
    created: 'timestamp()'
  };

  return qb.makeMerge(['name'], onCreate);
})();

var _update = qb.makeUpdate(['name']);

var _delete = qb.makeDelete(['name']);

var _deleteAll = qb.makeDelete();

var _createManySetup = function (params, callback) {
  if (params.list && _.isArray(params.list)) {
    callback(null, _.map(params.list, function (obj) {
      return _.pick(obj, Object.keys(schema));
    }));
  } else {
    callback(null, []);
  }
};

// ## Constructed Functions

// create a new skill
var create = new Construct(_create, _singleSkill);

// create many new skills
var createMany = new Construct(_createManySetup).map(create);

var getById = new Construct(_matchById).query().then(_singleSkill);

var getAll = new Construct(_matchAll, _manySkills);

// get a skill by name and update it
var update = new Construct(_update, _singleSkill);

// delete a skill by name
var deleteSkill = new Construct(_delete);

// delete all skills
var deleteAllSkills = new Construct(_deleteAll);

// static methods:

Skill.create = create.done();
Skill.createMany = createMany.done();
Skill.getById = getById.done();
Skill.getAll = getAll.done();
Skill.deleteSkill = deleteSkill.done();
Skill.deleteAllSkills = deleteAllSkills.done();
Skill.update = update.done();

module.exports = Skill;