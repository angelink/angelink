'use strict';

module.exports = {
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
    fullname: {
      type: 'string',
      description: 'Fullname of User'
    },
    email: {
      type: 'string',
      description: 'Users Email. Set when this user becomes a member. Not available to unauthenticated requests.'
    },
    linkedinToken: {
      type: 'string',
      description: 'User LinkedIn Token. Set when this user becomes a member. Not available to unauthenticated requests.'
    },
    profileImage: {
      type: 'string',
      description: 'Image URL'
    },
    joined: {
      type: 'integer',
      description: 'Unix Time. Set when this user becomes a member.'
    },
    created: {
      type: 'integer',
      description: 'Unix Time Created'
    },
  }
};