/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  WEBAPP CONFIGURATION for WEBPACK
  This is intended to build the web application purely with webpack,
  no electron support

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/
const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

console.log(`- importing config ${__filename}`);

// setting up a verbose webpack configuration object
// because our configuration is nonstandard
module.exports = {
  // 'context' used to resolve base path of entry points and loaders (as defined below)
  context: path.resolve(__dirname, '../src/app-web'),
  // 'entry' lists where to start scanning dependency graph for a bundle
  // the load is injected into meme-index.html and output as index.html
  // by HtmlWebpackPlugin in 'plugins'
  entry: './web-main.js',
  // 'output' establishes naming conventions and where bundles are written
  output: {
    filename: 'web.bundle.js'
  },
  // 'module' defines what loaders are used to process what types of files
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
  // 'plugins' tap into webpack lifecycle to modify tool chain
  plugins: [
    // this plugin adds the script tag to load webpacked assets to template
    // and outputs it to dist/
    // e.g. <script type="text/javascript" src="main.js"></script>
    new WriteFilePlugin({
      test: /^(.(?!.*\.hot-update.js$|.*\.hot-update.json))*$/ // don't write hot-update and json files
    }),
    new HtmlWebpackPlugin({
      template: 'web-index.html',
      filename: './index.html'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new CopyWebpackPlugin()
  ],
  // 'devServer' options are used to configure webpack-dev-server
  devServer: {
    contentBase: path.resolve(__dirname, '../src/app-web/'),
    watchContentBase: true,
    // writeToDisk: true, // will write files, but also HOT module files
    port: 3000,
    stats: {
      colors: true,
      chunks: false,
      children: false
    }
  }
};
