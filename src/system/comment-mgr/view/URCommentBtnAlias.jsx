/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  URCommentBtnAlias

  A display button that calls URCommentThreadMgr to open comments.
  It emulates the visual functionality of URCommentBtn but does not handle
  the opening and closing of URCommentThreads.  URCommentThreads
  are opened separately via URCommentThreadMgr.

  FUNCTIONALITY:
    URCommentBtnAlias does five things:
    1. Displays whether the comment thread is open (bordered) or closed (no border)
    2. Displays the number of comments in the thread
    3. Provides the position of the source component requesting the thread
    4. Requests URCommentThreadMgr to open the comment thread
    5. Requests URCommentThreadMgr to close the comment thread

  USE:

    <URCommentBtnAlias
      cref={collection_ref}
    />

  PROPS:
    * cref    -- collection reference (usu node id, edge id)


  NOTE unlike URCommentBtn, URCommentBtnAlias does not use the unique user
  interface id (uuiid) to differentiate comment buttons on EVLinks vs props.


\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

import React, { useState, useEffect } from 'react';
import './URComment.css';

import UR from '../../../system/ursys';
const STATE = require('../lib/client-state');

import CMTMGR from '../comment-mgr';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PR = 'URCommentBtnAlias';

/// REACT FUNCTIONAL COMPONENT ////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** URCommentBtnAlias
 *  @param {string} cref - Collection reference
 *  @returns {React.Component} - URCommentBtnAlias
 */
function URCommentBtnAlias({ cref }) {
  const uid = CMTMGR.GetCurrentUserId();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: '300px', y: '120px' });

  /** Component Effect - set up listeners on mount */
  useEffect(() => {
    STATE.OnStateChange('COMMENTCOLLECTION', urstate_UpdateCommentCollection);
    window.addEventListener('resize', evt_OnResize);

    setPosition(c_GetCommentThreadPosition());

    return () => {
      STATE.OffStateChange('COMMENTCOLLECTION', urstate_UpdateCommentCollection);
      window.removeEventListener('resize', evt_OnResize);
    };
  }, []);

  /// UR HANDLERS /////////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function urstate_UpdateCommentCollection(COMMENTCOLLECTION) {
    const uistate = CMTMGR.GetCommentUIState(cref);
    const openuiref = CMTMGR.GetOpenComments(cref);
    if (uistate) {
      if (openuiref !== cref) {
        // close this comment if someone else is trying to open the same comment
        setIsOpen(false);
      } else {
        setIsOpen(uistate.isOpen);
      }
    }
  }

  /// COMPONENT HELPER METHODS ////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function c_OpenComment(isOpen) {
    const position = c_GetCommentThreadPosition();
    setIsOpen(isOpen);
    setPosition(position);
    UR.Publish('CTHREADMGR_THREAD_OPEN', { cref, position });
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function c_GetCommentThreadPosition() {
    const btn = document.getElementById(cref);
    const cmtbtnx = btn.getBoundingClientRect().left;
    const windowWidth = Math.min(screen.width, window.innerWidth);
    let x;
    if (windowWidth - cmtbtnx < 500) {
      x = cmtbtnx - 405;
    } else {
      x = cmtbtnx + 35;
    }
    const y = btn.getBoundingClientRect().top + window.scrollY;
    return { x, y };
  }

  /// COMPONENT UI HANDLERS ///////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** handle URCommentBtn click, which opens and closes the URCommentThread */
  function evt_OnClick(event) {
    event.stopPropagation();
    if (!isDisabled) {
      const updatedIsOpen = !isOpen;
      c_OpenComment(updatedIsOpen);
    }
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** handles window resize, which will adjust the URCommentThread window
   *  position relative to the resized location of the URCommentBtn
   */
  function evt_OnResize() {
    const position = c_GetCommentThreadPosition();
    setPosition(position);
  }

  /// COMPONENT RENDER ////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** URCommentBtnAlias displays:
   *  - the number of comments in the thread
   *  - the "read" status of all comments: unread (gold) or read (gray)
   *  - isOpen - click on the button to display threads in a new window
   */
  const count = CMTMGR.GetThreadedViewObjectsCount(cref, uid);
  const ccol = CMTMGR.GetCommentCollection(cref) || {};

  let css = 'commentbtn ';
  if (ccol.hasUnreadComments) css += 'hasUnreadComments ';
  else if (ccol.hasReadComments) css += 'hasReadComments ';
  css += isOpen ? 'isOpen ' : '';

  const label = count > 0 ? count : '';

  return (
    <div id={cref}>
      <div className={css} onClick={evt_OnClick}>
        {CMTMGR.COMMENTICON}
        <div className="comment-count">{label}</div>
      </div>
    </div>
  );
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default URCommentBtnAlias;
