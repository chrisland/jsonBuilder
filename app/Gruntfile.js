module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
	    options: {
	      separator: ';',
	    },
	    dist: {
	      src: ['dev/js/jquery-2.1.0.min.js', 'dev/js/splitter.js', 'dev/js/main.js', 'dev/js/gremlin.min.js'],
	      dest: 'dev/js_grunt/main.js',
	    },
	  },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> v<%= pkg.version %>  - <%= grunt.template.today("yyyy-mm-dd") %> */\n/*! Christian Marienfeld  - http://jsonbuilder.chrisland.de */\n'
      },
      build: {
        src: './dev/js_grunt/*.js',
        dest: './live/js/main.min.js'
      }
    },
    cssmin: {
	  minify: {
	    expand: true,
	    cwd: 'dev/css/',
	    src: ['*.css', '!*.min.css'],
	    dest: './live/css',
	    ext: '.min.css'
	  }
	},
    copy: {
	    dev: {
	        files: [{
	            cwd: 'dev/',
	            src: 'index_grunt.html',
	            dest: 'live/',
	            expand: true,
	            rename: function(dest, src) {
	              return 'live/index.html';
	            }
	        },
	        { cwd: 'dev/', src: 'package.json', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'icon.png', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/arrow484.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/arrow506.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/document79.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/floppy13.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/open127.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/keys.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/text72.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/plus32.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/documents4.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/indent2.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/minus24.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'fonts/Roboto-Regular.ttf', dest: 'live/', expand: true },
	        ]
	    }
	},
    nodewebkit: {
		options: {
			version: '0.9.2',
			app_name: 'jsoning',
			app_version: '0.5',
			build_dir: './release', // Where the build version of my node-webkit app is saved
			mac: true, // We want to build it for mac
			win: true, // We want to build it for win
			linux32: false, // We don't need linux32
			linux64: false, // We don't need linux64
			mac_icns: 'jsoning.icns',
			credits: 'credits.html'
		},
		src: ['./live/**/*'] // Your node-wekit app
	},
  });
  
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-node-webkit-builder');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['concat','uglify','cssmin','copy','nodewebkit']);

};