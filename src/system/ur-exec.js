/* eslint-disable no-debugger */
/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\
\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import { Dirname } from './util/path';
import URNET from './ur-network';
import DataLink from './ur-class-datalink';

/// PRIVATE DECLARATIONS //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PHASE_HOOKS = new Map();
const PHASES = [
  'TEST_CONF', // setup tests
  'INITIALIZE', // module data structure init
  'LOADASSETS', // load any external data, make connections
  'CONFIGURE', // configure runtime data structures
  'DOM_READY', // when viewsystem has completely composed
  'RESET', // reset runtime data structures
  'START', // start normal execution run
  'APP_READY', // synchronize to UNISYS network server
  'RUN', // system starts running
  'UPDATE', // system is running (periodic call w/ time)
  'PREPAUSE', // system wants to pause run
  'PAUSE', // system has paused (periodic call w/ time)
  'POSTPAUSE', // system wants to resume running
  'STOP', // system wants to stop current run
  'DISCONNECT', // unisys server has gone offline
  'RECONNECT', // unisys server has reconnected
  'UNLOADASSETS', // system releases any connections
  'SHUTDOWN' // system wants to shut down
];

const DBG = false;
const MOD = { name: 'LifeCycle', scope: 'system/booting' };
const BAD_PATH = "module_path must be a string derived from the module's module.id";
const URDATA = new DataLink(module);
let PHASE;

/// PRIVATE HELPERS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ UTILITY: compare the destination scope with the acceptable scope (the
    module.id of the root JSX component in a view). Any module not in the
    system directory will not get called
