/*///////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  NOTE: this file is the ENTRY POINT designated in webpack.webapp.config.js

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// SYSTEM-WIDE LANGUAGE EXTENSIONS ///////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// These are loaded in init to make sure they are available globally!
/// You do not need to copy these extensions to your own module files
import 'babel-polyfill';
import System from './boot/SystemInit';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PR = '[WebIndexJS]';

/*\

  HMR is a Webpack feature. Generally you write a handler:
  module.hot.accept('./library.js',()=>{ ..do something.. });

  To enable HMR in Webpack, need to specify 'reload=true' in config:
  entryFiles = ['./web-index.js', 'webpack-hot-middleware/client?reload=true'];
  NOTE that this is an additional entryPoint

  Since actual HMR handling is tricky, the code below just looks for a change
  and assumes that it should reload the entire application when the source
  files are ready

\*/
if (module.hot) {
  // not doing this:
  // module.hot.accept(deps,callback);

  module.hot.addStatusHandler(status => {
    // reload entire if ANY change occurs
    if (status === 'ready') {
      window.location.reload();
    } else console.log(PR, 'HMR status:', status);
  });
} else {
  console.log(`${PR} HMR support is not enabled`);
}

/// INITIALIZE THE SYSTEM /////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
System.Init();
