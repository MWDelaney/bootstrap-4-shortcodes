var gulp = require('gulp');
var markdown = require('gulp-markdown');
var sass		= require('gulp-sass');
var mainBowerFiles	= require('main-bower-files');
var concat		= require('gulp-concat');
var runSequence		= require('run-sequence');

var config = {
 	dist: './dist',
 	assets: './assets' 
}


// ### Clean
// `gulp clean` - Deletes the build folder entirely.
gulp.task('clean', require('del').bind(null, ['./dist']));


// ### Styles
// `gulp styles` - Compiles, combines, and optimizes Bower CSS and project CSS.
gulp.task('styles', function() { 
	return gulp.src(config.assets + '/styles/main.scss')
		.pipe(sass())
		.pipe(gulp.dest(config.dist + '/css'));
});


// Scripts
gulp.task("scripts", function(){
	return gulp.src(config.assets + '/scripts/*.js')
		.pipe(concat('main.js'))
		.pipe(gulp.dest(config.dist + '/js'))
});

// ### Fonts
gulp.task('fonts', function() {
	return gulp.src(config.assets + '/fonts/**.*')
		.pipe(gulp.dest(config.dist + '/fonts'));
});

gulp.task('docs', function () {
		return gulp.src('README.md')
				.pipe(markdown())
				.pipe(gulp.dest('docs'));
});

//Build task
gulp.task('build', function(callback) {
	runSequence('clean',
			'styles',
			'scripts',
			'fonts',
			'docs',
			callback);
});

// ### Gulp
// `gulp` - Run a complete build. To compile for production run `gulp --production`.
gulp.task('default', function() {
	gulp.start('build');
});
