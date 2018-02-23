/*
* --INSTALL--
* npm install -g gulp
* npm install
* gem install sass
* gem install scss-lint
*
* --USING--
* 1) For development
* gulp dev
* 2) For production (minifycate scripts and css)
* gulp
*
* -- SUBTITLES MODULE
* Use key --subtitles=true. For this case, you can build ysp.js for Youtube Subtitles module
*
* -- OFFERINGS MODULE
* Use key --offerings=true. For this case, you can build voicebase.offerings.js
*
* In development task we use source maps for comfortable debug.
* In production source maps are not used. So before commit need to run task "gulp"
*
* --LIVERELOAD--
* 1) Install chrome extension LiveReload. https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei
* 2) Enable it on your web page
*
* -- ZIP build --
* gulp zip_build --vbVersion x.x
* vbVersion - this is version of VoiceBase player
* Example: gulp zip_build --vbVersion 1.31
* */

var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var scsslint = require('gulp-scss-lint');
var autoprefixer = require('gulp-autoprefixer');
var urlAdjuster = require('gulp-css-url-adjuster');

var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var connect = require('gulp-connect');
var rename = require('gulp-rename');
var minifycss = require('gulp-minify-css');
var ext_replace = require('gulp-ext-replace');
var runSequence = require('run-sequence');
var clean = require('gulp-clean');
var zip = require('gulp-zip');
var args   = require('yargs').argv;

var js_sources = ['js/main.js', 'js/modules/**/*.js'];
var css_sources = ['css/jwplayer.vb-sdk-plugin.css'];
var sass_sources = {
    main: ['sass/main.scss'],
    dev: ['sass/**/*.scss'],
    kalturaIframe: ['sass/components/commentsMarkers.scss']
};
var html_sources = ['*.html', 'readme/*.html'];

var subtitles_sources = ['js/subtitles/YoutubeSubtitles.js', 'js/subtitles/modules/**/*.js'];

var offerings_sources = ['js/offerings/offerings.js', 'js/offerings/modules/**/*.js'];

var reload = function(sources){
    return gulp.src(sources)
        .pipe(connect.reload());
};

var lintConfig = {
    sub: true,
    multistr:true,
    loopfunc: true
};

gulp.task('connect', function(){
    connect.server({
        root: [__dirname],
        port: 8181,
        livereload: true
    });
});

gulp.task('lint', function() {
    return gulp.src(js_sources)
        .pipe(jshint(lintConfig))
        .pipe(jshint.reporter('default'))
});

var jsModule = function(sources, name, dest) {
    return gulp.src(sources)
        .pipe(sourcemaps.init())
        .pipe(concat(name))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(dest))
        .pipe(connect.reload());
};

var jsMinModule = function(sources, name, dest) {
    return gulp.src(sources)
        .pipe(concat(name))
        .pipe(gulp.dest(dest))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(dest))
        .pipe(connect.reload());
};

gulp.task('scripts', function() {
    return jsModule(js_sources, 'jquery.voicebase.js', 'js');
});

gulp.task('subtitles', function(){
    return jsModule(subtitles_sources, 'ysp.js', 'js');
});

gulp.task('min_subtitles', function(){
    return jsMinModule(subtitles_sources, 'ysp.js', 'js');
});

gulp.task('min_scripts', function() {
    return jsMinModule(js_sources, 'jquery.voicebase.js', 'js');
});

gulp.task('offerings', function() {
    return jsModule(offerings_sources, 'voicebase.offerings.js', 'js');
});

gulp.task('min_offerings', function() {
    return jsMinModule(offerings_sources, 'voicebase.offerings.js', 'js');
});

gulp.task('css', function() {
    return reload('css/**/*.css');
});

gulp.task('sass-lint', function() {
    var lintSrc = ['!sass/base/_mixins.scss'];
    lintSrc = sass_sources.dev.concat(lintSrc);
    gulp.src(lintSrc)
        .pipe(scsslint({
            config: 'sass/sassLint.yaml'
        }));
});

var kalturaIframe = function() {
    gulp.src(sass_sources.kalturaIframe)
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(urlAdjuster({
            replace: ['../../', '../'] // fix images paths
        }))
        .pipe(autoprefixer({
            browsers: ['last 10 version']
        }))
        .pipe(rename({
            basename: 'vbs-kaltura-iframe'
        }))
        .pipe(gulp.dest('css'));
};


gulp.task('sass', function() {
    gulp.src(sass_sources.main)
        .pipe(sourcemaps.init())
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(urlAdjuster({
            replace: ['../../', '../'] // fix images paths
        }))
        .pipe(autoprefixer({
            browsers: ['last 10 version']
        }))
        .pipe(rename({
            basename: 'jwplayer.vb-sdk-plugin'
        }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('css'))
        .pipe(connect.reload());

    kalturaIframe();
});

gulp.task('sass-production', function() {
    gulp.src(sass_sources.main)
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(urlAdjuster({
            replace: ['../../', '../'] // fix images paths
        }))
        .pipe(autoprefixer({
            browsers: ['last 10 version']
        }))
        .pipe(rename({
            basename: 'jwplayer.vb-sdk-plugin'
        }))
        .pipe(gulp.dest('css'))
        .pipe(connect.reload());

    kalturaIframe();
});

gulp.task('min_css', function() {
    return gulp.src(css_sources)
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifycss())
        .pipe(gulp.dest('css/'))
        .pipe(connect.reload());
});

