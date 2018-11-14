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
const DIR_SOURCE = path.join(__dirname, '../src/app-console/');
const DIR_OUTPUT = path.join(__dirname, '../dist/console/');
const DIR_PUBLIC_CONTEXT = path.join(__dirname);
const BASE_NAME = 'console';
const ENTRY_MODULE = `${BASE_NAME}.js`;
const ENTRY_HTML = `${BASE_NAME}.html`;
const FILE_BUNDLE = `bundle.${ENTRY_MODULE}`;

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
        path: DIR_OUTPUT,
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
            to: DIR_OUTPUT,
            ignore: ['.*', 'console.*'] // these are built by webpack
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
