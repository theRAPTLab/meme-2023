/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  ELECTRON CONFIGURATION for WEBPACK

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/
const path = require('path');
const merge = require('webpack-merge');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseConfig = require('./base.config');

const PR = '[Webpack.Electron.Config]';
console.log(`${PR} STARTED ${path.basename(__filename)}`);
const electronRendererConfig = env =>
  merge([
    {
      target: 'electron-renderer',
      mode: 'development',
      context: path.resolve(__dirname, '../src/app-electron'),
      entry: './electron-index.js',
      output: {
        filename: 'electron.bundle.js'
      },
      plugins: [
        new HtmlWebpackPlugin({
          template: 'electron-index.html',
          filename: 'electron-index.html'
        }),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('development')
        })
      ],
      stats: 'errors-only'
    }
  ]);

// return merged configurations
module.exports = env => merge(baseConfig(env), electronRendererConfig(env));
