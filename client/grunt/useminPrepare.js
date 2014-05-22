'use strict';

// Reads HTML for usemin blocks to enable smart builds that automatically
// concat, minify and revision files. Creates configurations in memory so
// additional tasks can operate on them. Does not change the HTML.
module.exports = {
  html: '<%= paths.client.tld %>/index.html',
  options: {
    dest: '<%= paths.dist.tld %>',
    staging: '<%= paths.compiled.tld %>'
  }
};