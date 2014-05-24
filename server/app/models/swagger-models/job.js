'use strict';

module.exports = {
  id: 'Job',
  properties: {
    id: {
      type: 'string',
      description: 'JUID from AngelList'
    },
    title: {
      type: 'string',
      description: 'Job title'
    },
    applyURL: {
      type: 'string',
      description: 'URL with job application'
    },
    created: {
      type: 'string',
      description: 'Unix Time Created'
    }
  }
};