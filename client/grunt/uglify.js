'use strict';

// Optimize JS not handled by usemin and useminPrepare
module.exports = {
  templates: {
    files: {
      '<%= paths.dist.tld %>/scripts/app.templates.js' : '<%= paths.dist.tld %>/scripts/app.templates.js'
    }
  }
};