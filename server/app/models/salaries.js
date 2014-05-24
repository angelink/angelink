'use strict';

// ## Module Dependencies
var _ = require('lodash');
var Salary = require('./neo4j/salary.js');
var Architect = require('neo4j-architect');

Architect.init();

var Construct = Architect.Construct;
var Cypher = Architect.Cypher;

// ## Results Functions
// To be combined with queries using _.partial()

// return a single user
var _singleSalary = function (results, callback) {
  if (results.length) {
    callback(null, new Salary(results[0].salary));
  } else {
    callback(null, null);
  }
};

// return many users
var _manySalaries = function (results, callback) {
  var salaries = _.map(results, function (result) {
    return new Salary(result.salary);
  });

  callback(null, salaries);
};


// ## Query Functions
// Should be combined with results functions using _.partial()

var _matchBy = function (keys, params, callback) {
  var cypherParams = _.pick(params, keys);

  var query = [
    'MATCH (salary:Salary)',
    Cypher.where('salary', keys),
    'RETURN salary'
  ].join('\n');

  console.log('_matchBy query', query);

  callback(null, query, cypherParams);
};

// var _matchByCUID = _.partial(_matchBy, ['id']);
// TODO: match by inbetween salaries/equity
// var _matchBySalary = _.partial(_matchBy, ['salaryMax', 'salaryMin']);
// var _matchByEquity = _.partial(_matchBy, ['equityMax', 'equityMin']);

var _matchAll = _.partial(_matchBy, []);

// creates the user with cypher
var _create = function (params, callback) {
  var cypherParams = {
    currency: params.currency,
    salaryMax: params.salaryMax,
    salaryMin: params.salaryMin,
    equityMax: params.equityMax,
    equityMin: params.equityMin
  };

  var query = [
    'MERGE (salary:Salary {currency: {currency}, salaryMax: {salaryMax}, salaryMin: {salaryMin}, equityMax: {equityMax}, equityMin: {equityMin}})',
    'RETURN salary'
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
// var _delete = function (params, callback) {
//   var cypherParams = {
//     id: params.id
//   };

//   var query = [
//     'MATCH (company:Company {id:{id}})',
//     'OPTIONAL MATCH (company)-[r]-()',
//     'DELETE company, r',
//   ].join('\n');

//   callback(null, query, cypherParams);
// };

// delete all users
// var _deleteAll = function (params, callback) {
//   var cypherParams = {};

//   var query = [
//     'MATCH (company:Company)',
//     'OPTIONAL MATCH (company)-[r]-()',
//     'DELETE user, r',
//   ].join('\n');

//   callback(null, query, cypherParams);
// };

// create a new user
var create = new Construct(_create, _singleSalary);

// var getById = new Construct(_matchByCUID).query().then(_singleCompany);

var getAll = new Construct(_matchAll, _manySalaries);

// get a user by id and update their properties
// var update = new Construct(_update, _singleUser);

// delete a user by id
// var deleteCompany = new Construct(_delete);

// delete a user by id
// var deleteAllCompanies = new Construct(_deleteAll);

// export exposed functions
module.exports = {
  // getById: getById.done(),
  create: create.done(),
  getAll: getAll.done(),
  // deleteCompany: deleteCompany.done(),
  // deleteAllCompanies: deleteAllCompanies.done(),
};