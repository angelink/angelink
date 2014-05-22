'use strict';

module.exports = {

  dist: {
    files: [

      // Copy fonts from app -> dist          
      {
        expand: true,
        cwd: '<%= paths.client.tld %>/assets/fonts',
        src: '*.{woff,svg,eot,ttf}',
        dest: '<%= paths.dist.tld%>/fonts'
      },

      // Copy various files from app -> dist
      {
        expand: true,
        cwd: '<%= paths.client.tld %>',
        src: ['.htaccess', '*.{ico,png,txt}'],
        dest: '<%= paths.dist.tld %>'
      }
    ]
  },

  // Copy dist directory to heroku/client
  heroku: {
    files: [{
      expand: true,
      cwd: '<%= paths.dist.tld %>',
      src: [
        '**/*'
      ],
      dest: '<%= paths.heroku.tld %>/client'
    }]
  },

  azure: {
    files: [{
      expand: true,
      cwd: '<%= paths.dist.tld %>',
      src: [
        '**/*'
      ],
      dest: '<%= paths.azure.tld %>/client'
    }]
  }
};