/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  COMMENT DATABASE MANAGER

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

import UR from '../../system/ursys';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const PR = 'comment-db: ';

/// INITIALIZE MODULE /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const MOD = {};
const UDATA = UR.NewConnection('comment-db');

/// API METHODS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

MOD.GetCommentData = () => {
  return {}; // add data after we figure out how to load
  return PMC.URGetComments();
}

/**
 *
 * @returns {number} commentID
 */
let ID_COUNTER = 0; // interim id count
MOD.PromiseNewCommentID = () => {
  // iterim new id generator
  return new Promise((resolve, reject) => {
    resolve(ID_COUNTER++);
  })
  return new Promise((resolve, reject) => {
    UDATA.NetCall('SRV_DBGETCOMMENTID').then(data => {
      if (data.comment_id) {
        if (DBG) console.log(PR, 'server allocated comment_id', data.comment_id);
        resolve(data.comment_id);
      } else {
        if (UNISYS.IsStandaloneMode()) {
          reject(
            new Error(
              'STANDALONE MODE: UI should prevent PromiseNewCommentID() from running!'
            )
          );
        } else {
          reject(new Error('unknown error' + JSON.stringify(data)));
        }
      }
    });
  });
}

/// EXPORT CLASS DEFINITION ///////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default MOD;
