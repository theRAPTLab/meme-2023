/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  NOTE: this file is the ENTRY POINT designated in webpack.webapp.config.js

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/
import 'bootstrap/dist/css/bootstrap.css'; // enables regenerators for async/await
import System from './boot/system-init';

/// SYSTEM-WIDE LANGUAGE EXTENSIONS ///////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// These are loaded in init to make sure they are available globally!
/// You do not need to copy these extensions to your own module files
import 'babel-polyfill';

const PR = '[WebIndexJS]';

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
