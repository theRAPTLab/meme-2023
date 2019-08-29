/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  ursys is the browser-side of the UR library.

  The API is implemented with methods from the following:

  * lifecycle - the application run controller, managing 'phases' in a way
    similar to runlevels in a *nix system except they are named
  * pubsub - the async messaging infrastructure inside the app and with the
    server using an addressless protocol and specific channels like NET: ALL:
  * state - manages default settings, derived settings, shared state,
    persisting data to browser or database
  * log - writes debug information

  Supporting libraries are:

  * network - maintains browser-server connection and related data
  * database - maintains database-related stuff for datastore

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import CENTRAL from './ur-central';
import EXEC from './ur-exec';
import ReloadOnViewChange from './util/reload';
import NetMessage from './common-netmessage';
import URLink from './common-urlink';
import URComponent from './ur-react-component';
import REFLECT from './util/reflect';

/// PRIVATE DECLARATIONS //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true; // module-wide debug flag
const ULINK = Connect(module.id || __dirname);
let ULINK_COUNTER = 0;

/// RUNTIME FLAGS /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
CENTRAL.Define('ur_legacy_publish', true);

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API:
 * return a new instance of a URSYS connection, which handles all the important
 * id meta-data for communicating over the network
 * @param {string} name - An optional name
 */
function Connect(name) {
  const count = `${ULINK_COUNTER++}`.padStart(3, '0');
  let uname = name || 'URSYS';
  uname += `${count}`.padStart(3, '0');
  return new URLink(uname);
}

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// provide
const { Publish, Subscribe, Unsubscribe } = ULINK;
const { Call, Signal } = ULINK;

const { NetPublish, NetSubscribe } = ULINK;
const { NetCall, NetSignal } = ULINK;

// return the number of peers on the network
function PeerCount() {
  return NetMessage.PEERS.count;
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const UR = {
  EXEC,
  CENTRAL,
  Publish,
  Subscribe,
  Unsubscribe,
  Call,
  Signal,
  NetPublish,
  NetSubscribe,
  NetCall,
  NetSignal,
  ReloadOnViewChange,
  NetMessage,
  Connect,
  PeerCount
};
export default UR;
