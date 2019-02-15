const merge = require('webpack-merge');
const path = require('path');

// see https://webpack.js.org/configuration/module/#rule-use for better 'use' options syntax

module.exports = env => {
  const { HMR_MODE } = env; // eslint-disable-line

  // Any directories you will be adding code/files into, need to be added to this array so webpack will pick them up
  // this ensures if it's running from built/ (electron mode) or src/ (wds mode) the include path is correct
  const defaultInclude = [path.join(__dirname, '../../src')];
  console.log('base.config defaultInclude:', defaultInclude);

  return merge([
    {
      module: {
        rules: [
          {
            test: /\.css$/,
            use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
            // we're loading css from node_modules, so don't exclude it
            // exclude: /node_modules/
          },
          {
            test: /\.jsx?$/,
            use: {
              loader: 'babel-loader'
            },
            include: defaultInclude,
            // note: assuming that we're not loading anything from
            // node_modules that needs to be babelized
            exclude: /node_modules/
          },
          { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },

          // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
          { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
          {
            test: /\.(jpe?g|png|gif)$/,
            use: [{ loader: 'file-loader?name=img/[name]__[hash:base64:5].[ext]' }],
            // note: webpack imported images probably are only in our source folder
            // doesn't cover static assets loaded at runtime (?)
            include: defaultInclude
          },
          {
            test: /\.(eot|svg|ttf|woff|woff2)$/,
            use: [{ loader: 'file-loader?name=font/[name]__[hash:base64:5].[ext]' }],
            // note: webpack imported fonts are probably only in our source folder
            // doesn't cover static assets loaded at runtime (?)
            include: defaultInclude
          }
        ]
      },
      // make require() handle both .js and .jsx files (default only .js)
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  ]); // merge array
};