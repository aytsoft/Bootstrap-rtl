const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const runSequence = require('run-sequence');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

var dev = true;


gulp.task('styles', () => {
    return gulp.src('assets/stylesheets/bootstrap.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('dist/styles/'))
        .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
    return gulp.src('assets/javascripts/*.js')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('dist/scripts'))
        .pipe(reload({stream: true}));
});
gulp.task('images', () => {
    return gulp.src('app/images/**/*')
        .pipe($.cache($.imagemin()))
        .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
    return gulp.src('assets/fonts/**/*.{eot,svg,ttf,woff,woff2}')
        .pipe(gulp.dest('dist/fonts/'));
});

gulp.task('clean', del.bind(null, ['dist']));

gulp.task('serve', () => {
    runSequence(['clean'], ['styles', 'scripts', 'fonts'], () => {
        browserSync.init({
            notify: false,
            port: 9000,
            server: {
                baseDir: ['./','./examples'],
            }
        });

        gulp.watch([
            './*.html',
            'assets/images/**/*',
            'assets/fonts/**/*'
        ]).on('change', reload);

        gulp.watch('assets/stylesheets/**/*.scss', ['styles']);
        gulp.watch('assets/javascripts/**/*.js', ['scripts']);
        gulp.watch('assets/fonts/**/*', ['fonts']);
    });
});
gulp.task('compressCss', () => {
    return gulp.src('dist/styles/bootstrap.css')
        .pipe($.cssnano({safe: true, autoprefixer: false}))
        .pipe($.rename("dist/styles/bootstrap.min.css"))
        .pipe(gulp.dest('./'));
});
gulp.task('default', () => {
    return new Promise(resolve => {
        dev = false;
        runSequence(['clean'], 'styles', 'scripts', 'fonts','images','compressCss', resolve);
    });
});