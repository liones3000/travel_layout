const { src, dest, watch, series, parallel } = require("gulp");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("gulp-autoprefixer");
const concat = require("gulp-concat");
const cleanCss = require("gulp-clean-css");
const browserSync = require("browser-sync").create();
const fileInclude = require("gulp-file-include");
const imageMin = require("gulp-imagemin");
const svgSprite = require("gulp-svg-sprite");
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
const del = require("del");
const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const uglify = require("gulp-uglify-es").default;
const notify = require("gulp-notify");
const gulpif = require("gulp-if");
const htmlmin = require("gulp-htmlmin");

sass.compiler = require("node-sass");

let isProd = false; // dev by default

const fonts = () => {
  src("./src/fonts/**.ttf").pipe(ttf2woff()).pipe(dest("./app/fonts/"));
  return src("./src/fonts/**.ttf").pipe(ttf2woff2()).pipe(dest("./app/fonts/"));
};

const styles = () => {
  return src("./src/scss/**/*.scss")
    .pipe(gulpif(!isProd, sourcemaps.init()))
    .pipe(sass({ outputStyle: "expanded" }).on("error", notify.onError()))
    .pipe(
      autoprefixer({
        cascade: false,
        grid: true,
      })
    )
    .pipe(gulpif(isProd, cleanCss({ level: 2 })))
    .pipe(gulpif(!isProd, sourcemaps.write(".")))
    .pipe(dest("./app/css/"))
    .pipe(browserSync.stream());
};

const htmlInclude = () => {
  return src("./src/index.html")
    .pipe(
      fileInclude({
        prefix: "@",
        basepath: "@file",
      })
    )
    .pipe(dest("./app"))
    .pipe(browserSync.stream());
};

const images = () => {
  return src([
    "./src/img/**/*.jpg",
    "./src/img/**/*.png",
    "./src/img/**/*.jpeg",
    "./src/img/*.svg",
  ])
    .pipe(
      imageMin([
        imageMin.gifsicle({ interlaced: true }),
        imageMin.mozjpeg({ quality: 75, progressive: true }),
        imageMin.optipng({ optimizationLevel: 5 }),
        imageMin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest("./app/img"));
};

const svgSprites = () => {
  return src("./src/img/svg/**.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
          },
        },
      })
    )
    .pipe(dest("./app/img"));
};

const scripts = () => {
  src(["node_modules/jquery/dist/jquery.min.js"])
    .pipe(concat("vendor.js"))
    .pipe(dest("./app/js"));

  return src("./src/js/main.js")
    .pipe(
      webpackStream({
        mode: "development",
        output: {
          filename: "main.js",
        },
        module: {
          rules: [
            {
              test: /\.m?js$/,
              exclude: /node_modules/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: [["@babel/preset-env", { targets: "defaults" }]],
                },
              },
            },
          ],
        },
      })
    )
    .pipe(gulpif(!isProd, sourcemaps.init()))
    .pipe(gulpif(isProd, uglify().on("error", notify.onError())))
    .pipe(gulpif(!isProd, sourcemaps.write(".")))
    .pipe(dest("./app/js"))
    .pipe(browserSync.stream());
};

const moveOtherFilestoApp = () => {
  return src("./src/resources/**").pipe(dest("./app"));
};

const htmlMinify = () => {
  return src("app/**/*.html")
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(dest("app"));
};

const toProd = (done) => {
  isProd = true;
  done();
};

const cleanApp = () => {
  return del("app/*");
};

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: "./app",
    },
    notify: false,
  });

  watch("./src/scss/**/*.scss", styles);
  watch(["./src/*.html", "./src/part/*.html"], htmlInclude);
  watch("./src/img/**/*.{jpg,jpeg,png,svg}", images);
  watch("./src/resources/**", moveOtherFilestoApp);
  watch("./src/img/svg/**.svg", svgSprites);
  watch("./src/js/**/*.js", scripts);
};

exports.fonts = fonts;
exports.images = images;
exports.watch = watchFiles;
exports.scripts = scripts;

exports.default = series(
  cleanApp,
  fonts,
  htmlInclude,
  scripts,
  styles,
  moveOtherFilestoApp,
  images,
  svgSprites,
  watchFiles
);

exports.build = series(
  toProd,
  cleanApp,
  fonts,
  htmlInclude,
  scripts,
  styles,
  moveOtherFilestoApp,
  images,
  svgSprites,
  htmlMinify
);
