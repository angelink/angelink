'use strict';

// Automatically inject Bower components into the app
module.exports = {
  app: {
    html: '<%= paths.client.tld %>/index.html',
    ignorePath: 'src/',
    exclude: [
      /jquery/,
      /sass-bootstrap/
    ]
  }
};
