const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const __if = require('gulp-if');
const argv = require('yargs').argv;
const browsersync = require('browser-sync').create();
const chalk = require('chalk');
const log = require('fancy-log');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

const browserlist = ['> 0.25%', 'last 5 versions'];
const production = !!argv.production;

const PATHS = {
  jsEntry: './src/js/index.js',
  sass: './src/sass/**/*.{sass,scss}',
  fileManager: './hs-cms-files',
  templateAssets: './magnetic-creative/assets',
  cmsSiteUrl: 'http://kindredoutdoor-6084868.hs-sites.com/',
  jsBundleUrl:
    'https://cdn2.hubspot.net/hubfs/6084868/hs-cms-files/app.bundle.js',
  cssBundleUrl: 'https://cdn2.hubspot.net/hubfs/6084868/hs-cms-files/index.css',
};

const buildSass = () => {
  return src(PATHS.sass)
    .pipe(__if(!production, sourcemaps.init()))
    .pipe(
      sass({
        outputStyle: production ? 'compressed' : 'nested',
      }).on('error', log)
    )
    .pipe(autoprefixer())
    .pipe(__if(!production, sourcemaps.write('./')))
    .pipe(dest(PATHS.fileManager));
};

const startWebpack = callback => {
  const compiler = webpack(webpackConfig(production, browserlist, PATHS));
  compiler.watch({}, (err, stats) => {
    if (err) {
      console.log(chalk`[WEBPACK-ERROR] ${err}`);
    } else {
      const statsStr = stats.toString({ chunks: false });
      console.log(chalk`[WEBPACK] ${statsStr}`);
      if (!production) browsersync.reload();
    }
  });
  callback();
};

const startDevServer = callback => {
  browsersync.init(
    {
      proxy: PATHS.cmsSiteUrl,
      rewriteRules: [
        {
          match: PATHS.jsBundleUrl,
          replace: '/app.bundle.js',
        },
        {
          match: PATHS.cssBundleUrl,
          replace: '/index.css',
        },
      ],
      serveStatic: ['hs-cms-files/'],
      injectChanges: true,
    },
    () => {}
  );
  callback();
};

const reloadBrowser = callback => {
  browsersync.reload();
  callback();
};

const startWatchers = callback => {
  watch(PATHS.sass, series(buildSass, reloadBrowser));
  callback();
};

exports.default = series(
  buildSass,
  startWebpack,
  startDevServer,
  startWatchers
);
