/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  COMMENT DATABASE MANAGER

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

import { v4 as uuidv4 } from 'uuid';
import UR from '../../system/ursys';
import * as COMMENT from './ac-comment.ts';
import PMC from '../../app-web/modules/data';
import ASET from '../../app-web/modules/adm-settings';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const PR = 'comment-db: ';

/// INITIALIZE MODULE /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const UDATA = UR.NewConnection('comment-db');

/// API METHODS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function GetCommentData() {
  // Load the whole `urcomments` table.
  const data = {};
  // placeholder data.commenttypes = ADM.GetCommentTypes();
  // placeholder data.users = ADM.GetAllUsers();
  data.comments = PMC.GetAllURComments();
  data.readby = PMC.GetAllURReadbys();
  return data;
}

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * URComment* objects need a unique ID when they are created.
 * Since comments can be created asynchronously, we need to generate a new
 * ID that is unique across any network users.
 * @returns {Promise} Returns a new string comment ID
 */
function PromiseNewCommentID() {
  return new Promise((resolve, reject) => {
    resolve(uuidv4()); // use uuid
  })
}

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function DBLockComment(lokiObjID, cb) {
  const pmcDataId = ASET.selectedPMCDataId;
  UR.DBTryLock('pmcData.urcomments', [pmcDataId, lokiObjID]).then(rdata => {
    const { success, semaphore, uaddr, lockedBy } = rdata;
    status += success
      ? `${semaphore} lock acquired by ${uaddr} `
      : `failed to acquired ${semaphore} lock `;
    if (rdata.success) {
      if (typeof cb === 'function') cb({ result: 'success' });
      return;
    } else {
      alert(
        `Sorry, someone else (${rdata.lockedBy}) is editing this Comment right now.  Please try again later.`
      );
    }
    if (typeof cb === 'function') cb({ result: 'failed' });
  });
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function DBUnlockComment(lokiObjID, cb) {
  const pmcDataId = ASET.selectedPMCDataId;
  UR.DBTryRelease('pmcData.urcomments', [pmcDataId, lokiObjID]).then(rdata => {
    if (typeof cb === 'function') cb({ result: 'success' });
  });
}

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * The `cb` will include the new `id` if this is a new comment that was just added
 * @param {TComment} cobj
 * @param {function} cb
 */
function DBUpdateComment(cobj, cb) {
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
  // The `cb` will include the new `id` if this is a new comment that was just added
  PMC.UR_CommentUpdate(cobj.collection_ref, comment, cb);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Note we mark MULTILPLE comments as read with each update
 * @param {TCollectionRef} cref
 * @param {TUserID} uid
 */
function DBUpdateReadBy(cref, uid) {
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
  PMC.UR_MarkReadBy(readbys);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Executes multiple database operations via a batch of commands:
 * - `commentIDs` will be deleted
 * - `comments` will be updated
 * Called from comment-mgr.m_ExecuteRemoveComment
 * @param {TCommentQueueActions[]} queuedActions [ ...cobj, ...commentID ]
 * @param {function} cb callback
 */
function DBRemoveComment(queuedActions, cb) {
  // 1. Collect and process the `commentID` actions.
  // The original NetCreate comment system used a unique string comment
  // but MEME's database requires a numeric id.  So we need to convert
  // the UUID string to the pmcData id.
  const ids = queuedActions
    .filter(item => {
      return (
        Object.hasOwn(item, 'id')
        && item.id !== undefined // A newly created unsaved comment will not have an id,
        // so don't bother to try remove it from the database
      )
    })
    .map(item => { return { id: item.id } });
  // FIXME: Need to add LOCK before DB update???
  PMC.UR_CommentsDelete(ids);

  // 2. Collect and process the `cobj` actions.
  const cobjs = queuedActions
    .filter(item => Object.hasOwn(item, 'comment'))
    .map(item => item.comment);
  if (cobjs.length > 0) {
    // the first cobj should have the collection_ref
    const cref = cobjs[0].collection_ref;
    // the last CommentsUpdate should call the callback
    PMC.UR_CommentsUpdate(cref, cobjs, cb);
    return;
  }

  // If there weren't any cobj updates, we
  // still need to call the callback to signal deletions
  if (typeof cb === 'function') cb();
}

/// EXPORT CLASS DEFINITION ///////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  GetCommentData,
  PromiseNewCommentID,
  DBLockComment,
  DBUnlockComment,
  DBUpdateComment,
  DBUpdateReadBy,
  DBRemoveComment
};
