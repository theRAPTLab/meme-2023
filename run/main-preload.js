/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/

const path = require('path');

console.warn(
  '\nMEME DEVS:\nYou can ignore the Security Warning below, as it is to scare you into reading about Electron security\n'
);

process.once('loaded', () => {
  const UR = {
    dist: path.resolve(__dirname)
  };
  // make available to all other electron BrowserWindow instances
  global.UR = UR;
});
