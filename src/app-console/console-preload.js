/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  This is loaded by the electron mainprocess when creating its main BrowserWindow.
  By assigning properties to 'global', can selectively introduce nodeJS stuff to
  all BrowserWindow without enabling full node integration.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/

const path = require('path');

function GetWorkingDirectory(subpath) {
  return path.resolve(__dirname, subpath);
}
function GetAppName() {
  return '[UR]';
}
process.once('loaded', () => {
  const UR = {
    GetWorkingDirectory
  };

  // make available to all other electron BrowserWindow instances
  global.UR = UR;
  global.require = require;
});
