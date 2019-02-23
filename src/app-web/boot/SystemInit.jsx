/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  SystemInit - Start Lifecycle of Application

  SystemInit is executed from web-index.js, which itself is loaded by
  web-index.html

  It starts the URSYS lifecycle system, then spawns React SystemShell
  with a ReactRouter <HashRouter> that loades <SystemShell>

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Link, withRouter } from 'react-router-dom';
import TSV from './ts-validator-web';
import SystemShell from './SystemShell';
import SystemRoutes from './SystemRoutes';

/// DEBUG CONTROL /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;

/// SYSTEM-WIDE LANGUAGE EXTENSIONS ///////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// These are loaded in init to make sure they are available globally!
/// You do not need to copy these extensions to your own module files
require('babel-polyfill'); // enables regenerators for async/await

/// LIFECYCLE HELPERS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// set scope for URSYS execution
function SetLifecycleScope() {
  // check #, and remove any trailing parameters in slashes
  // we want the first one
  const hashbits = window.location.hash.split('/');
  const hash = hashbits[0];
  const loc = `/${hash}`;
  const matches = SystemRoutes.filter(route => {
    // console.log(`route ${route.path} loc ${loc}`);
    return route.path === loc;
  });
  if (matches.length) {
    if (DBG) console.log(`Lifecycle Module Scope is ${hash}`);
    const { component } = matches[0];
    if (component.UMOD === undefined)
      console.warn(`WARNING: root view '${loc}' has no UMOD property, so can not set URSYS scope`);
    // SYSLOOP ccheckes the scope value when executing phases
    // const modscope = component.UMOD || '<undefined>/init.jsx';
    // URSYS.SetScope(modscope);
  } else {
    console.warn(`SetLifecycleScope() could not match scope ${loc}`);
  }
}

/// URSYS STARTUP /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function Init() {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('%cINIT %cDOMContentLoaded. Starting URSYS Lifecycle!', 'color:blue', 'color:auto');
    // determine current scope of running app based on path
    // so URSYS will not execute lifecycle phases in any module
    // that exists outside those key directories
    SetLifecycleScope();
    // asynchronous code startup
    (async () => {
      // await URSYS.JoinNet(); // URSYS socket connection (that is all)
      // await URSYS.EnterApp(); // TEST_CONF, INITIALIZE, LOADASSETS, CONFIGURE
      // await RenderApp(); // compose React view
      // ReactDOM.render(
      //   <HashRouter hashType="slash">
      //     <SystemShell />
      //   </HashRouter>,
      //   () => {
      //     document.querySelector('#app-container'),
      //       console.log('%cINIT %cReactDOM.render() complete', 'color:blue', 'color:auto');
      //   }
      // );
      // await URSYS.SetupDOM(); // DOM_READY
      // await URSYS.SetupRun(); // RESET, START, APP_READY, RUN

      // since await block isn't implemented yet, just draw ReactDOM now
      ReactDOM.render(
        <HashRouter hashType="slash">
          <SystemShell />
        </HashRouter>,
        document.getElementById('app-container'),
        () => {
          console.log('%cINIT %cReactDOM.render() complete', 'color:blue', 'color:auto');
        }
      );
      // do other out-of-phase initialization
      console.log(`%cINIT %c${TSV.TestTypescript()}`, 'color:blue', 'color:auto');
      // everything is done, system is running
      console.log('%cINIT %cURSYS Lifecycle Initialization Complete', 'color:blue', 'color:auto');
      console.groupEnd();
    })();
  });
}

/// MODULE EXPORTS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default { Init };
