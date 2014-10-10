module.exports = function(grunt) {
  grunt.initConfig({
    concat: {
      options: {
        separator: '\n'
      },
      dist: {
        src: [
          'public/js/libs/jquery/dist/jquery.min.js',
          'public/js/libs/handlebars/handlebars.min.js',
          'public/js/libs/ember/ember.min.js',
          'public/js/libs/ember-data/index.js',
          'public/js/libs/firebase/firebase.js',
          'public/js/libs/emberFire/dist/emberfire.min.js',
          'public/js/libs/moment/min/moment.min.js',
          'public/js/libs/pagedown/Markdown.Converter.js',
          'public/js/libs/pagedown/Markdown.Sanitizer.js',
          'public/js/libs/randomColor/randomColor.js',
          'public/js/main.js',
        ],
        dest: 'public/js/app.js'
      }
    },
    watch: {
      files: ['public/js/libs/**/*.js', 'public/js/main.js'],
      tasks: ['concat']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat']);
};
