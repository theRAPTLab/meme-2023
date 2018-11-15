/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Webpack Configuration for Electron-based Console/Server App
  Takes files in src/app-console and transforms them to dist/console for loading
  by the Electron main process

  NOTES:
  This configuration is invoked by package.json "scripts" with env.MODE='electron'
  Since it is only used for the console/server, the MODE doesn't really do anything.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/

/// LOAD LIBRARIES //////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

/// CONSTANTS ///////////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DIR_CONFIG = path.join(__dirname, '../config/');
const DIR_SOURCE = path.join(__dirname, '../app-console/');
const DIR_OUTPUT = path.join(__dirname, '../../dist/');
const ENTRY_MODULE = 'console.js';
const FILE_BUNDLE = 'console.bundle.js';
const ENTRY_HTML = 'console.html';

/// CONSOLE RENDERER CONFIGURATION //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
/*/
const electronRendererConfig = env => {
  const { MODE } = env;

  // handle special cases of our MODE
  switch (MODE) {
    case 'wds':
      // don't load webpack-hot-middleware
      break;
    case 'electron':
      // don't do anything yet
      // entryFiles.push('webpack-hot-middleware/client?reload=true');
      break;
    default:
    // do nothing
  }

  return merge([
    {
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
      plugins: [
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
            // ignore console.package.json (renamed to dist/package.json)
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
        ]),
        new webpack.HotModuleReplacementPlugin({})
      ],
      stats: 'errors-only'
    }
  ]);
};

// return merged configurations
const baseConfig = require('./webpack.base.config');
//
module.exports = env => merge(baseConfig(env), electronRendererConfig(env));
