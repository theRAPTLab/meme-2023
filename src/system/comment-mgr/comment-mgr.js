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
      -- OnAddPropComment via `CMT_COLLECTION_SHOW`
      -- OnAddMechComment via `CMT_COLLECTION_SHOW`
  * EVLink -- via URCommentVBtn
  * VBadge -- VBadge.SVGStickyButton.onClick via `CMT_COLLECTION_SHOW`


\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

import React from 'react';

import UR from '../../system/ursys';
const STATE = require('./lib/client-state');
import SESSION from '../../system/common-session';
import DATAMAP from '../../system/common-datamap';
import DEFAULTS from '../../app-web/modules/defaults';
import ADM from '../../app-web/modules/data';
import DATA from '../../app-web/modules/data';

import CMTDB from './comment-db';
import * as COMMENT from './ac-comment.ts';
import PMCView from '../../app-web/modules/pmc-view.js';

const { CREF_PREFIX } = DEFAULTS;

// const { EDITORTYPE } = require('system/util/enum');
// const NCUI = require('./nc-ui');

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const PR = 'comment-mgr: ';

const CMTBTNOFFSET = 10;

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
// UR.Hook(__dirname, 'APP_READY', function (info) {
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

/// HELPER FUNCTIONS //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function m_SetAppStateCommentCollections() {
  const COMMENTCOLLECTION = COMMENT.GetCommentCollections();
  STATE.SetState('COMMENTCOLLECTION', COMMENTCOLLECTION);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_SetAppStateCommentVObjs() {
  const COMMENTVOBJS = COMMENT.GetCOMMENTVOBJS();
  console.log('COMMENTVOBJS', COMMENTVOBJS)
  STATE.SetState('COMMENTVOBJS', COMMENTVOBJS);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function InitCaps(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MOD.CREFLABELS = new Map();
MOD.CREFLABELS.set(CREF_PREFIX.PROJECT, 'Project');
MOD.CREFLABELS.set(CREF_PREFIX.EVLINK, 'Evidence Link');
MOD.CREFLABELS.set(CREF_PREFIX.ENTITY, InitCaps(DATAMAP.PMC_MODELTYPES.COMPONENT.label));
MOD.CREFLABELS.set(CREF_PREFIX.PROCESS, InitCaps(DATAMAP.PMC_MODELTYPES.MECHANISM.label));
MOD.CREFLABELS.set(CREF_PREFIX.OUTCOME, InitCaps(DATAMAP.PMC_MODELTYPES.OUTCOME.label));
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *
 * @param {*} type one of MOD.COMMENTTYPES
 * @param {*} id
 * @returns
 */
MOD.GetCREF = (type, id) => {
  if (CREF_PREFIX[type]) return `${CREF_PREFIX[type]}${id}`;
  throw new Error(`${PR}GetCREF: Invalid Comment Type ${type}`);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// deconstructs "n32" into {type: "n", id: 32}
MOD.DeconstructCREF = cref => {
  const type = String(cref).substring(0, 1);
  const id = String(cref).substring(1);
  return { type, id };
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Generate a human friendly label based on the cref (e.g. `n21`, `e4`)
* e.g. "n32" becomes {typeLabel "Node", sourceLabel: "32"}
* @param {string} cref
 * @returns { typeLabel, sourceLabel } sourceLabel is undefined if the source has been deleted
 */
MOD.GetCREFSourceLabel = cref => {
  const { type, id } = MOD.DeconstructCREF(cref);
  let typeLabel = MOD.CREFLABELS.get(type);
  let sourceLabel; // undefined if not found
  const REMOVED = 'removed';
  switch (type) {
    case 'v':
      const evlink = DATA.PMC_GetEvLinkByEvId(Number(id));
      sourceLabel = evlink ? evlink.numberLabel : REMOVED;
      break;
    case 'e':
      const entity = DATA.Prop(id);
      sourceLabel = entity ? entity.name : REMOVED;
      break;
    case 'o':
      const outcome = DATA.Prop(id);
      sourceLabel = outcome ? outcome.name : REMOVED;
      break;
    case 'm':
      const path = DATA.MechPathById(Number(id));
      const mech = DATA.Mech(path);
      sourceLabel = mech ? mech.name : REMOVED;
      break;
    case 'p':
    default:
      // REVIEW: Project is 9999, does not use 'p' currently.  Should it?
      typeLabel = MOD.CREFLABELS.get(CREF_PREFIX.PROJECT);
      sourceLabel = ADM.GetModelTitle();
      break;
  }
  return { typeLabel, sourceLabel };
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Returns the position for the comment button
 * Adjusting for window position is done via GetCommentCollectionPosition
 */
MOD.GetCommentBtnPosition = cref => {
  const btn = document.getElementById(cref);
  if (!btn) throw new Error(`${PR}GetCommentCollectionPosition: Button not found ${cref}`);
  const bbox = btn.getBoundingClientRect();
  return { x: bbox.left, y: bbox.top };
}
/**
 * Returns the comment window position for the comment button
 * shifting the window to the left if it's too close to the edge of the screen.
 * or shifting it up if it's too close to the bottom of the screen.
 * x,y is the position of the comment button, offsets are then caclulated
 */
MOD.GetCommentCollectionPosition = ({ x, y }) => {
  const windowWidth = Math.min(screen.width, window.innerWidth);
  const windowHeight = Math.min(screen.height, window.innerHeight);
  let newX;
  if (windowWidth - x < 500) {
    newX = x - 410;
  } else {
    newX = x + CMTBTNOFFSET * 2;
  }
  let newY = y + window.scrollY;
  if (windowHeight - y < 150) {
    newY = y - 150;
  } else {
    newY = y - CMTBTNOFFSET;
  }
  return { x: newX, y: newY };
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// Open the object that the comment refers to
/// e.g. in Net.Create it's a node or edge object
MOD.OpenReferent = cref => {
  const { type, id } = MOD.DeconstructCREF(cref);
  switch (type) {
    case 'p': // project
      // technically, clicking the project name shouldn't open the coment, but
      // there's no other action possible
      MOD.OpenCommentCollectionByCref('projectcmt');
      break;
    case 'v': // evidence link
      const evlink = DATA.PMC_GetEvLinkByEvId(Number(id));
      UR.Publish('SHOW_EVIDENCE_LINK', { evId: evlink.id, rsrcId: evlink.rsrcId });
      break;
    case 'm': // mech
      const path = DATA.MechPathById(Number(id));
      const vmech = DATA.VM_VMech(path);
      DATA.VM_DeselectAllMechs();
      DATA.VM_SelectOneMech(vmech);
      UR.Publish('SVG_PANZOOMBBOX_SET', {
        bbox: vmech.gRoot.bbox(),
        cb: () => { } // no callback needed
      });
      return vmech;
    case 'e': // entity
    case 'o': // outcome
    default:
      const vprop = DATA.VM_VProp(id);
      DATA.VM_DeselectAllProps();
      DATA.VM_SelectProp(vprop);
      UR.Publish('SVG_PANZOOMBBOX_SET', {
        bbox: vprop.gRoot.bbox(),
        cb: () => { } // no callback needed
      });
      return vprop;
  }
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// Open comment inside a collection using a comment id
MOD.OpenComment = (cref, cid) => {
  const { type, id } = MOD.DeconstructCREF(cref);
  let parms;
  MOD.CloseAllCommentCollectionsWithoutMarkingRead()
  switch (type) {
    case 'p': // project
      MOD.OpenCommentCollectionByCref('projectcmt');
      break;
    case 'v': // evidence link
      const evlink = DATA.PMC_GetEvLinkByEvId(Number(id));
      UR.Publish('SHOW_EVIDENCE_LINK', { evId: evlink.id, rsrcId: evlink.rsrcId });
      MOD.OpenCommentCollectionByCref(cref);
      break;
    case 'm': // mech
      const path = DATA.MechPathById(Number(id));
      const vmech = DATA.VM_VMech(path);
      DATA.VM_DeselectAllMechs();
      DATA.VM_SelectOneMech(vmech);
      parms = {
        bbox: vmech.gRoot.bbox(),
        cb: result => {
          setTimeout(() => {
            const path = DATA.MechPathById(Number(id));
            const vmech = DATA.VM_VMech(path);
            const { cx, cy } = vmech.gRoot.bbox(); // vmech is centered
            const cmtbtnBBox = vmech.vBadge.gStickyButtons.bbox();
            // the comment button xy is offset from the mech origin
            // for some reason the comment button x doesn't account for
            // the width of the label
            const btnPosition = PMCView.SVGtoScreen( // cx, cy);
              cx + vmech.horizText.length() / 2 + cmtbtnBBox.w, cy
            );
            MOD.OpenCommentCollection(cref, btnPosition);
          }, 500);
        }
      }
      UR.Publish('SVG_PANZOOMBBOX_SET', parms);
      break;
    case 'e': // entity
    case 'o': // outcome
    default:
      const vprop = DATA.VM_VProp(id);
      DATA.VM_DeselectAllProps();
      DATA.VM_SelectProp(vprop);
      parms = {
        bbox: vprop.vBadge.gBadges.bbox(),
        cb: result => {
          setTimeout(() => {
            const vprop = DATA.VM_VProp(id);
            const { x, y } = vprop.vBadge.gStickyButtons.bbox();
            const btnPosition = PMCView.SVGtoScreen(x, y);
            MOD.OpenCommentCollection(cref, btnPosition);
          }, 500);
        }
      }
      UR.Publish('SVG_PANZOOMBBOX_SET', parms);
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
  return SESSION.IsTeacher();
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

/// COMMENT COLLECTIONS ///////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*
  The requests come from three sources:
    * Evidence Links-- via URCommentVBtn
    * SVG Props-- in class- vbadge via UR.Publish(`CMT_COLLECTION_SHOW`) calls
    * SVG Mechanisms-- in class- vbadge via UR.Publish(`CMT_COLLECTION_SHOW`) calls


  URCommentVBtn is a UI component that passes clicks
  to URCommentCollectionMgr via UR.Publish(`CMT_COLLECTION_SHOW`) calls

  URCommentSVGBtn is a purely visual component that renders SVG buttons
  as symbols and displays the comment count and selection status.
  It pases the click events to URCommentVBtn.

  MAP
    * URCommentStatus
      > URCommentCollectionMgr
        > URCommentThread
          > URCommentVBtn
            > URCommentSVGBtn


  HOW IT WORKS
  When an EVLink, SVG prop, or SVG mechanism clicks on the
  URCommentVBtn, URCommentCollectionMgr will:
  * Add the requested Thread to the URCommentCollectionMgr
  * Open the URCommentThread
  * When the URCommentThread is closed, it will be removed from the URCommentCollectionMgr

*/
MOD.OpenCommentCollection = (cref, position) => {
  // Validate
  if (cref === undefined)
    throw new Error(
      `comment-mgr.OpenCommentCollection: missing cref data ${JSON.stringify(cref)}`
    );
  if (
    position === undefined ||
    position.x === undefined ||
    position.y === undefined
  )
    throw new Error(
      `comment-mgr.OpenCommentCollection: missing position data ${JSON.stringify(position)}`
    );
  position.x = parseInt(position.x); // handle net call data
  position.y = parseInt(position.y);
  // 0. If the comment is already open, do nothing
  const openComments = MOD.GetOpenComments(cref);
  if (openComments) {
    MOD.CloseCommentCollection(cref, cref, MOD.GetCurrentUserId());
    return; // already open, close it
  }
  // 1. Position the window to the right of the click
  const collectionPosition = MOD.GetCommentCollectionPosition(position);

  // 2. Update the state
  MOD.UpdateCommentUIState(cref, { cref, isOpen: true });
  // 3. Open the collection in the collection manager
  UR.Publish('CMT_COLLECTION_SHOW', { cref, position: collectionPosition });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * Called by URCommentVBtn
 * NOTE: This does not work for vBadge buttons.
 * vBadge calls OpenCommentCollection directly.
 * VBtns need an extra offset (Unliock vBadges)
 * @param {string} cref
 */
MOD.OpenCommentCollectionByCref = cref => {
  const projectCmtPosition = MOD.GetCommentBtnPosition(cref);
  MOD.OpenCommentCollection(cref,
    {
      x: projectCmtPosition.x + CMTBTNOFFSET,
      y: projectCmtPosition.y + CMTBTNOFFSET
    });
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MOD.GetCommentCollection = uiref => {
  return COMMENT.GetCommentCollection(uiref);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Closes the comment collection without marking it as read.
 * Called by OpenCommentCollection if a comment is already open.
 * @param {Object} uiref comment button id (note kept for Net.Create compatibility)
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
  UDATA.LocalCall('CMT_COLLECTION_HIDE', { cref });
  COMMENT.CloseCommentCollection(uiref, cref, uid);
  m_SetAppStateCommentCollections();
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Marks a comment as read, and closes the component.
 * Called by NCCommentBtn when clicking "Close"
 * @param {Object} uiref comment button id (note kept for Net.Create compatibility)
 * @param {Object} cref collection_ref
 * @param {Object} uid user id
 */
MOD.CloseCommentCollectionAndMarkRead = (uiref, cref, uid) => {
  if (!MOD.OKtoClose(cref)) {
    // Comment is still being edited, prevent close
    alert(
      'This comment is still being edited!  Please Save or Cancel before closing the comment.'
    );
    return;
  }
  // OK to close
  UDATA.LocalCall('CMT_COLLECTION_HIDE', { cref });
  // Update the readby
  CMTDB.DBUpdateReadBy(cref, uid);
  COMMENT.CloseCommentCollection(uiref, cref, uid);
  m_SetAppStateCommentCollections();
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Closes all comment collections without marking them as read.
 * Used by comment status when user clicks on status updates to display
 * updated comments.
 * @param {*} uid
 */
MOD.CloseAllCommentCollectionsWithoutMarkingRead = () => {
  const uid = MOD.GetCurrentUserId();
  UDATA.LocalCall('CMT_COLLECTION_HIDE_ALL');
  COMMENT.CloseAllCommentCollections(uid);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MOD.GetCommentCollectionCount = cref => {
  const ccol = COMMENT.GetCommentCollection(cref);
  return ccol ? ccol.commentCount : '';
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MOD.GetCommentStats = () => {
  const uid = MOD.GetCurrentUserId();
  return COMMENT.GetCommentStats(uid);
};

/// COMMENT UI STATE //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MOD.GetCommentUIState = uiref => {
  return COMMENT.GetCommentUIState(uiref);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *
 * @param {Object} cobj Comment Object
 */
MOD.AddComment = cobj => {
  // This just generates a new ID, but doesn't update the DB
  // The id will be created in MOD.UpdateComment's callback.
  CMTDB.PromiseNewCommentID().then(newCommentID => {
    cobj.comment_id = newCommentID;
    COMMENT.AddComment(cobj); // creates a comment vobject
    m_SetAppStateCommentVObjs();
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Update the ac/dc comments, then save it to the db
 * This will also broadcast COMMENT_UPDATE so other clients on the network
 * update the data to match the server.
 * @param {Object} cobj
 */
MOD.UpdateComment = cobj => {
  // Use callback to update the comment id after db creates a new id
  CMTDB.DBUpdateComment(cobj, data => {
    // updated data id is going to be in data.pmcData.urcomments[0].id
    if (!data["pmcData.urcomments"] || data["pmcData.urcomments"].length < 1) {
      throw new Error(`comment-mgr: UpdateComment: No ID returned from DB. cobj: ${JSON.stringify(cobj)} data: ${JSON.stringify(data)}`);
    }
    cobj.id = data["pmcData.urcomments"][0].id;
    COMMENT.UpdateComment(cobj);
    m_SetAppStateCommentVObjs();
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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
 * @param {string} parms.id
 * @param {string} parms.uid
 * @param {boolean} parms.isAdmin
 * @param {boolean} parms.showCancelDialog
 */
MOD.RemoveComment = parms => {
  let confirmMessage, okmessage, cancelmessage;
  if (parms.showCancelDialog) {
    // Are you sure you want to cancel?
    confirmMessage = `Are you sure you want to cancel editing this comment #${parms.id}?`;
    okmessage = 'Cancel Editing and Delete';
    cancelmessage = 'Go Back to Editing';
  } else {
    // Are you sure you want to delete?
    parms.isAdmin = MOD.IsAdmin();
    confirmMessage = parms.isAdmin
      ? `Are you sure you want to delete this comment #${parms.id} and ALL related replies (admin only)?`
      : `Are you sure you want to delete this comment #${parms.id}?`;
    okmessage = 'Delete';
    cancelmessage = "Don't Delete";
  }

  const CMTSTATUS = STATE.State('CMTSTATUS');
  CMTSTATUS.dialog = {
    isOpen: true,
    message: confirmMessage,
    okmessage,
    onOK: event => m_ExecuteRemoveComment(event, parms),
    cancelmessage,
    onCancel: m_CloseRemoveCommentDialog
  };
  STATE.SetState('CMTSTATUS', CMTSTATUS);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * The db call is made AFTER ac/dc handles the removal and the logic of
 * relinking comments.  The db call is dumb, all the logic is in dc-comments.
 * @param {Object} event
 * @param {Object} parms
 * @param {Object} parms.collection_ref
 * @param {Object} parms.comment_id
 * @param {Object} parms.uid
 */
function m_ExecuteRemoveComment(event, parms) {
  const queuedActions = COMMENT.RemoveComment(parms);
  CMTDB.DBRemoveComment(queuedActions, rdata => {
    // update state after db finishes!
    m_SetAppStateCommentVObjs();
    m_CloseRemoveCommentDialog();
  });
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_CloseRemoveCommentDialog() {
  const CMTSTATUS = STATE.State('CMTSTATUS');
  CMTSTATUS.dialog = { isOpen: false };
  STATE.SetState('CMTSTATUS', CMTSTATUS);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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
  if (comment) {
    m_UpdateComment(comment);
  } else {
    // syncAdd and syncUpdate will pass the updated comment
    // but syncRemove does NOT, so allow for no comment
    // console.log('comment-mgr: HandleCOMMENT_UPDATE: No comment data:', data);
  }
  // and broadcast a state change
  m_SetAppStateCommentCollections();
  m_SetAppStateCommentVObjs();
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MOD.UnlockComment = comment_id => {
  console.warn('UnlockComment.  Skipping DB operation for now.')
  return;
  UDATA.NetCall('SRV_DBUNLOCKCOMMENT', { commentID: comment_id }).then(() => {
    UDATA.NetCall('SRV_RELEASE_EDIT_LOCK', { editor: EDITORTYPE.COMMENT });
    UDATA.LocalCall('SELECTMGR_SET_MODE', { mode: 'normal' });
  });
}

/// EXPORT CLASS DEFINITION ///////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default MOD;
