'use strict';

// ## Module Dependencies
var _ = require('lodash');
var Architect = require('neo4j-architect');
var db = require('../db');
var QueryBuilder = require('../neo4j-qb/qb.js');
var util = require('util');
var utils = require('../utils');
var when = require('when');

Architect.init();

var Construct = Architect.Construct;

var schema = {
  id: String
};

var qb = new QueryBuilder('Quality', schema);

// ## Model
var Quality = function (_data) {
  _.extend(this, _data);
  // get the id from the self property returned by neo4j
  this.nodeId = +this.self.split('/').pop();
};

// Must be exactly the same as the Class variable name above
Quality.prototype.modelName = 'Quality';

// ## Results Functions
var _singleQuality = _.partial(utils.formatSingleResponse, Quality);

// ## Query Functions
var _create = qb.makeMerge(['id']);

// ## Constructured functions
var create = function (params, options) {
  var func = new Construct(_create, _singleQuality);
  var promise = when.promise(function (resolve) {

    func.done().call(null, params, options, function (err, results, queries) {
      resolve({results: results, queries: queries});
    });
  });

  return promise;
};

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

Quality.prototype.onDay = _.partial(_hasRelationship, {label:'ON_DAY'});

Quality.create = create;

module.exports = Quality;
