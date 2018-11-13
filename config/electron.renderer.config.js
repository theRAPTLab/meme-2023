/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  ELECTRON CONFIGURATION for WEBPACK

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/
const path = require('path');
const merge = require('webpack-merge');

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseConfig = require('./base.config');

const PR = '[Electron.Renderer.Config]';
console.log(`${PR} STARTED ${path.basename(__filename)}`);
const electronRendererConfig = env => {
  const { MODE } = env;

  let entryFiles = ['./electron-index.js']; // eslint-disable-line

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
      target: 'electron-renderer',
      devtool: 'inline-source-map',
      mode: 'development',
      context: path.resolve(__dirname, '../src/app-electron/'),
      entry: entryFiles,
      output: {
        path: path.resolve(__dirname, '../dist/electron'),
        filename: 'renderer-bundle.js',
        publicPath: path.resolve(__dirname)
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('development')
        }),
        new webpack.HotModuleReplacementPlugin({}),
        new CopyWebpackPlugin([
          {
            from: path.resolve(__dirname, '../src/app-electron/static'),
            to: path.resolve(__dirname, '../dist/electron/static'),
            ignore: ['.*']
          },
          {
            from: path.resolve(__dirname, '../run'),
            to: path.resolve(__dirname, '../dist/electron'),
            ignore: 'test*'
          }
        ])
      ],
      stats: 'errors-only'
    }
  ]);
};

// return merged configurations
module.exports = env => merge(baseConfig(env), electronRendererConfig(env));
