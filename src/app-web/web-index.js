/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  The MEME webapp is served direclty from src/app-urweb

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/

const PR = '[WebMain]';
const UR = require('../ur/client');

console.log(`web-main loaded`);
if (module.hot) {
  console.log(`${PR} enabling module.hot.accept()`);
  module.hot.decline(); // force reload
  // module.hot.accept();
} else {
  console.log(`${PR} HMR support not compiled into module`);
}
