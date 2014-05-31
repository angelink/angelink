'use strict';

// ## Module Dependencies
var _ = require('lodash');
var Architect = require('neo4j-architect');
// var db = require('../db');
var QueryBuilder = require('../neo4j-qb/qb.js');
var utils = require('../utils');
var when = require('when');

Architect.init();

var Construct = Architect.Construct;

// Presently only schema properties are being used in the query builder. 
// The value doesn't matter right now.
var schema = {
  id: String,
  name: String,
  normalized: String
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
var _matchByName = qb.makeMatch(['normalized']);

var _matchAll = qb.makeMatch();

var _create = (function () {
  
  var onCreate = {
    created: 'timestamp()'
  };

  return qb.makeMerge(['normalized'], onCreate);
})();

var _update = qb.makeUpdate(['id']);

var _delete = qb.makeDelete(['id']);

var _deleteAll = qb.makeDelete();

// var _createManySetup = function (params, callback) {
//   if (params && params.list && _.isArray(params.list)) {
//     callback(null, _.map(params.list, function (data) {
//       return _.pick(data, Object.keys(schema));
//     }));
//   } else {
//     callback(null, []);
//   }
// };

// ## Helper Functions
var _prepareParams = function (params) {
  // Create normalized name
  if (params.name) {
    params.normalized = utils.urlSafeString(params.name);
  }

  // Create ID if it doesn't exist
  if (!params.id) {
    params.id = utils.createId(params);
  }

  return params;
};

// ## Constructed Functions

// create a new skill
// var create = new Construct(_create, _singleSkill);

// var create = function (params, options, callback) {
//   var func = new Construct(_create, _singleSkill);
  
//   params = _prepareParams(params);

//   func.done().call(null, params, options, callback);
// };

var create = function (params, options) {
  var func = new Construct(_create, _singleSkill);
  var promise = when.promise(function (resolve) {

    // @NOTE Do any data cleaning/prep here...

    // make sure params is what we expect it to be
    params = _prepareParams(params);

    func.done().call(null, params, options, function (err, results, queries) {
      resolve({results: results, queries: queries});
    });
  });

  return promise;
};

// create = nodefn.lift(create);

// create many new skills
//
// Returns a promise
var createMany = function (list, options) {
  var promises = [];

  if (!list) return;

  // There is a good chance that 'list' is stringified JSON array so parse it.
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

// var createMany = new Construct(_createManySetup).map(create);

var getById = new Construct(_matchById).query().then(_singleSkill);

var getByName = new Construct(_matchByName).query().then(_singleSkill);

var getAll = new Construct(_matchAll, _manySkills);

// get a skill by name and update it
var update = function (params, options, callback) {
  var func = new Construct(_update, _singleSkill);

  params = _prepareParams(params);

  func.done().call(this, params, options, callback);
};

// delete a skill by name
var deleteSkill = new Construct(_delete);

// delete all skills
var deleteAllSkills = new Construct(_deleteAll);

// static methods:

Skill.create = create;
Skill.createMany = createMany;
Skill.getById = getById.done();
Skill.getByName = getByName.done();
Skill.getAll = getAll.done();
Skill.deleteSkill = deleteSkill.done();
Skill.deleteAllSkills = deleteAllSkills.done();
Skill.update = update;

module.exports = Skill;