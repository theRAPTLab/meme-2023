/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  WEBAPP DEV SERVER CONFIGURATION for WEBPACK
  This is intended to build the web application purely with webpack,
  no electron support

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/
const path = require('path');
const merge = require('webpack-merge');

// setting up a verbose webpack configuration object
// because our configuration is nonstandard
const wdsConfiguration = env => {
  const { HMR_MODE } = env; // eslint-disable-line

  return merge([
    {
      devServer: {
        contentBase: path.resolve(__dirname, '../../built/web/'),
        watchContentBase: true,
        // writeToDisk: true, // will write files, but also HOT module files
        port: 3000,
        stats: 'errors-only' // quiets webpack-dev-server compilation output
      }
    }
  ]);
};

// return merged configurations
// since we are returning function webpack will pass the current environment
module.exports = wdsConfiguration;
