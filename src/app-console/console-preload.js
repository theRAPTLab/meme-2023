/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  This is loaded by the electron mainprocess when creating its main BrowserWindow.
  By assigning properties to 'global', can selectively introduce nodeJS stuff to
  all BrowserWindow without enabling full node integration.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/

const path = require('path');
const { ipcRenderer } = require('electron');

function GetWorkingDirectory(subpath) {
  return path.resolve(__dirname, subpath);
}
function GetAppName() {
  return '[UR]';
}
process.once('loaded', () => {
  // Get serverinfo from the main process via a synchronous message
  // This replaces the deprecated remote.getGlobal() call
  const serverinfo = ipcRenderer.sendSync('get-serverinfo');

  const UR = {
    GetWorkingDirectory,
    serverinfo  // Expose serverinfo to renderer
  };

  // make available to all other electron BrowserWindow instances
  global.UR = UR;
  global.require = require;
});
