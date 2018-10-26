/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  load programmatically from electron-main.js
  middleware mode! these are the only allowed values, according to
  https://webpack.js.org/configuration/dev-server/

  filename
  headers
  lazy
  noInfo
  publicPath
  quiet
  stats
  watchOptions

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/

console.log(`- importing config ${__filename}`);

module.exports = {
  stats: 'verbose',
  publicPath: '/webapp'
};
