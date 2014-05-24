'use strict';

// ## Module Dependencies
var _ = require('lodash');
var sw = require('swagger-node-express');
var utils = require('../../utils');


// ## Models
var Skills = require('../../models/skills');

var param = sw.params;
var swe = sw.errors;

// ## API Specs


// Route: GET '/skills'
// exports.list = {

//   spec: {
//     description : "List all skills",
//     path : "/skills",
//     method: "GET",
//     summary : "Find all skills",
//     notes : "Returns all skills",
//     type: "array",
//     items: {
//       $ref: "User"
//     },
//     produces: ["application/json"],
//     parameters : [],
//     responseMessages: [swe.notFound('skills')],
//     nickname : "getSkills"
//   },

//   action: function (req, res) {
//     var options = {};
//     var start = new Date();
    
//     options.neo4j = utils.existsInQuery(req, 'neo4j');

//     function callback (err, results, queries) {
//       if (err || !results) throw swe.notFound('skills');
//       utils.writeResponse(res, results, queries, start);
//     }

//     Skills.getAll(null, options, callback);
//   }
// };


// Route: POST '/skills'
exports.addSkill = {
  
  spec: {
    path : '/skills',
    notes : 'adds a skill to the graph',
    summary : 'Add a new skill to the graph',
    method: 'POST',
    type : 'array',
    items : {
      $ref: 'User'
    },
    parameters : [
      param.query('name', 'Skill name. Will be normalized before being saved.', 'string', true),
    ],
    responseMessages : [swe.invalid('input')],
    nickname : 'addSkill'
  },

  action: function(req, res) {
    var options = {};
    var names = [];
    var start = new Date();

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    // so that we are able to add multiple skills at once
    names = _.invoke(utils.getQueryValue(req, 'name').split(','), 'trim');

    // normalize the names
    names = _.map(names, function (name) {
      return utils.normalize(name);
    });

    if (!names.length){
      throw swe.invalid('input');
    } else {
      Skills.createMany({
        names: names
      }, options, function (err, results, queries) {
        if (err || !results) throw swe.invalid('input');
        utils.writeResponse(res, results, queries, start);
      });
    }
  }
};


// Route: GET '/skills/:name'
exports.findByName = {
  
  spec: {
    description : 'find a skill',
    path : '/skills/{name}',
    notes : 'Returns a skill based on name',
    summary : 'Find skill by name',
    method: 'GET',
    parameters : [
      param.path('name', 'name of skill that needs to be fetched', 'string'),
    ],
    type : 'User',
    responseMessages : [swe.invalid('name'), swe.notFound('skill')],
    nickname : 'getSkillByName'
  },

  action: function (req, res) {
    var name = req.params.name;
    var options = {};
    var params = {};
    var start = new Date();

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    if (!name) throw swe.invalid('name');

    params.name = name;

    var callback = function (err, results, queries) {
      if (err) throw swe.notFound('skill');
      utils.writeResponse(res, results, queries, start);
    };

    Skills.getSkillByName(params, options, callback);
  }
};