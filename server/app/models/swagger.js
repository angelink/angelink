'use strict';

module.exports = {
  User: {
    id: 'User',

    properties: {
      id: {
        type: 'string',
        description: 'UUID from LinkedIn'
      },
      firstname: {
        type: 'string',
        description: 'Firstname of User'
      },
      lastname: {
        type: 'string',
        description: 'Lastname of User'
      },
      created: {
        type: 'integer',
        description: 'Unix Time Created'
      }
    }
  }
};