gulp.task('html', function() {
    return reload(html_sources);
});

var isSubtitlesModule = args.subtitles || false;
var isOfferingsModule = args.offerings || false;

gulp.task('watch', function() {
    gulp.watch(js_sources, ['scripts', 'lint']);
    gulp.watch(sass_sources.dev, ['sass', 'sass-lint']);
    gulp.watch(html_sources, ['html']);
    if(isSubtitlesModule) {
        gulp.watch(subtitles_sources, ['subtitles']);
    }
    if(isOfferingsModule) {
        gulp.watch(offerings_sources, ['offerings']);
    }
});

gulp.task('watch_production', function() {
    gulp.watch(js_sources, ['min_scripts', 'lint']);
    gulp.watch(sass_sources.dev, ['sass']);
    gulp.watch(css_sources, ['min_css']);
    gulp.watch(html_sources, ['html']);
    if(isSubtitlesModule) {
        gulp.watch(subtitles_sources, ['min_subtitles']);
    }
    if(isOfferingsModule) {
        gulp.watch(offerings_sources, ['min_offerings']);
    }
});

gulp.task('dev', function(){
    gulp.start(['scripts', 'sass-lint', 'sass', 'watch', 'connect']);
    if(isSubtitlesModule) {
        gulp.start(['subtitles']);
    }
    if(isOfferingsModule) {
        gulp.start(['offerings']);
    }
});

gulp.task('default', function(){
    gulp.start(['min_scripts', 'sass-lint', 'sass-production', 'min_css', 'watch_production', 'connect']);
    if(isSubtitlesModule) {
        gulp.start(['min_subtitles']);
    }
    if(isOfferingsModule) {
        gulp.start(['min_offerings']);
    }
});

/*
* zip build
* */
var version = args.vbVersion || '';
var nameDistFolder = (version) ?  'vb-sdk-v' + version : 'vb-sdk';

gulp.task('dist_prepare', function() {
    return gulp.src('build/**/*').pipe(clean({force: true}));
});

gulp.task('dist_sources', function() {
    return gulp.src([
        'css/jquery-ui-1.10.4.custom.min.css',
        'css/jwplayer.vb-sdk-plugin.css',
        'css/jwplayer.vb-sdk-plugin.min.css',
        'css/vbs-kaltura-iframe.css',
        'css/images/*',
        'images/*',
        'js/lib/fuse.min.js',
        'js/lib/jquery-1.9.1.min.js',
        'js/lib/jquery-ui-1.10.4.custom.min.js',
        'js/lib/loggly.tracker.js',
        'js/lib/swfobject.js',
        'js/lib/jquery.zclip.js',
        'js/jquery.voicebase.js',
        'js/jquery.voicebase.min.js',
        'js/ysp.min.js',
        'js/workers/localSearchWorker.js',
        'js/workers/localSearchHelper.js',
        'ZeroClipboard.swf'
    ], {base: '.'})
        .pipe(gulp.dest('build/' + nameDistFolder));
});

gulp.task('dist_readme', function() {
    return gulp.src(['readme/**/*'])
        .pipe(gulp.dest('build/' + nameDistFolder + '/readme'));
});

gulp.task('dist_zip', function() {
    return gulp.src(['build/**/*', '!build/**/*.zip'])
        .pipe(zip(nameDistFolder + '.zip'))
        .pipe(gulp.dest('build'));
});

gulp.task('dist_clean', function() {
    return gulp.src(['build/' + nameDistFolder, 'build/readme']).pipe(clean());
});

gulp.task('zip_build', ['dist_sources'], function(){
    runSequence('dist_clean', 'dist_sources', 'dist_readme', 'dist_zip', 'dist_clean');
});


/*
* Oreka
* */
var wrap = require("gulp-wrap");
var orekaSrc = ['Oreka/BrowserDetect.js', 'Oreka/Playback.js'];

gulp.task('oreka_build', function() {
    gulp.src(orekaSrc)
        .pipe(wrap('<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE script\n PUBLIC "-//Apache Software Foundation//Tapestry Script Specification 3.0//EN"\n "http://jakarta.apache.org/tapestry/dtd/Script_4_0.dtd">\n <script>\n <body> \n <![CDATA[ \n <%= contents %>\n ]]> \n </body> \n </script>'))
        .pipe(ext_replace('.script'))
        .pipe(gulp.dest('Oreka/build'));


});

gulp.task('watch_oreka', function() {
    gulp.watch(orekaSrc, ['oreka_build']);
});

gulp.task('oreka', function(){
    gulp.start(['oreka_build', 'watch_oreka']);
});
