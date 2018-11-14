const merge = require('webpack-merge');
const path = require('path');

// Any directories you will be adding code/files into, need to be added to this array so webpack will pick them up
const defaultInclude = path.resolve(__dirname, 'src');

module.exports = env => {
  return merge([
    {
      module: {
        rules: [
          {
            test: /\.css$/,
            use: [
              { loader: 'style-loader' },
              { loader: 'css-loader' },
              { loader: 'postcss-loader' }
            ],
            include: defaultInclude
          },
          {
            test: /\.jsx?$/,
            use: [{ loader: 'babel-loader' }],
            include: defaultInclude
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
      }
    }
  ]); // merge array
};
