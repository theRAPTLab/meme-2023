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
import { Publish, Sub, Unsub } from './ur-pubsub';
import EXEC from './ur-exec';

/// PRIVATE DECLARATIONS //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true; // module-wide debug flag

/// PRIVATE HELPERS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// TESTS /////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default { EXEC, CENTRAL, Publish, Sub, Unsub };
