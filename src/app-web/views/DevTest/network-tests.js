/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\
\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../../system/ursys';
import { cssur } from '../../modules/console-styles';

const UDATA = new UR.NewDataLink(__filename);
const UDATA2 = new UR.NewDataLink(`__filename${2}`);
let testLocalCallbackRejection;

function DefineHandlers(comp) {
  console.log(`%c${UDATA.Name()}.RegisterHandlers()`, cssur);
  //
  const testLocalCallback = comp.RegisterTest('LocalCallbackInvoked');
  //
  UDATA2.Subscribe('MYSTERY', data => {
    console.log(`%c${UDATA.Name()}.MYSTERY got `, cssur, data);
    data.todos.push(`buy ${UDATA.UADDR()} presents`);
    testLocalCallback.pass();
    return data;
  });

  if (UR.PeerCount() < 2) return;

  const testNetCallbackInvoke = comp.RegisterTest('NetCallbackInvoked');
  testLocalCallbackRejection = comp.RegisterTest('LocalCallbackRejection');

  // this handles network subscriptions only
  // it requires that the remote calls it
  // also both clients need to be refreshed at the same time
  // requires a working PEERCOUNT UPDATE system
  UDATA2.NetSubscribe('MYSTERY_REMOTE', data => {
    console.log(`%c${UDATA.Name()}.MYSTERY_REMOTE got `, cssur, data);
    data.todos.push(`remote ${UDATA.UADDR()} call test`);
    if (!data.subLog) data.subLog = [];
    data.subLog.push('NetSubcriber');
    testNetCallbackInvoke.pass();
    // since this test is dependent on another client existing
    // we need to run the completion test again
    comp.DidTestsComplete();
    return data;
  });

  UDATA2.Subscribe('MYSTERY_REMOTE', data => {
    console.log(`%c${UDATA.Name()}.MYSTERY_REMOTE got `, cssur, data);
    if (!data.subLog) data.subLog = [];
    data.subLog.push('LocalSubscriber');
    testLocalCallbackRejection.fail('should not have been called');
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
    testServerReflect.pass();
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
  if (UR.PeerCount() < 2) return;
  let testNetCall = comp.RegisterTest('NetCallRoundTrip');
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
    } else {
      testNetCallData.fail('data unmodified');
    }
    // check for callback isolation when
    // a subscriber implements both Local and Net versions of a call
    if (testLocalCallbackRejection) {
      if (!data.subLog) testLocalCallbackRejection.fail('missing subLog');
      else if (data.subLog.includes('LocalSubscriber'))
        testLocalCallbackRejection.fail('local sub was called unexpectedly');
      else testLocalCallbackRejection.pass();
    }
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
      if (comp.DidTestsComplete()) console.log('TESTS FAIL');
      else console.log('TESTS SUCCESS');
    }, 3000);
    LocalCall(comp);
    NetCall(comp);
    UndefinedLocalCall(comp);
    GetDB(comp);
  },
  DoRenderTests: comp => {}
};
