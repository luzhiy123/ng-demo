'use strict';

module.exports = function(grunt) {

    var port = 8282,
        host = "0.0.0.0",
        tag = grunt.option('tag') || '0.0.1';

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        'http-server': {
            'dev': {
                port: port,
                host: host,
                autoIndex: true,
                ext: "html"
            }
        },

        clean: {
            build: ['build'],
            dist: ['dist'],
        },

        copy: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**'],
                    dest: 'build/'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'build',
                    src: ['index.html', 'locales/**', 'css/**/*.css', 'js/**/*.js', ],
                    dest: 'dist'
                }, {
                    expand: true,
                    cwd: 'build/assets/img',
                    src: '*',
                    dest: 'dist/img/',
                    flatten: false,
                    filter: 'isFile'
                }]
            }
        },

        wiredep: {
            task: {
                src: ['src/index.html']
            }
        },

        angularFileLoader: {
            options: {
                scripts: ['src/app/**/*.js', 'src/components/**/*.js']
            },
            default_options: {
                src: 'src/index.html'
            }
        },

        compass: {
            dev: {
                options: {
                    sassDir: ['src/sass/'],
                    specify: 'src/sass/main.scss',
                    cssDir: ['src/assets/css'],
                    environment: 'development'
                }
            }
        },

        replace: {
            dist: {
                options: {
                    patterns: [{
                        match: /var tag \= \'\'; \/\/@@TAG/,
                        replacement: function() {
                            return "var tag = '" + tag + "'";
                        }
                    }]
                },
                files: [{
                    src: 'build/app/app.module.js',
                    dest: 'build/app/app.module.js'
                }]
            }
        },

        ngAnnotate: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'build',
                    src: ['**/*.js'],
                    dest: 'build'
                }]
            }
        },

        ngtemplates: {
            app: {
                cwd: 'build/',
                src: ['**/**.html', '!index.html'],
                dest: 'build/app/templates.js'
            }
        },

        useref: {
            html: 'build/index.html',
            temp: 'build'
        },

        watch: {
            vendor: {
                files: ['vendor/*'],
                tasks: ['wiredep']
            },
            loader: {
                files: ['src/*'],
                tasks: ['angularFileLoader']
            },
            styles: {
                files: ['src/**/*.scss'],
                tasks: ['compass'],
                options: {
                    nospawn: true
                }
            },
        }

    });

    grunt.loadNpmTasks('grunt-http-server');
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks("grunt-angular-file-loader");
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-useref');
    grunt.loadNpmTasks('grunt-replace');

    grunt.registerTask('server', ['http-server:dev']);
    grunt.registerTask('reload', ['angularFileLoader']);

    grunt.registerTask('inject', ['wiredep', 'angularFileLoader']);
    grunt.registerTask('work', ['inject', 'watch:loader', 'watch:styles', 'http-server:dev']);
    grunt.registerTask('build', ['clean:build', 'copy:build', 'inject', 'replace:dist', 'ngAnnotate', 'ngtemplates', 'useref', 'concat', 'uglify', 'cssmin', 'clean:dist', 'copy:dist']);

};