/*/
function m_ExecuteScopedPhase(phase, o) {
  // check for special unisys or system directory
  if (o.scope.indexOf('system') === 0) return o.f();
  if (o.scope.indexOf('unisys') === 0) return o.f();
  // check for subdirectory
  if (o.scope.includes(MOD.scope, 0)) return o.f();
  // else do nothing
  if (DBG)
    console.info(`LIFECYCLE: skipping [${phase}] for ${o.scope} because scope is ${MOD.scope}`);
  return undefined;
}
/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// LIFECYCLE METHODS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ API: register a Phase Handler which is invoked by MOD.Execute()
    phase is a string constant from PHASES array above
    f is a function that does work immediately, or returns a Promise
/*/
const Hook = (phase, f, scope) => {
  // make sure scope is included
  if (typeof scope !== 'string') throw Error(`<arg3> scope is required (set to module.id)`);
  // does this phase exist?
  if (typeof phase !== 'string') throw Error("<arg1> must be PHASENAME (e.g. 'LOADASSETS')");
  if (!PHASES.includes(phase)) throw Error(phase, 'is not a recognized lifecycle phase');
  // did we also get a promise?
  if (!(f instanceof Function))
    throw Error('<arg2> must be a function optionally returning Promise');
  // get the list of promises associated with this phase
  // and add the new promise
  if (!PHASE_HOOKS.has(phase)) PHASE_HOOKS.set(phase, []);
  PHASE_HOOKS.get(phase).push({ f, scope });
  if (DBG) console.log(`[${phase}] added handler`);
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ API: Execute all Promises associated with a phase, completing when
    all the callback functions complete. If the callback function returns
    a Promise, this is added to a list of Promises to wait for before the
    function returns control to the calling code.
/*/
const Execute = async phase => {
  // require scope to be set
  if (MOD.scope === false)
    throw Error(`UNISYS.SetScope() must be set to RootJSX View's module.id. Aborting.`);

  // note: contents of PHASE_HOOKs are promise-generating functions
  if (!PHASES.includes(phase)) throw Error(`${phase} is not a recognized lifecycle phase`);
  let hooks = PHASE_HOOKS.get(phase);
  if (hooks === undefined) {
    if (DBG) console.log(`[${phase}] no subscribers`);
    return;
  }

  // phase housekeeping
  PHASE = `${phase}_PENDING`;

  // now execute handlers and promises
  let icount = 0;
  if (DBG) console.group(phase);
  // get an array of promises
  // o contains f, scope pushed in Hook() above
  let promises = hooks.map(o => {
    let retval = m_ExecuteScopedPhase(phase, o);
    if (retval instanceof Promise) {
      icount++;
      return retval;
    }
    // return undefined to signal no special handling
    return undefined;
  });
  promises = promises.filter(e => {
    return e !== undefined;
  });
  if (DBG && hooks.length) console.log(`[${phase}] HANDLERS PROCESSED : ${hooks.length}`);
  if (DBG && icount) console.log(`[${phase}] PROMISES QUEUED    : ${icount}`);

  // wait for all promises to execute
  await Promise.all(promises)
    .then(values => {
      if (DBG && values.length)
        console.log(`[${phase}] PROMISES RETURNED  : ${values.length}`, values);
      if (DBG) console.groupEnd();
      return values;
    })
    .catch(err => {
      if (DBG) console.log(`[${phase} EXECUTE ERROR ${err}`);
      throw Error(`[${phase} EXECUTE ERROR ${err}`);
    });

  // phase housekeeping
  PHASE = phase;
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ API: The scope is used to filter lifecycle events within a particular
    application path, which are defined under the view directory.
/*/
const SetScope = module_path => {
  if (typeof module_path !== 'string') throw Error(BAD_PATH);
  if (DBG) console.log(`setting lifecycle scope to ${module_path}`);
  // strip out filename, if one exists
  MOD.scope = Dirname(module_path);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ API: The scope
/*/
const Scope = () => {
  return MOD.scope;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ API: application startup
/*/
const EnterApp = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await Execute('TEST_CONF'); // TESTCONFIG hook
      await Execute('INITIALIZE'); // INITIALIZE hook
      await Execute('LOADASSETS'); // LOADASSETS hook
      await Execute('CONFIGURE'); // CONFIGURE support modules
      resolve();
    } catch (e) {
      console.error(
        'EnterApp() Lifecycle Error. Check phase execution order effect on data validity.\n',
        e
      );
      debugger;
    }
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ API: call this when the view system's DOM has stabilized and is ready
    for manipulation by other code
/*/
const SetupDOM = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await Execute('DOM_READY'); // GUI layout has finished composing
      resolve();
    } catch (e) {
      console.error(
        'SetupDOM() Lifecycle Error. Check phase execution order effect on data validity.\n',
        e
      );
      debugger;
    }
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ API: network startup
/*/
const JoinNet = () => {
  return new Promise((resolve, reject) => {
    try {
      URNET.Connect(URDATA, { success: resolve, failure: reject });
    } catch (e) {
      console.error(
        'EnterNet() Lifecycle Error. Check phase execution order effect on data validity.\n',
        e
      );
      debugger;
    }
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ API: configure system before run
/*/
const SetupRun = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await Execute('RESET'); // RESET runtime datastructures
      await Execute('START'); // START running
      await Execute('APP_READY'); // tell network APP_READY
      await Execute('RUN'); // tell network APP_READY
      resolve();
    } catch (e) {
      console.error(
        'SetupRun() Lifecycle Error. Check phase execution order effect on data validity.\n',
        e
      );
      debugger;
    }
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ API: handle periodic updates for a simulation-driven timestep
/*/
const Run = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await Execute('UPDATE');
      resolve();
    } catch (e) {
      console.error(e);
    }
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ API: do the Shutdown lifecycle
    NOTE ASYNC ARROW FUNCTION (necessary?)
/*/
const BeforePause = () => {
  return new Promise(async (resolve, reject) => {
    await Execute('PREPAUSE');
    resolve();
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ API: do the Shutdown lifecycle
    NOTE ASYNC ARROW FUNCTION (necessary?)
/*/
const Paused = () => {
  return new Promise(async (resolve, reject) => {
    await Execute('PAUSE');
    resolve();
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ API: do the Shutdown lifecycle
    NOTE ASYNC ARROW FUNCTION (necessary?)
/*/
const PostPause = () => {
  return new Promise(async (resolve, reject) => {
    await Execute('POSTPAUSE');
    resolve();
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ API: do the Shutdown lifecycle
    NOTE ASYNC ARROW FUNCTION (necessary?)
/*/
const CleanupRun = () => {
  return new Promise(async (resolve, reject) => {
    await Execute('STOP');
    resolve();
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ API: application offline
    NOTE ASYNC ARROW FUNCTION (necessary?)
/*/
const ServerDisconnect = () => {
  return new Promise(async (resolve, reject) => {
    await Execute('DISCONNECT');
    resolve();
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ API: application shutdown
    NOTE ASYNC ARROW FUNCTION (necessary?)
/*/
const ExitApp = () => {
  return new Promise(async (resolve, reject) => {
    await Execute('UNLOADASSETS');
    await Execute('SHUTDOWN');
    resolve();
  });
};
/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default {
  Hook,
  Execute,
  SetScope,
  Scope,
  EnterApp,
  SetupDOM,
  JoinNet,
  SetupRun,
  Run,
  BeforePause,
  Paused,
  PostPause,
  CleanupRun,
  ServerDisconnect,
  ExitApp
};
