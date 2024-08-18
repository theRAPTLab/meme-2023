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

MOD.DBUpdateComment = (cobj, cb) => {
  console.log('DBUpdateComment', cobj)
  const comment = { // TComment
    // id: xxxx // don't inject `id` here yet!  Rely on pmc-objects to auto-add an id
    collection_ref: cobj.collection_ref,
    comment_id: cobj.comment_id,
    comment_id_parent: cobj.comment_id_parent,
    comment_id_previous: cobj.comment_id_previous,
    comment_type: cobj.comment_type,
    comment_createtime: cobj.comment_createtime,
    comment_modifytime: cobj.comment_modifytime,
    comment_isMarkedDeleted: cobj.comment_isMarkedDeleted,
    commenter_id: cobj.commenter_id,
    commenter_text: cobj.commenter_text
  };
  PMC.UR_CommentUpdate(cobj.collection_ref, comment);
}
/**
 * Note we mark MULTILPLE comments as read with each update
 * @param {*} cref
 * @param {*} uid
 */
MOD.DBUpdateReadBy = (cref, uid) => {
  // Get existing readby
  const cvobjs = COMMENT.GetThreadedViewObjects(cref, uid);
  const readbys = [];
  cvobjs.forEach(cvobj => {
    const commenter_ids = COMMENT.GetReadby(cvobj.comment_id) || [];
    // Add uid if it's not already marked
    if (!commenter_ids.includes(uid)) commenter_ids.push(uid);
    const readby = {
      comment_id: cvobj.comment_id,
      commenter_ids
    };
    readbys.push(readby);
  });
}

/// EXPORT CLASS DEFINITION ///////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default MOD;
