/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  COMMENT MANAGER

  The comment manager is the central hub between the
  * React URComment* components
  * the ac-comment/dc-comment data and logic
  * the database data handled by comment-db manager

  Loading Data
  Comment data is read from the raw database data (comment-db),
  processed and thread and view objects are derived (ac/dc-comments).

  Updating Data
  The React URComments receive data updates to comment-mgr,
  which then directs traffic to:
  * comment-db to store the data to the database
  * ac/dc-comments to update the view objects

  Initialization
  The comment manager module is loaded by the UR system, principally
  adding the URCommentBtn somewhere on the app will initialize the
  comment manager.
  0. URCommmentBtn is added to the app/component
  1. comment-mgr is initialized via UR Hook 'INITIALIZE'.
  2. It then waits for the `DATA_UPDATED` UR message.
  3. When that is received, we request a LoadDBData from the PMC module.

  Creating a Comment
  Comments can be created in multiple places:
  * ViewMEME
    * APPBAR -- Project comment via URCommentBtn
    * CONTROLBAR
      -- OnAddPropComment via `CMTHOST_THREAD_OPEN`
      -- OnAddMechComment via `CMTHOST_THREAD_OPEN`
  * EVLink -- via URCommentBtnAlias
  * VBadge -- VBadge.SVGStickyButton.onClick via `CMTHOST_THREAD_OPEN`


\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

import React from 'react';

import UR from '../../system/ursys';
const STATE = require('./lib/client-state');
import DATAMAP from '../../system/common-datamap';
import ADM from '../../app-web/modules/data';
import DATA from '../../app-web/modules/data';

import CMTDB from './comment-db';
import * as COMMENT from './ac-comment.ts';

// const { EDITORTYPE } = require('system/util/enum');
// const NCUI = require('./nc-ui');

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const PR = 'comment-mgr: ';

/// INITIALIZE MODULE /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const MOD = {};
const UDATA = UR.NewConnection('comment-mgr');

let UID; // user id, cached.  nc-logic updates this on INITIALIZE and SESSION

/// UNISYS LIFECYCLE HOOKS ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** lifecycle INITIALIZE handler
 */
// MOD.Hook('INITIALIZE', () => {
UR.Hook(__dirname, 'INITIALIZE', () => {
  console.log('HOOK INitilizied!')
  COMMENT.Init();
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - inside hook
  /// STATE UPDATES and Message Handlers
  UR.Subscribe('DATA_UPDATED', MOD.LoadDBData);
  UR.Subscribe('COMMENTS_UPDATE', MOD.HandleCOMMENTS_UPDATE);
  UR.Subscribe('COMMENT_UPDATE', MOD.HandleCOMMENT_UPDATE);
  UR.Subscribe('READBY_UPDATE', MOD.HandleREADBY_UPDATE);
  // Net.Create Handlers
  UR.Subscribe('EDIT_PERMISSIONS_UPDATE', m_UpdatePermissions);

  // Currently not used
  // UDATA.OnAppStateChange('COMMENTCOLLECTION', COMMENTCOLLECTION => console.log('comment-mgr.COMMENTCOLLECTION state updated:', COMMENTCOLLECTION));
  // UDATA.OnAppStateChange('COMMENTVOBJS', COMMENTVOBJS => console.error('comment-mgr.COMMENTVOBJS state updated', COMMENTVOBJS));
}); // end INITIALIZE Hook
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** CONFIGURE fires after LOADASSETS, so this is a good place to put TEMPLATE
 *  validation.
 */
// MOD.Hook('CONFIGURE', () => {
//   if (DBG) console.log('comment-mgr CONFIGURE');
// }); // end CONFIGURE Hook

// /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// /** The APP_READY hook is fired after all initialization phases have finished
//  *  and may also fire at other times with a valid info packet
//  */
// MOD.Hook('APP_READY', function (info) {
//   if (DBG) console.log('comment-mgr APP_READY');
// }); // end APP_READY Hook

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** LOAD_COMMENT_DATACORE
   *  Called by comment-mgr after DATA_UPDATED
   *  Loads comments and related tables from the database into ac/dc-comments
   *  @param {Object} data
   *  @param {Object} data.users
   *  @param {Object} data.commenttypes
   *  @param {Object} data.comments
   */
