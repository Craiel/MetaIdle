var gulp = require('gulp'),
    traceur = require('gulp-traceur')
paths = {
    scripts: ['src/*.js', 'src/**/*.js']
};

gulp.task('scripts', function () {
    gulp.src(paths.scripts)
        .pipe(traceur())
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts']);
});

gulp.task('default', ['scripts', 'watch']);