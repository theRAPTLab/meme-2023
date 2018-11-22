/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  DIST CONFIGURATION for WEBPACK
  create built/web and built/console WITHOUT hot module reloading

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/
console.log('!!! BUILDING PACKAGE');

const ERR = `webpack.dist.config only runs for HMR_MODE='none'`;

const path = require('path');
const merge = require('webpack-merge');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const baseConfig = require('./webpack.base.config');

// setting up a verbose webpack configuration object
// because our configuration is nonstandard
const webConfiguration = env => {
  console.log('... EXEC WEBAPP BUILD CONFIGURATION');
  // passed via npm script -env.HMR_MODE='string'
  const { HMR_MODE } = env;

  // handle special cases of our HMR_MODE
  if (HMR_MODE !== 'none') throw new Error(ERR);

  // otherwise we're good
  const entryFiles = ['./web-index.js'];
  const outputDir = path.resolve(__dirname, '../../built/web');

  // return webConfiguration
  return merge([
    // config webapp files
    {
      name: 'webapp',
      target: 'web',
      mode: 'development',
      // define base path for input filenames
      context: path.resolve(__dirname, '../../src/app-web'),
      // start bundling from this js file
      entry: entryFiles,
      // bundle file name
      output: {
        path: outputDir,
        filename: 'web-bundle.js',
        pathinfo: false // this speeds up compilation (https://webpack.js.org/guides/build-performance/#output-without-path-info)
        // publicPath: 'web',
      },
      devtool: '#source-map',
      // apply these additional plugins
      plugins: [
        new HtmlWebpackPlugin({
          template: 'web-index.html',
          filename: path.join(outputDir, 'index.html')
        }),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('development')
        }),
        new CopyWebpackPlugin()
      ],
      stats: 'errors-only'
    }
  ]);
}; // const webConfiguration

const electronConfiguration = env => {
  console.log('... EXEC ELECTRON APP BUILD CONFIGURATION');
  const { HMR_MODE } = env;

  if (HMR_MODE !== 'none') throw new Error(ERR);

  const DIR_CONFIG = path.join(__dirname, '../config/');
  const DIR_SOURCE = path.join(__dirname, '../app-console/');
  const DIR_OUTPUT = path.join(__dirname, '../../built/');
  const ENTRY_MODULE = 'console.js';
  const FILE_BUNDLE = 'console.bundle.js';
  const ENTRY_HTML = 'console.html';

  const plugins = [
    // only add hot module reloading in wds mode

    new HtmlWebpackPlugin({
      template: ENTRY_HTML, // uses context
      filename: ENTRY_HTML // uses output.path
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new CopyWebpackPlugin([
      {
        from: DIR_SOURCE,
        to: `${DIR_OUTPUT}/console`,
        // ignore console.html and console.js (built by webpack)
        // ignore console.package.json (renamed to built/package.json)
        ignore: ['.*', 'console.*']
      },
      {
        from: `${DIR_SOURCE}/console.package.json`,
        to: `${DIR_OUTPUT}/package.json`,
        toType: 'file'
      },
      {
        from: `${DIR_CONFIG}/*`,
        to: `${DIR_OUTPUT}/config`
      }
    ])
  ];

  return merge([
    {
      name: 'console',
      mode: 'development',
      target: 'electron-renderer',
      devtool: 'inline-cheap-source-map',
      context: DIR_SOURCE,
      entry: [`./${ENTRY_MODULE}`], // leading ./ is required
      output: {
        path: `${DIR_OUTPUT}/console`,
        // is this necessary?
        // publicPath: DIR_PUBLIC_CONTEXT,
        filename: FILE_BUNDLE
      },
      plugins,
      stats: 'errors-only'
    }
  ]);
};
// return merged configurations
// webpack will pass the current environment since we are returning function
module.exports = env => [
  merge(baseConfig(env), webConfiguration(env)),
  merge(baseConfig(env), electronConfiguration(env))
];
