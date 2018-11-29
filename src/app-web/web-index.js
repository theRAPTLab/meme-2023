/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  The MEME webapp is served directly from src/app-urweb

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/

const PR = '[WebIndexJS]';

/// SYSTEM-WIDE LANGUAGE EXTENSIONS ///////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// These are loaded in init to make sure they are available globally!
/// You do not need to copy these extensions to your own module files
require('babel-polyfill'); // enables regenerators for async/await

const System = require('./boot/system');

console.log(`web-index.js loaded`);

if (module.hot) {
  console.log(`${PR} hot.status is '${module.hot.status()}'`);
  // use this for webpack-dev-server
  // module.hot.accept();

  // when using this, need to specify reload=true in
  // webpack webapp.config additional entry point
  // module.hot.decline();

  // just reload if ANY change occurs...forget about hot module
  // replacement
  module.hot.addStatusHandler(status => {
    if (status === 'ready') {
      window.location.reload();
    } else console.log('status', status);
  });
} else {
  console.log(`${PR} HMR support not compiled into module`);
}

System.Init();
