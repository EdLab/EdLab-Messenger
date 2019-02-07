const gulp = require('gulp')
const bump = require('gulp-bump')

gulp.task('bump', function() {
  return gulp.src(['./*.json'])
    .pipe(bump())
    .pipe(gulp.dest('./'))
})

gulp.task('bump-minor', function() {
  return  gulp.src(['./*.json'])
    .pipe(bump({
      type: 'minor',
    }))
    .pipe(gulp.dest('./'))
})

gulp.task('bump-major', function() {
  return gulp.src(['./*.json'])
    .pipe(bump({
      type: 'major',
    }))
    .pipe(gulp.dest('./'))
})
