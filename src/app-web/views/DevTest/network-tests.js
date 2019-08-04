/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\
\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../../system/ursys';
import { cssur } from '../../modules/console-styles';

const MOD = {
  name: 'netTest'
};

const UDATA = new UR.DataLink(MOD);

function DefineHandlers() {
  console.log(`%c${UDATA.Name()}.RegisterHandlers()`, cssur);
  UDATA.HandleMessage('MYSTERY', data => {
    console.log(`%c${UDATA.Name()}.MYSTERY got `, cssur, data);
    data.todos.push(`buy ${UDATA.UADDR()} presents`);
    return data;
  });
}

function ServerReflect() {
  UDATA.Call('SRV_REFLECT', { stack: ['me'] }).then(data => {
    console.log(`%c${UDATA.Name()}.Reflect() got`, cssur, data);
  });
}

function LocalCall() {
  UDATA.LocalCall('MYSTERY', { todos: ['take out garbage', 'clean basement'] }).then(data => {
    console.log(`%c${UDATA.Name()}.LocalCall('MYSTERY') received`, cssur, data);
  });
}

function UndefinedCall() {
  UDATA.Call('UnHanDled', {}).then(data => {
    console.log(`%c${UDATA.Name()}.LocalCall('UnHanDled') received`, cssur, data);
  });
}

function NetCall() {
  UDATA.NetCall('MYSTERY', { todos: ['take out garbage', 'clean basement'] }).then(data => {
    console.log(`%c${UDATA.UADDR()}.NetCall('MYSTERY') received`, cssur, data);
  });
}

function GetDB() {
  UDATA.NetCall('SRV_DBGET', {}).then(data => {
    console.log(data);
  });
}

function DoConstructionTests() {
  ServerReflect();
  // define message handlers, which are
  // autoregistered after componentDidMount
  DefineHandlers();
}

function DoMountTests() {
  LocalCall();
  // these are not network available yet
  // unless another instance was already running
  NetCall();
  //
  GetDB();
}

function DoRenderTests() {}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default { DoConstructionTests, DoMountTests, DoRenderTests };