MOD.LoadDBData = () => {
  const TEMPLATE = STATE.State('TEMPLATE');
  COMMENT.LoadTemplate(TEMPLATE.COMMENTTYPES);
  const userStudentId = ADM.GetAuthorId();
  MOD.SetCurrentUserId(userStudentId);
  const data = CMTDB.GetCommentData();
  COMMENT.LoadDB(data);
}

// /// HELPER FUNCTIONS //////////////////////////////////////////////////////////
// /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

MOD.COMMENTICON = (
  <svg id="comment-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 42">
    <path d="M21,0C9.4,0,0,9.4,0,21c0,4.12,1.21,7.96,3.26,11.2l-2.26,9.8,11.56-1.78c2.58,1.14,5.44,1.78,8.44,1.78,11.6,0,21-9.4,21-21S32.6,0,21,0Z" />
  </svg>
);

function m_SetAppStateCommentCollections() {
  const COMMENTCOLLECTION = COMMENT.GetCommentCollections();
  STATE.SetState('COMMENTCOLLECTION', COMMENTCOLLECTION);
}

function m_SetAppStateCommentVObjs() {
  const COMMENTVOBJS = COMMENT.GetCOMMENTVOBJS();
  STATE.SetState('COMMENTVOBJS', COMMENTVOBJS);
}

function m_UpdateComment(comment) {
  const cobj = {
    id: comment.comment_id, // inject extra `id` to pass MEME validation checks
    collection_ref: comment.collection_ref,
    comment_id: comment.comment_id,
    comment_id_parent: comment.comment_id_parent,
    comment_id_previous: comment.comment_id_previous,
    comment_type: comment.comment_type,
    comment_createtime: comment.comment_createtime,
    comment_modifytime: comment.comment_modifytime,
    comment_isMarkedDeleted: comment.comment_isMarkedDeleted,
    commenter_id: comment.commenter_id,
    commenter_text: comment.commenter_text
  };
  const uid = MOD.GetCurrentUserId();
  COMMENT.UpdateComment(cobj, uid);
}

