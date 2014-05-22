'use strict';

// ## Module Dependencies

module.exports = function (grunt) {

  // Look for grunt config files in the 'grunt' directory
  // Uses load-grunt-tasks to load tasks
  require('load-grunt-config')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // ## Register all Grunt Tasks
  // target can be set using the following syntax: grunt serve:target
  grunt.registerTask('serve', function (target) {

    // If not using the connect server, this runs everything but the connect server...
    // If you want livereload to work with the settings in this file, in your server 
    // inject the livereload snippet using connect-livereload and configure to the same port set here
    if ('noserver' === target) {
      return grunt.task.run([
        'clean:serve',
        'bowerInstall',
        'newer:jshint',
        'concurrent:serve',
        'autoprefixer',
        'ngtemplates:serve',
        'watch'
      ]);
    }

    grunt.task.run([
      'clean:serve',
      'bower-install',
      'newer:jshint',
      'concurrent:serve',
      'autoprefixer',
      'ngtemplates:serve',
      'connect:livereload',
      'watch'
    ]);
  });

  // grunt.registerTask('test', [
  //   'clean:serve',
  //   'concurrent:test',
  //   'autoprefixer',
  //   'ngtemplates:serve',
  //   'connect:test',
  //   'karma'
  // ]);

  grunt.registerTask('build', [
    'clean:dist',
    'bower-install',
    'copy:dist',
    'compass:dist',
    'concurrent:dist',
    'useminPrepare',
    'autoprefixer',
    'concat',
    'ngtemplates:dist',
    'ngmin', // needs to be after concat
    'cssmin',
    'htmlmin',
    'uglify',
    'rev',
    'usemin', // run last
  ]);

  grunt.registerTask('dist', [
    'newer:jshint',
    'build'
  ]);

  grunt.registerTask('azure', [
    'dist',
    'copy:azure'
  ]);

  grunt.registerTask('heroku', [
    'dist',
    'copy:heroku'
  ]);
};