module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	watch: {
	    src: {
		files: "src/*.js",
		tasks: ["babel:dist"],
	    },
	    gruntfile: {
		files: "Gruntfile.js",
		tasks: []
	    },
	},
	babel: {
	    options: {
		sourceMap: true,
		presets: ["@babel/preset-env"],
		plugins: ["@babel/plugin-transform-regenerator"],
	    },
	    dist: {
		cwd: 'src',
		expand: true,
		src: ['**/*.js'],
		dest: 'lib',
	    },
	    watch: {
		files: {
		}
	    },
	},
	eslint: {
	    target: ['src/*.js'],
	},
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-watch');
        grunt.loadNpmTasks('grunt-eslint');
    // Default task(s).
    grunt.registerTask('default', ['babel']);

    var changedFiles = Object.create(null);
    var onChange = grunt.util._.debounce(function() {
	const x = {};
	Object.keys(changedFiles).forEach(f => {
	    x[f.replace(/^(\.\/)?src\//, 'lib/')] = f;
	});
	console.log(x);
	grunt.config('babel.watch.files', x);
	changedFiles = Object.create(null);
}, 200);
grunt.event.on('watch', function(action, filepath) {
  changedFiles[filepath] = action;
  onChange();
});

};

