const DBG = true;

/// SYSTEM-WIDE LANGUAGE EXTENSIONS ///////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// These are loaded in init to make sure they are available globally!
/// You do not need to copy these extensions to your own module files
// require('babel-polyfill'); // enables regenerators for async/await

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const React = require('react');
const ReactDOM = require('react-dom');
const AppShell = require('./appshell');

/// SYSTEM MODULES ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// demo: require system modules; this will likely be removed
// const UNISYS = require('unisys/client');
// const AppShell = require('init-appshell');

/// LIFECYCLE HELPERS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function SetLifecycleScope() {
  // set scope for UNISYS execution
  const routes = AppShell.Routes;
  // check #, and remove any trailing parameters in slashes
  // we want the first one
  const hashbits = window.location.hash.split('/');
  const hash = hashbits[0];
  const loc = `/${hash.substring(1)}`;
  const matches = routes.filter(route => {
    return route.path === loc;
  });
  if (matches.length) {
    if (DBG) console.log(`Lifecycle Module Scope is ${hash}`);
    const { component } = matches[0];
    if (component.UMOD === undefined)
      console.warn(`WARNING: root view '${loc}' has no UMOD property, so can not set UNISYS scope`);
    // const modscope = component.UMOD || '<undefined>/init.jsx';
    // UNISYS.SetScope(modscope);
  } else {
    console.warn(`SetLifecycleScope() could not match scope ${loc}`);
  }
}

function Init() {
  document.addEventListener('DOMContentLoaded', () => {
    // console.group('init.jsx bootstrap');
    console.log(
      '%cINIT %cDOMContentLoaded. Starting UNISYS Lifecycle!',
      'color:blue',
      'color:auto'
    );
    // SetLifecycleScope();
    (async () => {
      // await UNISYS.JoinNet(); // UNISYS socket connection (that is all)
      // await UNISYS.EnterApp(); // TEST_CONF, INITIALIZE, LOADASSETS, CONFIGURE
      // await RenderApp(); // compose React view
      ReactDOM.render(<AppShell />, document.querySelector('#app-container'), () => {
        console.log('%cINIT %cReactDOM.render() complete', 'color:blue', 'color:auto');
      });
      // await UNISYS.SetupDOM(); // DOM_READY
      // await UNISYS.SetupRun(); // RESET, START, APP_READY, RUN
      console.log('%cINIT %cUNISYS Lifecycle Initialization Complete', 'color:blue', 'color:auto');
      console.groupEnd();
    })();
  });
}

/// UNISYS LIFECYCLE LOADER ///////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = { Init };
