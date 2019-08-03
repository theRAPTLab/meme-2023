/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\
\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../../system/ursys';
import { cssur } from '../../modules/console-styles';

const MOD = {
  name: 'network-tests'
};

const UDATA = new UR.DataLink(MOD);

function DefineHandlers() {
  console.log(`%c${UDATA.Name()}.RegisterHandlers()`, cssur);
  UDATA.HandleMessage('MYSTERY', data => {
    console.log(`%c${UDATA.Name()}.MYSTERY got `, cssur, data);
    console.log('returning new data', data.todos);
    return { memo: 'I got your data', todos: data.todos };
  });
}

function Reflect() {
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
    console.log(`%c${UDATA.Name()}.LocalCall('MYSTERY') received`, cssur, data);
  });
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default { Reflect, LocalCall, NetCall, UndefinedCall, DefineHandlers };
