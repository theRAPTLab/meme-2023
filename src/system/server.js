/* eslint-disable no-param-reassign */
/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  UNISYS server loader

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

const DBG = false;

///	LOAD LIBRARIES ////////////////////////////////////////////////////////////
///	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const UNET = require('./server-network');
const UDB = require('./server-database');
const LOGGER = require('./server-logger');

/// CONSTANTS /////////////////////////////////////////////////////////////////
///	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PROMPTS = require('./util/prompts');

const PR = PROMPTS.Pad('SRV');

/// MODULE VARS ///////////////////////////////////////////////////////////////
///	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// API CREATE MODULE /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let UNISYS = {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 */
UNISYS.InitializeNetwork = override => {
  UDB.InitializeDatabase(override);
  return UNET.InitializeNetwork(override);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 */
UNISYS.RegisterHandlers = () => {
  UNET.HandleMessage('SRV_REFLECT', pkt => {
    pkt.Data().serverSays = 'REFLECTING';
    pkt.Data().stack.push('SRV_01');
    if (DBG) console.log(PR, sprint_message(pkt));
    // return the original packet
    return pkt;
  });

  UNET.HandleMessage('SRV_REG_HANDLERS', pkt => {
    if (DBG) console.log(PR, sprint_message(pkt));
    // now need to store the handlers somehow.
    let data = UNET.RegisterRemoteHandlers(pkt);
    // or return a new data object that will replace pkt.data
    return data;
  });

  UNET.HandleMessage('SRV_DBGET', pkt => {
    if (DBG) console.log(PR, sprint_message(pkt));
    return UDB.PKT_GetDatabase(pkt);
  });

  UNET.HandleMessage('SRV_DBSET', pkt => {
    if (DBG) console.log(PR, sprint_message(pkt));
    return UDB.PKT_SetDatabase(pkt);
  });

  // receives a packet from a client
  UNET.HandleMessage('SRV_DBUPDATE', pkt => {
    if (DBG) console.log(PR, sprint_message(pkt));
    let data = UDB.PKT_Update(pkt);
    // add src attribute for client SOURCE_UPDATE to know
    // this is a remote update
    data.src = 'remote';
    // fire update messages
    if (data.node) UNET.NetSend('SOURCE_UPDATE', data);
    if (data.edge) UNET.NetSend('EDGE_UPDATE', data);
    if (data.nodeID !== undefined) UNET.NetSend('NODE_DELETE', data);
    if (data.edgeID !== undefined) UNET.NetSend('EDGE_DELETE', data);
    // return SRV_DBUPDATE value (required)
    return { OK: true, info: 'SRC_DBUPDATE' };
  });

  UNET.HandleMessage('SRV_DBGETNODEID', pkt => {
    if (DBG) console.log(PR, sprint_message(pkt));
    return UDB.PKT_GetNewNodeID(pkt);
  });

  UNET.HandleMessage('SRV_DBLOCKNODE', pkt => {
    if (DBG) console.log(PR, sprint_message(pkt));
    return UDB.PKT_RequestLockNode(pkt);
  });

  UNET.HandleMessage('SRV_DBUNLOCKNODE', pkt => {
    if (DBG) console.log(PR, sprint_message(pkt));
    return UDB.PKT_RequestUnlockNode(pkt);
  });

  UNET.HandleMessage('SRV_DBLOCKEDGE', pkt => {
    if (DBG) console.log(PR, sprint_message(pkt));
    return UDB.PKT_RequestLockEdge(pkt);
  });

  UNET.HandleMessage('SRV_DBUNLOCKEDGE', pkt => {
    if (DBG) console.log(PR, sprint_message(pkt));
    return UDB.PKT_RequestUnlockEdge(pkt);
  });

  UNET.HandleMessage('SRV_DBUNLOCKALLNODES', pkt => {
    if (DBG) console.log(PR, sprint_message(pkt));
    return UDB.PKT_RequestUnlockAllNodes(pkt);
  });
  UNET.HandleMessage('SRV_DBUNLOCKALLEDGES', pkt => {
    if (DBG) console.log(PR, sprint_message(pkt));
    return UDB.PKT_RequestUnlockAllEdges(pkt);
  });
  UNET.HandleMessage('SRV_DBUNLOCKALL', pkt => {
    if (DBG) console.log(PR, sprint_message(pkt));
    return UDB.PKT_RequestUnlockAll(pkt);
  });

  UNET.HandleMessage('SRV_DBGETEDGEID', pkt => {
    if (DBG) console.log(PR, sprint_message(pkt));
    return UDB.PKT_GetNewEdgeID(pkt);
  });

  UNET.HandleMessage('SRV_LOG_EVENT', pkt => {
    if (DBG) console.log(PR, sprint_message(pkt));
    return LOGGER.PKT_LogEvent(pkt);
  });

  // utility function //
  function sprint_message(pkt) {
    return `got '${pkt.Message()}' data=${JSON.stringify(pkt.Data())}`;
  }
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 */
UNISYS.StartNetwork = () => {
  UNET.StartNetwork();
};

/// EXPORT MODULE DEFINITION //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = UNISYS;
