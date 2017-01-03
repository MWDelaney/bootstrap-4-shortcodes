var gulp = require('gulp');
var markdown = require('gulp-markdown');
var sass		= require('gulp-sass');
var imagemin     = require('gulp-imagemin');
var mainBowerFiles	= require('main-bower-files');
var wiredep		= require('wiredep').stream;
var concat		= require('gulp-concat');
var runSequence		= require('run-sequence');
var mustache = require("gulp-mustache");

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
		.pipe(wiredep())
		.pipe(sass())
		.pipe(gulp.dest(config.dist + '/css'));
});

// Scripts
gulp.task("bower_scripts", function(){
	return gulp.src(mainBowerFiles('**/*.js'))
		.pipe(concat('package.js'))
		.pipe(gulp.dest(config.dist + '/scripts'))
});

// Scripts
gulp.task("scripts", function(){
	return gulp.src(config.assets + '/scripts/*.js')
		.pipe(gulp.dest(config.dist + '/scripts'))
});

// Fonts
gulp.task('fonts', function() {
	return gulp.src(config.assets + '/fonts/**.*')
		.pipe(gulp.dest(config.dist + '/fonts'));
});

// Images
gulp.task('images', function() {
  return gulp.src(config.assets + '/images/**.*')
    .pipe(imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{removeUnknownsAndDefaults: false}, {cleanupIDs: false}]
    }))
    .pipe(gulp.dest(config.dist + '/images'))
});

gulp.task('docs', function () {
	return gulp.src(config.assets + '/templates/*.mustache')
			.pipe(mustache(config.assets + '/json/documentation.json',{extension: '.php'},{}))
			.pipe(gulp.dest(config.dist + '/docs'));
});



//Build task
gulp.task('build', function(callback) {
	runSequence('clean',
			'styles',
			'bower_scripts',
			'scripts',
			'fonts',
			'images',
			'docs',
			callback);
});

// ### Gulp
// `gulp` - Run a complete build. To compile for production run `gulp --production`.
gulp.task('default', function() {
	gulp.start('build');
});
