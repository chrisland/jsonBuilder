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
	        { cwd: 'dev/', src: 'css/img/icon_del.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/icon_dupli.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/icon_obj.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/icon_add.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/icon_new.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/icon_open.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/icon_save.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/icon_undo.svg', dest: 'live/', expand: true },
	        { cwd: 'dev/', src: 'css/img/icon_redo.svg', dest: 'live/', expand: true }
	        ]
	    }
	},
    nodewebkit: {
		options: {
			version: '0.9.2',
			app_name: 'jsonBuilder',
			app_version: '0.5',
			build_dir: './release', // Where the build version of my node-webkit app is saved
			mac: true, // We want to build it for mac
			win: true, // We want to build it for win
			linux32: false, // We don't need linux32
			linux64: false, // We don't need linux64
			mac_icns: 'jsonbuilder.icns',
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