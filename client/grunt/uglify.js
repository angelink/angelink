'use strict';

// Optimize JS not handled by usemin and useminPrepare
module.exports = {
  options: {
    // mangle is f'in shit up so we turned it off
    mangle: false
  },
  templates: {
    files: {
      '<%= paths.dist.tld %>/scripts/app.templates.js' : '<%= paths.dist.tld %>/scripts/app.templates.js'
    }
  }
};