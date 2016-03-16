var gulp = require('gulp');
var spawn = require('child_process').spawn;
var node;

gulp.task('default',['serve'],function(){
	//console.log("This is the default task");
});

gulp.task('serve',function(){
	gulp.run('server');
	gulp.watch(['./app.js'],function(){
		gulp.run('server');
	});
});

gulp.task('server',function(){
	if (node) node.kill();
	node = spawn('node',['./app.js'], {stdio: 'inherit'});
	
});