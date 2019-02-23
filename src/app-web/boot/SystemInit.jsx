/// THIS IS THE MAIN UI STARTUP
/// First it launches the UNISYS system
/// Then it spawns REACT under control of UNISYS

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Link, withRouter } from 'react-router-dom';
import TSV from './ts-validator-web';
import SystemShell from './SystemShell';

const DBG = true;

/// SYSTEM-WIDE LANGUAGE EXTENSIONS ///////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// These are loaded in init to make sure they are available globally!
/// You do not need to copy these extensions to your own module files
require('babel-polyfill'); // enables regenerators for async/await

/// LIFECYCLE HELPERS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function SetLifecycleScope() {
  // set scope for UNISYS execution
  const routes = SystemShell.Routes;
  // check #, and remove any trailing parameters in slashes
  // we want the first one
  const hashbits = window.location.hash.split('/');
  const hash = hashbits[0];
  const loc = `/${hash}`;
  const matches = routes.filter(route => {
    // console.log(`route ${route.path} loc ${loc}`);
    return route.path === loc;
  });
  if (matches.length) {
    if (DBG) console.log(`Lifecycle Module Scope is ${hash}`);
    const { component } = matches[0];
    if (component.UMOD === undefined)
      console.warn(`WARNING: root view '${loc}' has no UMOD property, so can not set UNISYS scope`);
    // SYSLOOP ccheckes the scope value when executing phases
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

    SetLifecycleScope();
    (async () => {
      // await UNISYS.JoinNet(); // UNISYS socket connection (that is all)
      // await UNISYS.EnterApp(); // TEST_CONF, INITIALIZE, LOADASSETS, CONFIGURE
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
      // await UNISYS.SetupDOM(); // DOM_READY
      // await UNISYS.SetupRun(); // RESET, START, APP_READY, RUN

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
      console.log('%cINIT %cUNISYS Lifecycle Initialization Complete', 'color:blue', 'color:auto');
      console.groupEnd();
    })();
  });
}

/// UNISYS LIFECYCLE LOADER ///////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default { Init };
