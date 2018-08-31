// Requires the gulp plugin
var gulp = require('gulp');
// Requires the gulp-sass plugin
var sass = require('gulp-sass');
// Requires browsersync plugin
var browserSync = require('browser-sync').create();
// Requires to set an useref task
var useref = require('gulp-useref');
// Requires tasks
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var gulpIf = require('gulp-if');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');

gulp.task('compile-scss', function () {
    return gulp.src('app/scss/**/*.scss') // Get source files with gulp.src
      .pipe(sass()) // Sends it through a gulp plugin
      .pipe(gulp.dest('app/css')) // Outputs the file in the destination folder
      .pipe(browserSync.reload({
          stream: true
      }))
});

gulp.task('watch', ['browserSync', 'compile-scss'], function(){
    // Gulp watch syntax
    gulp.watch('app/scss/**/*.scss', ['compile-scss']);
    // Reloads the browser whenever HTML or JS files change 
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
     //other watchers
});

gulp.task('build', function (callback) {
    runSequence('clean:dist', // First action, cleaning the dist folder
      ['compile-scss', 'useref', 'images', 'fonts'], // Then the sequence runs the other tasks and building a new clean dist folder
      callback
    )
});

gulp.task('default', function (callback) {
    runSequence(['compile-scss','browserSync', 'watch'],
      callback
    )
  })

gulp.task('browserSync', function() {
    browserSync.init({
      server: {
        baseDir: 'app'
      },
    })
});

gulp.task('images', function(){
    return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
    .pipe(cache(imagemin({
        interlaced: true
      })))
    .pipe(gulp.dest('dist/images'))
});

// Pushed fonst from app folder to dist folder
gulp.task('fonts', function() {
    return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
});
// Remove dist folder
gulp.task('clean:dist', function() {
    return del.sync('dist');
});

// Deletes image cache
gulp.task('cache:clear', function (callback) {
    return cache.clearAll(callback)
    })

gulp.task('useref', function(){
    return gulp.src('app/*.html')
      .pipe(useref())
      //Minifies JS
      .pipe(gulpIf('*.js', uglify()))
      //Minifies Css
      .pipe(gulpIf('*.css', cssnano()))
      .pipe(gulp.dest('dist'))
});
