var gulp    = require('gulp'),
    connect = require('gulp-connect');
    open    = require('gulp-open');

gulp.task('http-server', [], function () {
	connect.server({
		root: './',
		port: 8080,
		livereload: true
	});
});

gulp.task('open', ['http-server'], function() {
	gulp.src('')
		.pipe(open({
			uri: 'http://localhost:8080/index.html'
		}));
});

gulp.task('default', ['open'], function () {
	// default tasks go here...
});
