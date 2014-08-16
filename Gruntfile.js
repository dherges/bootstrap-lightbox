/*
 * grunt-bower
 * https://github.com/dherges/grunt-bower
 *
 * Copyright (c) 2014 David Herges
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    connect: {
      server: {
        options: {
          host: 'localhost',
          port: 3000,
          base: '.',
          keepalive: true
        }
      }
    },

    less: {
      options: {
        relativeUrls: true,
        strictMath: true
      },
      compile: {
        options: {
          sourceMap: true
        },
        files: {
          'styles/lightbox.css': 'styles/lightbox.less'
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-less');

  // By default, lint and run all tests.
  grunt.registerTask('default', ['less', 'connect']);

};
