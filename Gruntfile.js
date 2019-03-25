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
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-babel');

    // Default task(s).
    grunt.registerTask('default', ['babel']);

};
