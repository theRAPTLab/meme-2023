/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Webpack Configuration for Electron-based Console/Server App
  Takes files in src/app-console and transforms them to built/console for loading
  by the Electron main process

  NOTES:
  This configuration is invoked by package.json "scripts" with env.HMR_MODE='electron'
  to indicate that livereload is handled by electron, not WDS

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
const DIR_OUTPUT = path.join(__dirname, '../../built/');
const ENTRY_MODULE = 'console.js';
const FILE_BUNDLE = 'console.bundle.js';
const ENTRY_HTML = 'console.html';

/// CONSOLE RENDERER CONFIGURATION //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
/*/
const electronRendererConfig = env => {
  const { HMR_MODE } = env;

  // handle special cases of our HMR_MODE
  switch (HMR_MODE) {
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

  const plugins = [
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
  // only add hot module reloading in wds mode
  if (HMR_MODE === 'wds') plugins.push(new webpack.HotModuleReplacementPlugin({}));

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
      plugins,
      stats: 'errors-only'
    }
  ]);
};

// return merged configurations
const baseConfig = require('./webpack.base.config');
//
module.exports = env => merge(baseConfig(env), electronRendererConfig(env));
