/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  WEBAPP CONFIGURATION for WEBPACK
  This is intended to build the web application purely with webpack,
  no electron support

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/
const path = require('path');
const merge = require('webpack-merge');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const baseConfig = require('./webpack.base.config');
const wdsConfig = require('./wds.config');

// setting up a verbose webpack configuration object
// because our configuration is nonstandard
const webConfiguration = env => {
  // passed via npm script -env.MODE='string'
  const { MODE } = env;

  let entryFiles = ['./web-index.js']; // eslint-disable-line

  // handle special cases of our MODE
  switch (MODE) {
    case 'wds':
      // don't load webpack-hot-middleware
      break;
    case 'electron':
      console.log('*** WEBAPP.CONFIG', 'RUNNING FROM ELECTRON');
      // in web-index.js, using module.hot.decline() requires reload=true set here
      entryFiles.push('webpack-hot-middleware/client?reload=true');
      break;
    default:
    // do nothing
  }

  // return webConfiguration
  return merge([
    // config webapp files
    {
      target: 'web',
      mode: 'development',
      // define base path for input filenames
      context: path.resolve(__dirname, '../src/app-web'),
      // start bundling from this js file
      entry: entryFiles,
      // bundle file name
      output: {
        path: path.resolve(__dirname, '../dist/web'),
        filename: 'web-bundle.js',
        pathinfo: false // this speeds up compilation (https://webpack.js.org/guides/build-performance/#output-without-path-info)
        // publicPath: 'web',
      },
      devtool: '#source-map',
      // apply these additional plugins
      plugins: [
        new HtmlWebpackPlugin({
          template: 'web-index.html',
          filename: path.join(__dirname, '../dist/web', 'index.html')
        }),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('development')
        }),
        new WriteFilePlugin({
          test: /^(.(?!.*\.hot-update.js$|.*\.hot-update.*))*$/ // don't write hot-updates at all, just bundles
        }),
        new CopyWebpackPlugin(),
        new webpack.HotModuleReplacementPlugin()
      ]
    },
    // config webpack-dev-server when run from CLI
    // these options don't all work for the API middleware version
    wdsConfig(env)
  ]);
}; // const webConfiguration

// return merged configurations
// webpack will pass the current environment since we are returning function
module.exports = env => merge(baseConfig(env), webConfiguration(env));
