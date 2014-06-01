'use strict';

module.exports = {
  id: 'Salary',
  properties: {
    currency: {
      type: 'string',
      description: 'Salary currency'
    },
    salaryMax: {
      type: 'integer',
      description: 'Salary maximum'
    },
    salaryMin: {
      type: 'integer',
      description: 'Salary minimum'
    },
    equityMax: {
      type: 'integer',
      description: 'Equity maximum'
    },
    equityMin: {
      type: 'integer',
      description: 'Equity minimum'
    },
  }
};