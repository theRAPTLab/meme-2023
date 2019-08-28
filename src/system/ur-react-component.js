/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Returns a higher-order component with the UR DataLink capabilities built-in.
  It provides the subset of UDATA methods that make sense for a React
  component.

  In URSYS, React components are initialized after the lifecycle 'CONFIGURE'
  phase fires. All lifecycle hooks (as defined in ur-exec.js) after
  'CONFIGURE' are available to React components.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
///
import EXEC from './ur-exec';
import URDataLink from './common-datalink';

import REFLECT from './util/reflect';

/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const UDATA = new URDataLink('UR.Component');

/// CLASS /////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// MESSAGE HANDLING API METHODS
class URComponent extends React.Component {
  Subscribe(m, lis) {
    UDATA.Subscribe(m, lis);
  }

  Unsubscribe(m, lis) {
    UDATA.Unsubscribe(m, lis);
  }

  /// SPECIAL EVENTS
  OnDOMReady(lis) {
    UDATA.Hook('DOM_READY', lis);
  }

  OnReset(lis) {
    UDATA.Hook('RESET', lis);
  }

  OnStart(lis) {
    UDATA.Hook('START', lis);
  }

  OnAppReady(lis) {
    UDATA.Hook('APP_READY', lis);
  }

  OnRun(lis) {
    UDATA.Hook('RUN', lis);
  }

  /// MESSAGE INVOCATION API METHODS
  Call(m, d, o) {
    return UDATA.Call(m, d, o);
  }

  Send(m, d, o) {
    UDATA.Send(m, d, o);
  }

  Signal(m, d, o) {
    UDATA.Signal(m, d, o);
  }

  AppCall(m, d, o) {
    return UDATA.LocalCall(m, d, o);
  }

  AppSend(m, d, o) {
    UDATA.LocalSend(m, d, o);
  }

  AppSignal(m, d, o) {
    UDATA.LocalSignal(m, d, o);
  }

  NetSend(m, d, o) {
    UDATA.NetSend(m, d, o);
  }

  NetCall(m, d, o) {
    return UDATA.NetCall(m, d, o);
  }

  NetSignal(m, d, o) {
    UDATA.NetSignal(m, d, o);
  }

  LocalCall(m, d, o) {
    f_deprecated('AppCall');
    return UDATA.LocalCall(m, d, o);
  }

  LocalSend(m, d, o) {
    f_deprecated('AppSend');
    UDATA.LocalSend(m, d, o);
  }

  LocalSignal(m, d, o) {
    f_deprecated('AppSignal');
    UDATA.LocalSignal(m, d, o);
  }

  /// STATE API METHODS
  State(ns) {
    f_deprecated('AppState');
    return this.AppState(ns);
  }

  SetState(ns, so) {
    f_deprecated('SetAppState');
    this.SetAppState(ns, so);
  }

  OnStateChange(ns, lis) {
    f_deprecated('OnAppStateChange');
    this.OnAppStateChange(ns, lis);
  }

  OffStateChange(ns, lis) {
    f_deprecated('AppStateChangeOff');
    this.AppStateChangeOff(ns, lis);
  }

  /// NEW STATE API METHODS
  AppState(ns) {
    return UDATA.AppState(ns);
  }

  SetAppState(ns, so) {
    UDATA.SetAppState(ns, so);
  }

  OnAppStateChange(ns, lis) {
    UDATA.OnAppStateChange(ns, lis);
  }

  AppStateChangeOff(ns, lis) {
    UDATA.AppStateChangeOff(ns, lis);
  }

  NetState(ns) {
    f_unimplemented();
  }

  SetNetState(ns, so) {
    f_unimplemented();
  }

  OnNetStateChange(ns, lis) {
    f_unimplemented();
  }

  NetStateChangeOff(ns, lis) {
    f_unimplemented();
  }

  /// LIFECYCLE API
  Hook(phase, lis, scope) {
    if (EXEC.IsReactPhase(phase)) EXEC.Hook(phase, lis, scope);
  }
} // UnisysComponent

function f_deprecated(repl) {
  let out = `${REFLECT.FunctionName(2)} is deprecated.`;
  if (typeof repl === 'string') out += ` Use ${repl}() instead.`;
  console.warn(out);
}

function f_unimplemented() {
  let out = `${REFLECT.FunctionName(2)} is not yet implemented.`;
  alert(`${out}\n\nCrashing now! Use javascript console to debug`);
  console.error(out);
  debugger;
}

function f_unsupported(reason) {
  let out = `${REFLECT.FunctionName(2)} ${reason}`;
  alert(`${out}\n\nCrashing now! Use javascript console to debug`);
  console.error(out);
  debugger;
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default URComponent;
