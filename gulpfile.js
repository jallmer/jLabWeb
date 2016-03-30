var gulp = require('gulp'),
        gutil = require('gulp-util'),
        gls = require('gulp-live-server'),
        uglify = require('gulp-uglify'),
        cleanCSS = require('gulp-clean-css');

//Prepare paths variable for resources.
var paths = {
    scripts: 'dev/js/',
    stylesheets: 'dev/css/',
    routes: 'routes/'
};

//Building javascript files and copy to public folder. Watch to dev/js folder for actions 
gulp.task('build-js', function () {
    return gulp.src(paths.scripts + "**/*.js")
            .pipe(uglify())
            .pipe(gulp.dest('public/js/'));
});
gulp.watch('dev/js/**/*.js', function (file) {
    console.log('File ' + file.path + ' was ' + file.type + ', running tasks...');
    gulp.start('build-js');
});

//Building stylesheets and copy to public folder. Watch to dev/css folder for actions 
gulp.task('build-css', function () {
    return gulp.src(paths.stylesheets + "**/*.css")
            .pipe(cleanCSS())
            .pipe(gulp.dest('public/css/'));
    console.log('css exported');
});
gulp.watch('dev/css/**/*.css', function (file) {
    console.log('File ' + file.path + ' was ' + file.type + ', running tasks...');
    gulp.start('build-css');
});

//Server start and 
gulp.task('serve', function () {
    //1. run your script as a server 
    var server = gls.new('./bin/www', {env: {DEBUG: 'jLabWeb:*'}});
    server.start();

    //use gulp.watch to trigger server actions(notify, start or stop) 
    gulp.watch(['app.js', './bin/www', 'routes/*.js', './dev/utils/**/*.js'], function (file) {
        console.log('File ' + file.path + ' was ' + file.type + ', running tasks...');
        server.start.bind(server)();
        server.notify.bind(server)(file);
    });
});

gulp.task('default', ['serve', 'build-js', 'build-css']);
