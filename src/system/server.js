/* eslint-disable no-param-reassign */
/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  UR server loader

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
//
const { CS, CR } = PROMPTS;
const PR = `${CS}${PROMPTS.Pad('URSYS')}${CR}`;

/// MODULE VARS ///////////////////////////////////////////////////////////////
///	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// API CREATE MODULE /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let URSYS = {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 */
URSYS.InitializeNetwork = override => {
  UDB.InitializeDatabase(override);
  return UNET.InitializeNetwork(override);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 */
URSYS.RegisterHandlers = () => {
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
URSYS.StartNetwork = () => {
  UNET.StartNetwork();
};

/// EXPORT MODULE DEFINITION //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = URSYS;