function m_UpdatePermissions(data) {
  UDATA.NetCall('SRV_GET_EDIT_STATUS').then(data => {
    // disable comment button if someone is editing a comment
    UDATA.LocalCall('COMMENT_UPDATE_PERMISSIONS', data);
  });
}
// /// API METHODS ///////////////////////////////////////////////////////////////
// /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// CONSTANTS
MOD.VIEWMODE = {
  EDIT: 'edit',
  VIEW: 'view'
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// Collection Reference Generators
/// e.g. converts node id to "n32"
MOD.GetNodeCREF = nodeId => `n${nodeId}`;
MOD.GetEdgeCREF = edgeId => `e${edgeId}`;
MOD.GetProjectCREF = projectId => `p${projectId}`;

/// deconstructs "n32" into {type: "n", id: 32}
MOD.DeconstructCref = cref => {
  const type = cref.substring(0, 1);
  const id = cref.substring(1);
  return { type, id };
}

/**
 * Generate a human friendly label based on the cref (e.g. `n21`, `e4`)
* e.g. "n32" becomes {typeLabel "Node", sourceLabel: "32"}
* @param {string} cref
 * @returns { typeLabel, sourceLabel } sourceLabel is undefined if the source has been deleted
 */
MOD.GetCREFSourceLabel = cref => {
  const { type, id } = MOD.DeconstructCref(cref);
  let typeLabel;
  let node, edge, nodes, sourceNode, targetNode;
  let sourceLabel; // undefined if not found
  switch (type) {
    case 'n':
      typeLabel = 'Node';
      node = STATE.State('NCDATA').nodes.find(n => n.id === Number(id));
      if (!node) break; // node might be missing if comment references a node that was removed
      if (node) sourceLabel = node.label;
      break;
    case 'e':
      typeLabel = 'Edge';
      edge = STATE.State('NCDATA').edges.find(e => e.id === Number(id));
      if (!edge) break; // edge might be missing if the comment references an edge that was removed
      nodes = STATE.State('NCDATA').nodes;
      sourceNode = nodes.find(n => n.id === Number(edge.source));
      targetNode = nodes.find(n => n.id === Number(edge.target));
      if (edge && sourceNode && targetNode)
        sourceLabel = `${sourceNode.label}${ARROW_RIGHT}${targetNode.label}`;
      break;
    case 'p':
      typeLabel = 'Project';
      sourceLabel = id;
      break;
  }
  return { typeLabel, sourceLabel };
};

/// Open the object that the comment refers to
/// e.g. in Net.Create it's a node or edge object
MOD.OpenReferent = cref => {
  const { type, id } = MOD.DeconstructCref(cref);
  let edge;
  switch (type) {
    case 'n':
      UDATA.LocalCall('SOURCE_SELECT', { nodeIDs: [parseInt(id)] });
      break;
    case 'e':
      edge = STATE.State('NCDATA').edges.find(e => e.id === Number(id));
      UDATA.LocalCall('SOURCE_SELECT', { nodeIDs: [edge.source] }).then(() => {
        UDATA.LocalCall('EDGE_SELECT', { edgeId: edge.id });
      });
      break;
    case 'p':
      // do something?
      break;
  }
};

/// Open comment using a comment id
MOD.OpenComment = (cref, cid) => {
  const { type, id } = MOD.DeconstructCref(cref);
  let edge;
  switch (type) {
    case 'n':
      UDATA.LocalCall('SOURCE_SELECT', { nodeIDs: [parseInt(id)] }).then(() => {
        UDATA.LocalCall('COMMENT_SELECT', { cref }).then(() => {
          const commentEl = document.getElementById(cid);
          commentEl.scrollIntoView({ behavior: 'smooth' });
        });
      });
      break;
    case 'e':
      edge = STATE.State('NCDATA').edges.find(e => e.id === Number(id));
      UDATA.LocalCall('SOURCE_SELECT', { nodeIDs: [edge.source] }).then(() => {
        UDATA.LocalCall('EDGE_SELECT', { edgeId: edge.id }).then(() => {
          UDATA.LocalCall('COMMENT_SELECT', { cref }).then(() => {
            const commentEl = document.getElementById(cid);
            commentEl.scrollIntoView({ behavior: 'smooth' });
          });
        });
      });
      break;
    case 'p':
      // do something?
      break;
    default:
      console.error('Opening Unknown Comment Type', type, cref, cid);
      break;
  }
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// User Id
MOD.SetCurrentUserId = uid => UID = uid;
MOD.GetCurrentUserId = () => UID; // called by other comment classes
MOD.GetUserName = uid => {
  return COMMENT.GetUserName(uid);
};
MOD.IsAdmin = () => {
  // nc return SETTINGS.IsAdmin();
  return UR.IsAdminLoggedIn()
}

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// Comment Type
MOD.GetCommentTypes = () => {
  return COMMENT.GetCommentTypes();
};
MOD.GetCommentType = slug => {
  return COMMENT.GetCommentType(slug);
};
MOD.GetDefaultCommentType = () => {
  return COMMENT.GetDefaultCommentType();
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// Global Operations
MOD.MarkAllRead = () => {
  const uid = MOD.GetCurrentUserId();
  const crefs = COMMENT.GetCrefs();
  crefs.forEach(cref => {
    CMTDB.DBUpdateReadBy(cref, uid);
    COMMENT.MarkRead(cref, uid);
  });
  COMMENT.DeriveAllThreadedViewObjects(uid);
  m_SetAppStateCommentCollections();
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// Comment Collections
MOD.GetCommentCollection = uiref => {
  return COMMENT.GetCommentCollection(uiref);
};
/**
 * Marks a comment as read, and closes the component.
 * Called by NCCommentBtn when clicking "Close"
 * @param {Object} uiref comment button id
 * @param {Object} cref collection_ref
 * @param {Object} uid user id
 */
MOD.CloseCommentCollection = (uiref, cref, uid) => {
  if (!MOD.OKtoClose(cref)) {
    // Comment is still being edited, prevent close
    alert(
      'This comment is still being edited!  Please Save or Cancel before closing the comment.'
    );
    return;
  }
  // OK to close
  CMTDB.DBUpdateReadBy(cref, uid);
  COMMENT.CloseCommentCollection(uiref, cref, uid);
  m_SetAppStateCommentCollections();
};

MOD.GetCommentStats = () => {
  const uid = MOD.GetCurrentUserId();
  return COMMENT.GetCommentStats(uid);
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// Comment UI State
MOD.GetCommentUIState = uiref => {
  return COMMENT.GetCommentUIState(uiref);
};
/**
 *
 * @param {string} uiref
 * @param {TCommentOpenState} openState
 */
MOD.UpdateCommentUIState = (uiref, openState) => {
  COMMENT.UpdateCommentUIState(uiref, openState);
  m_SetAppStateCommentCollections();
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// Open Comments
MOD.GetOpenComments = cref => COMMENT.GetOpenComments(cref);

// /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// /// Editable Comments (comments being ddited)

MOD.OKtoClose = cref => {
  const cvobjs = MOD.GetThreadedViewObjects(cref);
  let isBeingEdited = false;
  cvobjs.forEach(cvobj => {
    if (COMMENT.GetCommentBeingEdited(cvobj.comment_id)) isBeingEdited = true;
  });
  return !isBeingEdited;
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// Threaded View Objects
MOD.GetThreadedViewObjects = (cref, uid) => {
  return COMMENT.GetThreadedViewObjects(cref, uid);
};
MOD.GetThreadedViewObjectsCount = (cref, uid) => {
  return COMMENT.GetThreadedViewObjectsCount(cref, uid);
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// Comment View Objects
MOD.GetCommentVObj = (cref, cid) => {
  return COMMENT.GetCommentVObj(cref, cid);
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// Comments
MOD.GetComment = cid => {
  return COMMENT.GetComment(cid);
}
MOD.GetUnreadRepliesToMe = uid => {
  return COMMENT.GetUnreadRepliesToMe(uid);
}
MOD.GetUnreadComments = () => {
  return COMMENT.GetUnreadComments();
};
/**
 *
 * @param {Object} cobj Comment Object
 */
MOD.AddComment = cobj => {
  // This just generates a new ID, but doesn't update the DB
  CMTDB.PromiseNewCommentID().then(newCommentID => {
    cobj.comment_id = newCommentID;
    COMMENT.AddComment(cobj); // creates a comment vobject
    m_SetAppStateCommentVObjs();
  });
};
/**
 * Update the ac/dc comments, then save it to the db
 * This will also broadcast COMMENT_UPDATE so other clients on the network
 * update the data to match the server.
 * @param {Object} cobj
 */
MOD.UpdateComment = cobj => {
  COMMENT.UpdateComment(cobj);
  CMTDB.DBUpdateComment(cobj);
  m_SetAppStateCommentVObjs();
};
/**
 * Removing a comment can affect multiple comments, so this is done
 * via a batch operation.  We queue up all of the comment changes
 * using the logic for removing/re-arranging the comments in
 * ac-comments/dc-comments, then write out the db updates. This way
 * the db updates can be blindly accomplished in a single operation.
 *
 * Removing is a two step process:
 * 1. Show confirmation dialog
 * 2. Execute the remova
 * @param {Object} parms
 * @param {string} parms.collection_ref
 * @param {string} parms.comment_id
 * @param {string} parms.uid
 * @param {boolean} parms.showCancelDialog
 * @param {function} cb CallBack
 */
MOD.RemoveComment = (parms, cb) => {
  let confirmMessage, okmessage, cancelmessage;
  if (parms.showCancelDialog) {
    // Are you sure you want to cancel?
    confirmMessage = `Are you sure you want to cancel editing this comment #${parms.comment_id}?`;
    okmessage = 'Cancel Editing and Delete';
    cancelmessage = 'Go Back to Editing';
  } else {
    // Are you sure you want to delete?
    parms.isAdmin = SETTINGS.IsAdmin();
    confirmMessage = parms.isAdmin
      ? `Are you sure you want to delete this comment #${parms.comment_id} and ALL related replies (admin only)?`
      : `Are you sure you want to delete this comment #${parms.comment_id}?`;
    okmessage = 'Delete';
    cancelmessage = "Don't Delete";
  }

  const CMTSTATUS = STATE.State('CMTSTATUS');
  CMTSTATUS.dialog = {
    isOpen: true,
    message: confirmMessage,
    okmessage,
    onOK: event => m_ExecuteRemoveComment(event, parms, cb),
    cancelmessage,
    onCancel: m_CloseRemoveCommentDialog
  };
  STATE.SetState('CMTSTATUS', CMTSTATUS);
};
/**
 * The db call is made AFTER ac/dc handles the removal and the logic of
 * relinking comments.  The db call is dumb, all the logic is in dc-comments.
 * @param {Object} event
 * @param {Object} parms
 * @param {Object} parms.collection_ref
 * @param {Object} parms.comment_id
 * @param {Object} parms.uid
 */
function m_ExecuteRemoveComment(event, parms, cb) {
  const queuedActions = COMMENT.RemoveComment(parms);
  CMTDB.DBRemoveComment(queuedActions);
  m_SetAppStateCommentVObjs();
  m_CloseRemoveCommentDialog();
  if (typeof cb === 'function') cb();
}
function m_CloseRemoveCommentDialog() {
  const CMTSTATUS = STATE.State('CMTSTATUS');
  CMTSTATUS.dialog = { isOpen: false };
  STATE.SetState('CMTSTATUS', CMTSTATUS);
}

/**
 * Requested when a node/edge is deleted
 * @param {string} cref
 */
MOD.RemoveAllCommentsForCref = cref => {
  const uid = MOD.GetCurrentUserId();
  const parms = { uid, collection_ref: cref };
  const queuedActions = COMMENT.RemoveAllCommentsForCref(parms);
  CMTDB.DBRemoveComment(queuedActions);
  m_SetAppStateCommentVObjs();
};

/// EVENT HANDLERS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * Respond to network COMMENTS_UPDATE Messages
 * Usually used after a comment deletion to handle a batch of comment updates
 * This can include
 *   * updates to existing comments (marked DELETE or re-linked to other removed comment)
 *   * removal of comment altogether
 * This a network call that is used to update local state for other browsers
 * (does not trigger another DB update)
 * @param {Object[]} dataArray
 */
MOD.HandleCOMMENTS_UPDATE = dataArray => {
  if (DBG) console.log('COMMENTS_UPDATE======================', dataArray);
  const updatedComments = [];
  const removedComments = [];
  const updatedCrefs = new Map();
  dataArray.forEach(data => {
    if (data.comment) {
      updatedComments.push(data.comment);
      updatedCrefs.set(data.comment.collection_ref, 'flag');
    }
    if (data.commentID) removedComments.push(data.commentID);
    if (data.collection_ref) updatedCrefs.set(data.collection_ref, 'flag');
  });
  const uid = MOD.GetCurrentUserId();
  COMMENT.HandleRemovedComments(removedComments, uid);
  COMMENT.HandleUpdatedComments(updatedComments, uid);

  const crefs = [...updatedCrefs.keys()];
  crefs.forEach(cref => COMMENT.DeriveThreadedViewObjects(cref, uid));

  // and broadcast a state change
  m_SetAppStateCommentCollections();
  m_SetAppStateCommentVObjs();
};
/**
 * Respond to COMMENT_UPDATE Messages from the network
 * After the server/db saves the new/updated comment, COMMENT_UPDATE is
 * broadcast across the network.  This a network call that is used to update
 * the local state to match the server's comments.
 * (does not trigger another DB update)
 * @param {Object} data
 * @param {Object} data.comment cobj
 */
MOD.HandleCOMMENT_UPDATE = data => {
  if (DBG) console.log('COMMENT_UPDATE======================', data);
  const { comment } = data;
  m_UpdateComment(comment);
  // and broadcast a state change
  m_SetAppStateCommentCollections();
  m_SetAppStateCommentVObjs();
};
MOD.HandleREADBY_UPDATE = data => {
  if (DBG) console.log('READBY_UPDATE======================');
  // Not used currently
  // Use this if we need to update READBY status from another user.
  // Since "read" status is only displayed for the current user,
  // we don't need to worry about "read" status updates from other users
  // across the network.
  //
  // The exception to this would be if we wanted to support a single user
  // logged in to multiple browsers.
};

/// DB CALLS //////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MOD.LockComment = comment_id => {
  console.log('%sLockComment.  Skipping DB operation for now.', 'color:yellow')
  return;
  UDATA.NetCall('SRV_DBLOCKCOMMENT', { commentID: comment_id }).then(
    () => {
      UDATA.NetCall('SRV_REQ_EDIT_LOCK', { editor: EDITORTYPE.COMMENT });
      UDATA.LocalCall('SELECTMGR_SET_MODE', { mode: 'comment_edit' });
    }
  );
}
MOD.UnlockComment = comment_id => {
  console.warn('UnlockComment.  Skipping DB operation for now.')
  UDATA.NetCall('SRV_DBUNLOCKCOMMENT', { commentID: comment_id }).then(() => {
    UDATA.NetCall('SRV_RELEASE_EDIT_LOCK', { editor: EDITORTYPE.COMMENT });
    UDATA.LocalCall('SELECTMGR_SET_MODE', { mode: 'normal' });
  });
}

/// EXPORT CLASS DEFINITION ///////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default MOD;
