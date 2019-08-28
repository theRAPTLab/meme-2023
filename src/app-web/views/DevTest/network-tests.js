/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\
\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../../system/ursys';
import { cssur } from '../../modules/console-styles';

const UDATA = new UR.NewDataLink(__filename);

function DefineHandlers(comp) {
  console.log(`%c${UDATA.Name()}.RegisterHandlers()`, cssur);
  //
  const testSubscriber = comp.RegisterTest('Subscribe Callback');
  const testRemoteSubscriber = comp.RegisterTest('NetSubscribe Callback');
  const testRemoteSubscriberReject = comp.RegisterTest('NetSubscribe Callback Isolation');
  //
  UDATA.Subscribe('MYSTERY', data => {
    console.log(`%c${UDATA.Name()}.MYSTERY got `, cssur, data);
    data.todos.push(`buy ${UDATA.UADDR()} presents`);
    testSubscriber(pass);
    return data;
  });

  UDATA.NetSubscribe('MYSTERY_REMOTE', data => {
    console.log(`%c${UDATA.Name()}.MYSTERY_REMOTE got `, cssur, data);
    data.todos.push(`remote ${UDATA.UADDR()} call test`);
    if (!data.callReject) data.callReject = [];
    data.callReject.push('NetSubcribe');
    testRemoteSubscriber.pass();
    console.log('data callreject', data.callReject);
    return data;
  });
  UDATA.Subscribe('MYSTERY_REMOTE', data => {
    console.log(`%c${UDATA.Name()}.MYSTERY_REMOTE got `, cssur, data);
    if (!data.callReject) data.callReject = [];
    data.callReject.push('Subscribe');
    testRemoteSubscribeReject.fail('should not have been called');
  });
}

/**
 * TEST: call server reflect, which adds an element to data.stacks and
 * adds a message in serverSays==='REFLECTING'
 * @param {TestComponent} comp
 */
function ServerReflect(comp) {
  const testServerReflect = comp.RegisterTest('ServerReflect');
  const testServerReflectData = comp.RegisterTest('ServerReflect+Data');

  const timeout = setTimeout(() => {
    testServerReflect.fail('server no response');
  }, 1000);

  UDATA.NetCall('SRV_REFLECT', { stack: ['me'] }).then(data => {
    if (data.serverSays === 'REFLECTING') {
      clearTimeout(timeout);
      testServerReflectData.pass();
    }
  });
}

function LocalCall(comp) {
  const testLocalCall = comp.RegisterTest('Local Callback');

  const timeout = setTimeout(() => {
    testLocalCall.fail('system timeout');
  }, 1000);
  UDATA.LocalCall('MYSTERY', {
    todos: ['take out garbage', 'clean basement'],
    source: 'LocalCall'
  }).then(data => {
    clearTimeout(timeout);
    testLocalCall.pass();
  });
}

function UndefinedLocalCall(comp) {
  const testMissingLocalCall = comp.RegisterTest('BadLocalCall');

  const timeout = setTimeout(() => {
    testMissingLocalCall.fail('unexpected timeout');
  }, 1000);
  UDATA.LocalCall('UnHanDled', {}).then(data => {
    clearTimeout(timeout);
    if (data.error) testMissingLocalCall.pass();
    else testMissingLocalCall.fail('unexpected success');
  });
}

function NetCall(comp) {
  const testNetCall = comp.RegisterTest('NetCall RoundTrip');
  const testNetCallData = comp.RegisterTest('NetCall+Data');

  const timeout = setTimeout(() => {
    testNetCall.fail('connection timeout');
  }, 1000);
  UDATA.NetCall('MYSTERY_REMOTE', {
    todos: ['take out garbage', 'clean basement'],
    source: 'NetCall'
  }).then(data => {
    clearTimeout(timeout);
    if (data.error) {
      // server returns only an error if couldn't find handler
      testNetCall.fail(data.error);
      return;
    }
    testNetCall.pass(); // the netcall mechanism worked!
    // check for modified data
    if (data.todos.length > 2) {
      testNetCallData.pass();
      return;
    }
    testNetCallData.fail('data unmodified');
    console.log('data', data);
  });
}

function GetDB(comp) {
  const testGetDB = comp.RegisterTest('GetDB');

  const timeout = setTimeout(() => {
    testGetDB.fail('timeout');
  }, 1000);
  UDATA.NetCall('SRV_DBGET', {}).then(data => {
    clearTimeout(timeout);
    testGetDB.pass();
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
    const timeout = setTimeout(() => {
      if (comp.DidTestsComplete()) console.log('FAIL');
      else console.log('SUCCESS');
    }, 3000);
    LocalCall(comp);
    NetCall(comp);
    UndefinedLocalCall(comp);
    GetDB(comp);
  },
  DoRenderTests: comp => {}
};
