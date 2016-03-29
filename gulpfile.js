var gulp = require('gulp'),
        gutil = require('gulp-util'),
        gls = require('gulp-live-server'),
        uglify = require('gulp-uglify'),
        cleanCSS = require('gulp-clean-css');

var paths = {
    scripts: 'dev/js/',
    stylesheets: 'dev/css/',
    routes: 'routes/'
};

gulp.task('build-js', function () {
    return gulp.src(paths.scripts + "**/*.js")
            .pipe(uglify())
            .pipe(gulp.dest('public/js/'));
});

gulp.task('build-css', function () {
    return gulp.src(paths.stylesheets + "**/*.css")
            .pipe(cleanCSS())
            .pipe(gulp.dest('public/css/'));
    console.log('css exported');
});


gulp.task('serve', function () {
    //1. run your script as a server 
    var server = gls.new('./bin/www', {env: {DEBUG: 'jLabWeb:*'}});
    server.start();

    //use gulp.watch to trigger server actions(notify, start or stop) 
    gulp.watch(['app.js', './bin/www', 'routes/*.js', 'dev/js/**/*.js', 'dev/css/**/*.css'], function (file) {
        console.log('File ' + file.path + ' was ' + file.type + ', running tasks...');
        server.notify.bind(server)(file);
    });
});

gulp.task('default', ['serve', 'build-js', 'build-css']);
