'use strict';

module.exports = {
  id: 'Person',
  properties: {
    id: {
      type: 'string',
      description: 'UUID from LinkedIn'
    },
    firstname: {
      type: 'string',
      description: 'Firstname of Person'
    },
    lastname: {
      type: 'string',
      description: 'Lastname of Person'
    },
    fullname: {
      type: 'string',
      description: 'Fullname of Person'
    },
    created: {
      type: 'integer',
      description: 'Unix Time Created'
    },
  }
};