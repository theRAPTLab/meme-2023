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
const baseConfig = require('./base.config');
const wdsConfig = require('./wds.web.config');

// setting up a verbose webpack configuration object
// because our configuration is nonstandard
const webConfiguration = env => {
  return merge([
    // config webapp files
    {
      target: 'web',
      mode: 'development',
      // define base path for input filenames
      context: path.resolve(__dirname, '../src/app-web'),
      // start bundling from this js file
      entry: ['./web-index.js', 'webpack-hot-middleware/client?reload=true'],
      // bundle file name
      output: {
        filename: 'web/web-bundle.js',
        publicPath: 'web'
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
          test: /^(.(?!.*\.hot-update.js$|.*\.hot-update.json))*$/ // don't write hot-update and json files
        }),
        new CopyWebpackPlugin(),
        new webpack.HotModuleReplacementPlugin()
      ]
    },
    // config webpack-dev-server when run from CLI
    // these options don't all work for the API middleware version
    wdsConfig(env)
  ]);
};

// return merged configurations
// since we are returning function webpack will pass the current environment
module.exports = env => merge(baseConfig(env), webConfiguration(env));
