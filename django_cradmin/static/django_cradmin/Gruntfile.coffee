module.exports = (grunt) ->

  appfiles = {
    coffeecode: ['src/**/*.coffee', '!src/**/*.spec.coffee']
    coffeetests: ['src/**/*.spec.coffee']
    less: ['src/less/*.less', 'src/less/**/*.less']
  }

  vendorfiles = {
    fonts: [
      'bower_components/fontawesome/fonts/FontAwesome.otf'
      'bower_components/fontawesome/fonts/fontawesome-webfont.eot'
      'bower_components/fontawesome/fonts/fontawesome-webfont.svg'
      'bower_components/fontawesome/fonts/fontawesome-webfont.ttf'
      'bower_components/fontawesome/fonts/fontawesome-webfont.woff'
    ]
    js: [
      'bower_components/angular/angular.min.js'
      # 'bower_components/angular/angular.min.js.map'
      # 'bower_components/angular/angular.js'
      # 'bower_components/angular/angular.js.map'
      'bower_components/angular-bootstrap/ui-bootstrap.min.js'
    ]
    ace_markdown_editor: [
      'bower_components/angular-ui-ace/ui-ace.min.js'
      'bower_components/ace-builds/src-min-noconflict/ace.js'
      'bower_components/ace-builds/src-min-noconflict/mode-markdown.js'
      'bower_components/ace-builds/src-min-noconflict/theme-tomorrow.js'
    ]
  }

  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-coffeelint')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-karma')

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')

    delta:
      less:
        files: appfiles.less
        tasks: 'less'
      coffeecode:
        files: appfiles.coffeecode
        tasks: ['coffeelint:code', 'buildCode', 'karma:watchrunner:run']
      coffeetests:
        files: appfiles.coffeetests
        tasks: ['coffeelint:tests', 'coffee:tests', 'karma:watchrunner:run']
      gruntfile:
        files: 'Gruntfile.coffee'
        tasks: ['coffeelint:gruntfile']

    less:
      development:
        options:
          paths: ["less", "bower_components"]
        files:
          "dist/css/styles.css": "src/less/styles.less"

    coffeelint:
      code: appfiles.coffeecode
      tests: appfiles.coffeetests
      gruntfile: ['Gruntfile.coffee']

    coffee:
      code:
        expand: true
        cwd: '.'
        src: appfiles.coffeecode
        dest: '.'
        ext: '.js'
      tests:
        expand: true
        cwd: '.'
        src: appfiles.coffeetests
        dest: '.'
        ext: '.spec.js'

    concat:
      cradmin:
        src: ['src/**/*.js', '!src/**/*.spec.js']
        dest: 'dist/js/cradmin.js'

    uglify:
      options:
        mangle: false
        sourceMap: true
      cradmin:
        files:
          'dist/js/cradmin.min.js': ['dist/js/cradmin.js']

    copy:
      vendor:
        files: [{
          expand: true
          flatten: true
          src: vendorfiles.fonts
          dest: 'dist/vendor/fonts/'
        }, {
          expand: true
          flatten: true
          src: vendorfiles.js
          dest: 'dist/vendor/js/'
        }, {
          expand: true
          flatten: true
          src: vendorfiles.ace_markdown_editor
          dest: 'dist/vendor/js/ace-markdown-editor/'
        }]

    karma:
      options:
        # base path that will be used to resolve all patterns
        basePath: ''

        # frameworks to use
        # available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine']

        # Browsers to autostart
        browsers : ['Chrome']

        # list of files / patterns to load in the browser
        files: [
          'bower_components/angular/angular.js'
          'bower_components/angular-mocks/angular-mocks.js'
          #'bower_components/angular-ui-ace/ui-ace.min.js'
          #'bower_components/ace-builds/src-min-noconflict/ace.js'
          'src/lib/**/*.js'
        ]

        # list of files to exclude
        exclude: []

        plugins : [
          'karma-chrome-launcher'
          'karma-firefox-launcher'
          'karma-jasmine'
        ]

        # preprocess matching files before serving them to the browser
        # available preprocessors:
        # https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {}

        # test results reporter to use
        # possible values: 'dots', 'progress'
        # available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['dots'],

        # enable / disable colors in the output (reporters and logs)
        colors: true

        # level of logging
        logLevel: 'INFO'

        # enable / disable watching file and executing tests whenever any file
        # changes
        autoWatch: false

      # Runs the test server in the background. We trigger tests
      # using ``karma:watchrunner:run``
      watchrunner:
        port: 9019,
        background: true

      # Used when we just want to run the tests and exit
      singlerun:
        singleRun: true
        port: 9876


  })

  grunt.registerTask('buildCode', [
    'coffee:code'
    'concat:cradmin'
    'uglify:cradmin'
  ])

  grunt.registerTask('build', [
    'coffeelint'
    'less'
    'coffee:tests'
    'buildCode',
    'karma:singlerun'
  ])

  grunt.registerTask('dist', [
    'build'
    'copy:vendor'
  ])

  # Rename the watch task to delta, and make a new watch task that runs
  # build on startup
  grunt.renameTask('watch', 'delta')
  grunt.registerTask('watch', [
    'build'
    'karma:watchrunner:start'
    'delta'
  ])

  grunt.registerTask('default', ['build'])
