'use strict';

// ## Module Dependencies
var sw = require('swagger-node-express');
var utils = require('../../utils');


// ## Models
var Locations = require('../../models/locations');

var param = sw.params;
var swe = sw.errors;


// ## API Specs


// Route: GET '/locations'
// exports.list = {

//   spec: {
//     description : "List all locations",
//     path : "/locations",
//     method: "GET",
//     summary : "Find all locations",
//     notes : "Returns all locations",
//     type: "array",
//     items: {
//       $ref: "User"
//     },
//     produces: ["application/json"],
//     parameters : [],
//     responseMessages: [swe.notFound('locations')],
//     nickname : "getLocations"
//   },

//   action: function (req, res) {
//     var options = {};
//     var start = new Date();
    
//     options.neo4j = utils.existsInQuery(req, 'neo4j');

//     function callback (err, results, queries) {
//       if (err || !results) throw swe.notFound('locations');
//       utils.writeResponse(res, results, queries, start);
//     }

//     Locations.getAll(null, options, callback);
//   }
// };


// Route: POST '/locations'
exports.addLocation = {
  
  spec: {
    path : '/locations',
    notes : 'adds a location to the graph',
    summary : 'Add a new location to the graph',
    method: 'POST',
    type : 'array',
    items : {
      $ref: 'User'
    },
    parameters : [
      param.query('city', 'City', 'string', true),
      param.query('state', 'State', 'string', true),
      param.query('country', 'Country', 'string', true),
    ],
    responseMessages : [swe.invalid('input')],
    nickname : 'addLocation'
  },

  action: function(req, res) {
    var options = {};
    var start = new Date();

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    Locations.create({
      city: utils.getQueryValue(req, 'city'),
      state: utils.getQueryValue(req, 'state'),
      country: utils.getQueryValue(req, 'country')
    }, options, function (err, results, queries) {
      if (err || !results) throw swe.invalid('input');
      utils.writeResponse(res, results, queries, start);
    });
  }
};


// Route: GET '/locations/:loc'
exports.find = {
  
  spec: {
    description : 'find a location',
    path : '/locations/{loc}',
    notes : 'Returns a location based on city+state+country',
    summary : 'Find location by city, state, and country combination',
    method: 'GET',
    parameters : [
      param.path('loc', 'city, state, and country combination of location that needs to be fetched', 'string'),
    ],
    type : 'Location',
    responseMessages : [swe.invalid('location'), swe.notFound('location')],
    nickname : 'getLocation'
  },

  action: function (req, res) {
    var loc = req.params.loc;
    var options = {};
    var params = {};
    var start = new Date();

    options.neo4j = utils.existsInQuery(req, 'neo4j');

    if (!loc) throw swe.invalid('location');

    params.loc = loc;

    var callback = function (err, results, queries) {
      if (err) throw swe.notFound('location');
      utils.writeResponse(res, results, queries, start);
    };

    Locations.getLocation(params, options, callback);
  }
};