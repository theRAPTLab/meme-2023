/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  URCommentVBtn

  NOTE: This is a different implementation from Net.Create's.
        MEME's URCommentVBtn
        * uses props only for id (instead of ALL parameters)
        * id is `cref` (instead of `uiref)`
        * comment state is derived from global state objects (not props)

  A display button that calls URCommentThreadMgr to open comments.
  It emulates the visual functionality of URCommentBtn but is not a parent
  of the URCommentThread and does not directly handle the opening and closing
  of URCommentThreads.  URCommentThreads are opened separately via
  URCommentThreadMgr.

  FUNCTIONALITY:
    URCommentVBtn does five things:
    1. Displays whether the comment thread is open (bordered) or closed (no border)
    2. Displays the number of comments in the thread
    3. Provides the position of the source component requesting the thread
    4. Requests URCommentThreadMgr to open the comment thread
    5. Requests URCommentThreadMgr to close the comment thread
    4. // REVIEW: isDisabled is not used -- where do we get that status forom?

  USE:

    <URCommentVBtn
      cref={collection_ref}
    />

  PROPS:
    * cref    -- collection reference (usu node id, edge id)

  USED BY:
    * URCommentStatus > URCommentThreadMgr
    * Navbar
    * ELink

  NOTE unlike URCommentBtn, URCommentVBtn does not use the unique user
  interface id (uuiid) to differentiate comment buttons on EVLinks vs props.


\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

import React, { useState, useEffect, useRef } from 'react';
import { SVG } from '@svgdotjs/svg.js';
import DEFAULTS from '../../../app-web/modules/defaults';
import './URComment.css';

import UR from '../../../system/ursys';
const STATE = require('../lib/client-state');
import CMTMGR from '../comment-mgr';

const { SVGSYMBOLS } = DEFAULTS;

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PR = 'URCommentVBtn';

const UDATAOwner = 'URCommentVBtn';

/// REACT FUNCTIONAL COMPONENT ////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** URCommentVBtn
 *  @param {string} cref - Collection reference
 *  @returns {React.Component} - URCommentVBtn
 */
function URCommentVBtn({ cref }) {
  const svgRef = useRef(null);
  const drawRef = useRef(null);
  const [redraw, setRedraw] = useState(0);

  /// USEEFFECT ///////////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  useEffect(() => {
    // init svg
    const draw = SVG(svgRef.current);
    drawRef.current = draw;

    // Handlers
    // STATE.OnStateChange('COMMENTCOLLECTION', urstate_UpdateCollection, UDATAOwner);
    STATE.OnStateChange('COMMENTVOBJS', urstate_UpdateVObj, UDATAOwner);
    // window.addEventListener('resize', evt_OnResize);
    // clean up on unmount
    return () => {
      draw.clear();
      // STATE.OffStateChange('COMMENTCOLLECTION', urstate_UpdateCollection);
      STATE.OffStateChange('COMMENTVOBJS', urstate_UpdateVObj, UDATAOwner);
      // window.removeEventListener('resize', evt_OnResize);
    };
  }, []);

  /// UR HANDLERS /////////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function urstate_UpdateVObj(COMMENTVOBJS) {
    setRedraw(redraw => redraw + 1); // Trigger re-render
  }

  /// COMPONENT HELPER METHODS ////////////////////////////////////////////////
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
    if (isOpen) {
      // is currently open, so close it
      const uid = CMTMGR.GetCurrentUserId();
      CMTMGR.CloseCommentCollection(cref, cref, uid);
    } else {
      // is currently closed, so open it
      const position = c_GetCommentThreadPosition();
      UR.Publish('CTHREADMGR_THREAD_OPEN', { cref, position });
    }
  }
  /// COMPONENT RENDER ////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** URCommentVBtn displays:
   *  - the number of comments in the thread
   *  - the "read" status of all comments: unread (gold) or read (gray)
   *  - isOpen - click on the button to display threads in a new window
   */

  // read state and isOen state
  const ccol = CMTMGR.GetCommentCollection(cref) || {};
  const { hasReadComments, hasUnreadComments } = ccol;
  const uistate = CMTMGR.GetCommentUIState(cref);
  const isOpen = uistate ? uistate.isOpen : false;
  let css = 'commentbtn ';
  if (hasUnreadComments) css += 'hasUnreadComments ';
  else if (hasReadComments) css += 'hasReadComments ';
  css += isOpen ? 'isOpen ' : '';

  // label
  const uid = CMTMGR.GetCurrentUserId();
  const commentCount = CMTMGR.GetThreadedViewObjectsCount(cref, uid);
  const label = commentCount > 0 ? commentCount : '';

  // derive icon
  let symbolName = 'commentUnread';
  if (hasReadComments && !hasUnreadComments) {
    // it's possible to have both read and unread comments
    // if there's anything unread, we want to mark it unread
    if (isOpen) symbolName = 'commentReadSelected';
    else symbolName = 'commentRead';
  } else {
    // hasUnreadComments or no comments
    if (isOpen) symbolName = 'commentUnreadSelected';
    else symbolName = 'commentUnread';
  }

  // draw icon
  const draw = drawRef.current;
  if (draw) {
    // on init, `draw` is first empty, so make sure it exists before drawing
    draw.clear();
    draw.use(SVGSYMBOLS.get(symbolName)).transform({
      translate: [4, 0], // center within 32,32
      origin: 'top left', // seems to default to 'center' if not specified
      scale: 1.6
    });
  }

  return (
    <div id={cref} className={css} onClick={evt_OnClick}>
      <div className="comment-count">{label}</div>
      <svg ref={svgRef} width="32" height="32" />
    </div>
  );
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default URCommentVBtn;
