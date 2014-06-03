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

var schema = {
  name: String
};

var qb = new QueryBuilder('Role', schema);

// ## Model

var Role = function(_data) {
  _.extend(this, _data);
  //get the unique node id
  this.nodeId = +this.self.split('/').pop();
};

Role.prototype.modelName = 'Role';

// ## Results Functions

var _singleRole = _.partial(utils.formatSingleResponse, Role);
var _manyRoles = _.partial(utils.formatManyResponse, Role);

// ## Query Functions
// Should be combined with results functions using _.partial()

var _matchById = qb.makeMatch(['id']);

var _matchAll = qb.makeMatch();

var _create = qb.makeMerge(['id']);

var _update = qb.makeUpdate(['id']);

var _delete = qb.makeDelete(['id']);

var _deleteAll = qb.makeDelete();

// var _createManySetup = function (params, callback) {
//   if (params.list && _.isArray(params.list)) {
//     callback(null, _.map(params.list, function (data) {
//       return _.pick(data, Object.keys(schema));
//     }));
//   } else {
//     callback(null, []);
//   }
// };

// ## Helper functions
var _prepareParams = function (params) {
  // Create ID if it doesn't exist
  if (!params.id) {
    params.id = utils.createId(params);
  }

  return params;
};

// ## Constructured functions
var create = function (params, options) {
  var func = new Construct(_create, _singleRole);
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

// var create = new Construct(_create, _singleSalary);

// var createMany = new Construct(_createManySetup).map(create);
var createMany = function (list, options) {
  var promises = [];

  if (!list) return;

  if (typeof list === 'string'){
    list = JSON.parse(list);
  }
  
  _.each(list, function (data) {
    var filtered = _.pick(data, Object.keys(schema));
    var promise = create(filtered, options);

    promises.push(promise);
  });

  return when.all(promises);
};

var getById = new Construct(_matchById).query().then(_singleRole);

var getAll = new Construct(_matchAll, _manyRoles);

// var update = new Construct(_update, _singleSalary);
var update = function (params, options, callback) {
  var func = new Construct(_update, _singleRole);

  params = _prepareParams(params);

  func.done().call(this, params, options, callback);
};

var deleteRole = new Construct(_delete);

var deleteAllRoles = new Construct(_deleteAll);

// static methods
Role.create = create;
Role.createMany = createMany;
Role.deleteRole = deleteRole.done();
Role.deleteAllRoles = deleteAllRoles.done();
Role.getById = getById.done();
Role.getAll = getAll.done();
Role.update = update;

module.exports = Role;
