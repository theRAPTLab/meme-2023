const merge = require('webpack-merge');
const path = require('path');

// see https://webpack.js.org/configuration/module/#rule-use for better 'use' options syntax

module.exports = env => {
  const { HMR_MODE } = env; // eslint-disable-line

  // Any directories you will be adding code/files into, need to be added to this array so webpack will pick them up
  // this ensures if it's running from built/ (electron mode) or src/ (wds mode) the include path is correct
  const defaultInclude = [path.join(__dirname, '../../src')];
  console.log('webpack.base.config', defaultInclude);

  return merge([
    {
      module: {
        rules: [
          {
            test: /\.css$/,
            use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
            // exclude: /node_modules/
          },
          {
            test: /\.jsx?$/,
            use: {
              loader: 'babel-loader'
            },
            include: defaultInclude,
            exclude: /node_modules/
          },
          {
            test: /\.(jpe?g|png|gif)$/,
            use: [{ loader: 'file-loader?name=img/[name]__[hash:base64:5].[ext]' }],
            include: defaultInclude
          },
          {
            test: /\.(eot|svg|ttf|woff|woff2)$/,
            use: [{ loader: 'file-loader?name=font/[name]__[hash:base64:5].[ext]' }],
            include: defaultInclude
          }
        ]
      },
      // require() can now understand .jsx files
      resolve: {
        extensions: ['.js', '.jsx']
      }
    }
  ]); // merge array
};
