"use strict";

import gulp from "gulp";

/**
 * Gulp CSS Plugins
 * 
 * gulp-sass        - SASS plugin
 * gulp-sourcemaps  - Add CSS sourcemap
 * gulp-postcss     - PostCSS plugin
 * postcss-assets   - Manage Img Url, Img inlines and size
 * autoprefixer     - Add browser prefixes
 * css-mqpacker     - Packing same CSS media query rules into one
 * postcss-csso     - Minify CSS
 *
 */
import sass from "gulp-sass";
import sourcemaps from "gulp-sourcemaps";
import postcss from "gulp-postcss";
import assets from "postcss-assets";
import autoprefixer from "autoprefixer";
import mqpacker from "css-mqpacker";
import csso from "postcss-csso";

/**
 * Gulp JS Plugins
 * 
 * rollup                     - Build JavaScript modules
 * rollup-plugin-node-resolve - Resolve npm pakages
 * rollup-plugin-babel        - Add es2015 support
 * rollup-plugin-uglify       - Minimize js code
 *
 */
import { rollup } from "rollup";
import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import uglify from "rollup-plugin-uglify";

/**
 * Gulp Dev Plugins
 * 
 * browser-sync - Start Dev server
 * del          - Delete files
 * run-sequence - Run async Gulp task in sequence
 * gulp-notify  - Notification plugin
 * gulp-plumber - Prevent pipe breaking caused by errors from gulp plugins
 * gulp-wait    - A gulp task that inserts a delay before calling the next function in a chain
 *
 */
import server from "browser-sync";
import del from "del";
import run from "run-sequence";
import notify from "gulp-notify";
import plumber from "gulp-plumber";
import wait from "gulp-wait";


const Build = ((base) => ({
  root:   `${base}/`,
  html:   `${base}`,
  css:    `${base}/css`,
  js:     `${base}/js`,
  img:    `${base}/img`,
  fonts:  `${base}/fonts`,
}))("build");

const Source = ((base) => ({
  html:   `${base}`,
  css:    `${base}/sass`,
  js:     `${base}/js`,
  img:    `${base}/img/`,
  fonts:  `${base}/fonts/`,
}))("src");

const Server = server.create();

function errorHandler() {
  notify.onError({
    title: "Compile Error",
    message: "<%= error.message %>",
    sound: "Submarine"
  }).apply(this, [...arguments]);
  this.emit("end");
};


gulp.task("html", function() {
  return gulp.src(`${Source.html}/*.html`)
    .pipe(plumber({errorHandler}))
    .pipe(Server.stream({once: true}))
    .pipe(gulp.dest(Build.html));
});

gulp.task("style", function() {
  return gulp.src(`${Source.css}/style.scss`)
    .pipe(plumber({errorHandler}))
    .pipe(wait(500))
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: "expanded",
      precision: 5
    }))
    .pipe(postcss([
      assets({
        loadPaths: [Source.img],
        relativeTo: Build.css
      }),
      autoprefixer({
        browsers: ["last 4 versions"], 
        cascade: false
      }),
      mqpacker({sort: true}),
      csso
    ]))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(Build.css))
    .pipe(Server.stream());
});

gulp.task("js", function() {
  return rollup({
    input: `${Source.js}/index.js`,
    globals: {jQuery: "$"},
    onwarn: (warn, next) => { 
      /* Suppress jquery this undefined msg */
      (warn.code !== 'THIS_IS_UNDEFINED') && next(warn)
    },
    plugins: [
      resolve(),
      babel({
        presets: [["es2015", {"modules": false}]],
        plugins: ["external-helpers"],
        babelrc: false,
        exclude: "node_modules/**"
      }),
      uglify(),
    ]
  }).then((bundle) => {
    return bundle.write({
      file: `${Build.js}/index.js`,
      format: "iife",
      name: "index",
      sourcemap: true,
      });
  }).then(() => {
    Server.reload();
  }).catch(errorHandler);
});

gulp.task("img", function() {
  return gulp.src(`${Source.img}/**/*.*`)
    .pipe(plumber({errorHandler}))
    .pipe(gulp.dest(Build.img));
});

gulp.task("fonts", function() {
  return gulp.src(`${Source.fonts}/**/*.*`)
    .pipe(plumber({errorHandler}))
    .pipe(gulp.dest(Build.fonts));
});


gulp.task("server", function () {
  Server.init({
    server: {
      baseDir: Build.root
    },
    port: 8080,
    logLevel: "info",
    logConnections: false,
    logFileChanges: true,
    open: true,
    ui: false,
    notify: false,
    ghostMode: false,
    reloadDelay: 500
  });
});

gulp.task("watch", function() {
  gulp.watch(`${Source.html}/*.html`, ["html"]);
  gulp.watch(`${Source.css}/**/*.scss`, ["style"]);
  gulp.watch(`${Source.js}/**/*.js`, ["js"]);
  gulp.watch(`${Source.img}/**/*.*`, ["img"]);
  gulp.watch(`${Source.fonts}/**/*.*`, ["fonts"]);
});


gulp.task("clean", function() {
  return del([Build.root]);
});

gulp.task("build", function() {
  run("clean", "fonts", "img", "js", "style", "html");
});

gulp.task("default", function() {
  run("clean", "fonts", "img", "js", "style", "html", "server", "watch");
});
