module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
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
	},
	eslint: {
	    target: ['src/*.js'],
	},
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-babel');
        grunt.loadNpmTasks('grunt-eslint');
    // Default task(s).
    grunt.registerTask('default', ['babel']);

};
