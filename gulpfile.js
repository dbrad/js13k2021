const gulp = require(`gulp`);
const minifyHTML = require(`gulp-minify-html`);
const minifyCSS = require(`gulp-clean-css`);
const preprocess = require(`gulp-preprocess`);

const minimist = require(`minimist`);

var knownOptions = {
  string: `env`,
  default: { env: process.env.NODE_ENV || `production` }
};

var options = minimist(process.argv.slice(2), knownOptions);

const devBuild = options.env === `development`;
const preprocessContext = { DEBUG: true };
const env = devBuild ? `debug` : `release`;

//#region HTML
function buildHtml()
{
  return gulp
    .src(`./src/html/index.html`)
    .pipe(minifyHTML())
    .pipe(gulp.dest(`./build/${ env }/www`));
}
//#endregion HTML

//#region CSS
function buildCss()
{
  return gulp
    .src(`./src/css/*.css`)
    .pipe(minifyCSS())
    .pipe(gulp.dest(`./build/${ env }/www`));
}
//#endregion CSS

//#region JS
function preprocessJs()
{
  if (devBuild)
  {
    return gulp.src(`./src/ts/**/*.ts`)
      .pipe(preprocess({ context: preprocessContext }))
      .pipe(gulp.dest(`./build/${ env }/ts`));
  }
  else
  {
    return gulp.src(`./src/ts/**/*.ts`)
      .pipe(preprocess({ context: {} }))
      .pipe(gulp.dest(`./build/${ env }/ts`));
  }
}
//#endregion JS

function watch()
{
  gulp.watch([`./src/html/index.html`], buildHtml);
  gulp.watch([`./src/css/*.css`], buildCss);
  gulp.watch([`./src/ts/**/*.ts`], gulp.series(preprocessJs));
}

const build = exports.build =
  gulp.parallel(
    buildHtml,
    preprocessJs,
    buildCss);

exports.watch = gulp.series(build, watch);