/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  URCommentBtnAlias

  A display button that calls URCommentThreadMgr to open comments.
  It emulates the visual functionality of URCommentBtn but is not a parent
  of the URCommentThread and does not directly handle the opening and closing
  of URCommentThreads.  URCommentThreads are opened separately via
  URCommentThreadMgr.

  FUNCTIONALITY:
    URCommentBtnAlias does five things:
    1. Displays whether the comment thread is open (bordered) or closed (no border)
    2. Displays the number of comments in the thread
    3. Provides the position of the source component requesting the thread
    4. Requests URCommentThreadMgr to open the comment thread
    5. Requests URCommentThreadMgr to close the comment thread
    4. // REVIEW: isDisabled is not used -- where do we get that status forom?

  USE:

    <URCommentBtnAlias
      cref={collection_ref}
    />

  PROPS:
    * cref    -- collection reference (usu node id, edge id)


  NOTE unlike URCommentBtn, URCommentBtnAlias does not use the unique user
  interface id (uuiid) to differentiate comment buttons on EVLinks vs props.

  NOTE unlike Net.Create's URCommentVBtn, URCommentBtnAlias does manage state.


\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

import React, { useState, useEffect, useRef } from 'react';
import { SVG } from '@svgdotjs/svg.js';
import DEFAULTS from '../../../app-web/modules/defaults';
import './URComment.css';

import UR from '../../../system/ursys';
const STATE = require('../lib/client-state');
import CMTMGR from '../comment-mgr';
import { symbol } from 'prop-types';

const { SVGSYMBOLS } = DEFAULTS;

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PR = 'URCommentBtnAlias';

const UDATAOwner = 'URCommentBtnAlias';

/// REACT FUNCTIONAL COMPONENT ////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** URCommentBtnAlias
 *  @param {string} cref - Collection reference
 *  @returns {React.Component} - URCommentBtnAlias
 */
function URCommentBtnAlias({ cref }) {
  const commentIconRef = useRef(null);

  const [commentCount, setCommentCount] = useState(0);
  const [hasReadComments, setHasReadComments] = useState(false);
  const [hasUnreadComments, setHasUnreadComments] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  // REVIEW: isDisabled is not used -- where do we get that status forom?
  const [isDisabled, setIsDisabled] = useState(false);
  const [position, setPosition] = useState({ x: '300px', y: '120px' });

  const uid = CMTMGR.GetCurrentUserId();
  const draw = SVG();

  /** Component Effect - set up listeners on mount */
  useEffect(() => {
    STATE.OnStateChange(
      'COMMENTCOLLECTION',
      urstate_UpdateCommentCollection,
      UDATAOwner
    );
    window.addEventListener('resize', evt_OnResize);

    setPosition(c_GetCommentThreadPosition());

    draw.addTo(commentIconRef.current).size(32, 32);
    c_DrawCommentIcon();

    // clean up on unmount
    return () => {
      draw.clear();
      STATE.OffStateChange('COMMENTCOLLECTION', urstate_UpdateCommentCollection);
      window.removeEventListener('resize', evt_OnResize);
    };
  }, []);

  useEffect(() => {
    // draw SVG icon with any updates
    c_DrawCommentIcon();
  }, [commentCount, isOpen]);

  /// UR HANDLERS /////////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function urstate_UpdateCommentCollection(COMMENTCOLLECTION) {
    console.error('URCommentBtnAlias: COMMENTCOLLECTION', COMMENTCOLLECTION);
    const count = CMTMGR.GetThreadedViewObjectsCount(cref, uid);
    setCommentCount(count);

    const ccol = CMTMGR.GetCommentCollection(cref) || {};
    setHasReadComments(ccol.hasReadComments);
    setHasUnreadComments(ccol.hasUnreadComments);

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
  function c_DrawCommentIcon() {
    // REVIEW size MUST be defined
    console.log('update', commentCount, isOpen);
    draw.clear();

    let symbolName = 'commentUnread';
    if (hasReadComments) {
      if (isOpen) symbolName = 'commentReadSelected';
      else symbolName = 'commentRead';
    } else {
      // hasUnreadComments or no comments
      if (isOpen) symbolName = 'commentUnreadSelected';
      else symbolName = 'commentUnread';
    }
    console.log('...getting symbol namne', symbolName);
    draw.use(SVGSYMBOLS.get(symbolName)).transform({
      translate: [4, 0], // center within 32,32
      origin: 'top left', // seems to default to 'center' if not specified
      scale: 1.6
    });
  }
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

    // HACK temp fix
    if (!btn) {
      console.error(
        'URCommentBtnAlias.c_GetCommentThreadPosition: btn not found',
        cref
      );
      return { x: '300px', y: '120px' };
    }

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
    console.log('URCommentBtnAlias click', isDisabled);
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
  const ccol = CMTMGR.GetCommentCollection(cref) || {};

  let css = 'commentbtn ';
  if (hasUnreadComments) css += 'hasUnreadComments ';
  else if (hasReadComments) css += 'hasReadComments ';
  css += isOpen ? 'isOpen ' : '';

  const label = commentCount > 0 ? commentCount : '';

  return (
    <div id={cref} className={css} onClick={evt_OnClick}>
      {/* {CMTMGR.COMMENTICON} */}
      <div className="comment-count">{label}</div>
      <div ref={commentIconRef} />
    </div>
  );
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default URCommentBtnAlias;
