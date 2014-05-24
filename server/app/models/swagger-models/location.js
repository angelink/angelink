'use strict';

module.exports = {
  id: 'Location',
  properties: {
    city: {
      type: 'string',
      description: 'City name'
    },
    state: { // state or province
      type: 'string',
      description: 'State or province'
    },
    country: {
      type: 'string',
      description: 'Country'
    },
  }
};