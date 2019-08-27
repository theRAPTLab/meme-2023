/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\
\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../../system/ursys';
import { cssur } from '../../modules/console-styles';

const UDATA = new UR.NewDataLink(__filename);

function DefineHandlers(comp) {
  console.log(`%c${UDATA.Name()}.RegisterHandlers()`, cssur);
  UDATA.Subscribe('MYSTERY', data => {
    console.log(`%c${UDATA.Name()}.MYSTERY got `, cssur, data);
    data.todos.push(`buy ${UDATA.UADDR()} presents`);
    comp.AddTestResult(`${data.source || '<unknown>'} 'MYSTERY' subscribe`);
    return data;
  });
}

/**
 * TEST: call server reflect, which adds an element to data.stacks and
 * adds a message in serverSays==='REFLECTING'
 * @param {TestComponent} comp
 */
function ServerReflect(comp) {
  const timeout = setTimeout(() => {
    comp.AddTestResult('ServerReflect', 'server did not respond');
  }, 1000);
  UDATA.NetCall('SRV_REFLECT', { stack: ['me'] }).then(data => {
    if (data.serverSays === 'REFLECTING') {
      clearTimeout(timeout);
      comp.AddTestResult('ServerReflect Mechanism');
    }
  });
}
function LocalCall(comp) {
  const timeout = setTimeout(() => {
    comp.AddTestResult('LocalCall', 'system timeout');
  }, 1000);
  UDATA.LocalCall('MYSTERY', {
    todos: ['take out garbage', 'clean basement'],
    source: 'LocalCall'
  }).then(data => {
    clearTimeout(timeout);
    comp.AddTestResult(`${data.source || '<unknown>'} 'MYSTERY' callback`);
  });
}

function UndefinedLocalCall(comp) {
  const timeout = setTimeout(() => {
    comp.AddTestResult('UndefinedCall', true);
  }, 1000);
  UDATA.LocalCall('UnHanDled', {}).then(data => {
    clearTimeout(timeout);
    if (data.error) comp.AddTestResult('UndefinedLocalCall correct error');
    else comp.AddTestResult('UndefinedLocalCall', 'unexpected success');
  });
}

function NetCall(comp) {
  const timeout = setTimeout(() => {
    comp.AddTestResult('NetCall', 'connection timeout');
  }, 1000);
  UDATA.NetCall('MYSTERY', {
    todos: ['take out garbage', 'clean basement'],
    source: 'NetCall'
  }).then(data => {
    clearTimeout(timeout);
    comp.AddTestResult('NetCall Return Mechanism');
    if (data.error) {
      comp.AddTestResult(`NetCall 'MYSTERY'`, data.error);
      return;
    }
    if (data.todos.length > 2) {
      comp.AddTestResult(`NetCall 'MYSTERY' data modified`);
      return;
    }
    comp.AddTestResult(`NetCall 'MYSTERY'`, 'data unmodified');
    console.log('data', data);
  });
}

function GetDB(comp) {
  const timeout = setTimeout(() => {
    comp.AddTestResult('GetDB', 'connection timeout');
  }, 1000);
  UDATA.NetCall('SRV_DBGET', {}).then(data => {
    clearTimeout(timeout);
    comp.AddTestResult('GetDB returned data');
    console.log(data);
  });
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default {
  DoConstructionTests: comp => {
    ServerReflect(comp);
    DefineHandlers(comp);
  },
  DoMountTests: comp => {
    LocalCall(comp);
    NetCall(comp);
    UndefinedLocalCall(comp);
    GetDB(comp);
  },
  DoRenderTests: comp => {}
};
