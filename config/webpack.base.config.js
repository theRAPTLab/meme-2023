/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  NOTE: for an overview of the concepts for "rules", "plugins", and "module",
  this is very informative: https://webpack.js.org/concepts

  This configuration:
  1. defines an entry point
  2. handles js files, scss, inserts html
  3. copies static sources from src/assets

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const APP_ELECTRON_PATH = path.resolve(__dirname, '../src/app-electron/electron-main');

// Webpack function configuration //
module.exports = (env = {}) => {
  const { PLATFORM, VERSION } = env;
  return merge([
    {
      entry: {
        app: ['@babel/polyfill', APP_ELECTRON_PATH]
      },
      module: {
        rules: [
          {
            test: /\.js$/, // filetype that this rule applies to
            exclude: /node_modules/, // regex to ignore files with this path
            use: {
              loader: 'babel-loader' // webpack plugin to use babel for transpiling
            }
          },
          {
            test: /\.scss$/,
            // read from right to left, which is order of conversion
            use: [
              PLATFORM === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
              'css-loader',
              'sass-loader'
            ]
          }
        ]
      },
      plugins: [
        // this plugin adds the script tag to load webpacked assets to template
        // and outputs it to dist/
        // e.g. <script type="text/javascript" src="main.js"></script>
        new HtmlWebpackPlugin({
          template: './src/index.html',
          filename: './index.html'
        }),
        new webpack.DefinePlugin({
          'process.env.VERSION': JSON.stringify(env.VERSION),
          'process.env.PLATFORM': JSON.stringify(env.PLATFORM)
        }),
        new CopyWebpackPlugin([{ from: 'src/assets' }])
      ]
    }
  ]); // merge()
};
