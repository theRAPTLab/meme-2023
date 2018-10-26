/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  MEMEWEB CONFIGURATION for WEBPACK

  NOTE: that the devServer options can only use MIDDLEWARE compatible settings,
  as this file is used to launch

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/
const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

console.log(`- importing config ${__filename}`);

// setting up a verbose webpack configuration object
// because our setup is quite non-standard
module.exports = {
  mode: 'development',
  context: path.resolve(__dirname, '../src/app-urweb'),
  entry: {
    webapp: ['./meme.js']
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../dist/webapp')
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
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  plugins: [
    // this plugin adds the script tag to load webpacked assets to template
    // and outputs it to dist/
    // e.g. <script type="text/javascript" src="main.js"></script>
    new HtmlWebpackPlugin({
      template: 'meme-index.html',
      filename: './index.html'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new CopyWebpackPlugin()
  ]
};
