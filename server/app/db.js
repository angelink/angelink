'use strict';

// ## Module Dependencies
var neo4j = require('neo4j');

var db = new neo4j.GraphDatabase(
    process.env.NEO4J_URL ||
    process.env.GRAPHENEDB_URL ||
    'http://localhost:7474'
);

module.exports = db;