module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsdoc: {
            dist: {
                src: ['src/**/*.js'],
                options: {
                    destination: 'doc',
                    config: 'jsdoc.config.js',
                },
            },
        },
        watch: {
            src: {
                files: ['src/**/*.js'],
                tasks: ['babel:dist', 'jsdoc:dist'],
            },
            doc: {
                files: ['src/**/*.js', 'plugins/restructuredtext.js', 'templates/**/*.tmpl'],
                tasks: ['jsdoc:dist'],
            },
            gruntfile: {
                files: 'Gruntfile.js',
                tasks: [],
            },
        },
        babel: {
            options: {
                sourceMap: true,
                presets: ['@babel/preset-env'],
                plugins: ['@babel/plugin-transform-regenerator'],
            },
            dist: {
                cwd: 'src',
                expand: true,
                src: ['**/*.js'],
                dest: 'lib',
            },
            watch: {
                files: {
                },
            },
        },
        eslint: {
            target: ['src/*.js'],
        },
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-watch');
        grunt.loadNpmTasks('grunt-eslint');
    // Default task(s).
    grunt.registerTask('default', ['babel']);

    let changedFiles = Object.create(null);
    const onChange = grunt.util._.debounce(() => {
        const x = {};
        Object.keys(changedFiles).forEach((f) => {
            x[f.replace(/^(\.\/)?src\//, 'lib/')] = f;
        });
        console.log(x);
        grunt.config('babel.watch.files', x);
        changedFiles = Object.create(null);
}, 200);
grunt.event.on('watch', (action, filepath) => {
  changedFiles[filepath] = action;
  onChange();
});
};
