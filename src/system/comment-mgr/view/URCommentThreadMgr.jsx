/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  URCommentThreadMgr

  URCommentThreadMgr handles the opening and closing of URCommentThreads
  being requested from three sources:
  * Evidence Links -- via URCOmmentBtnAlias
  * SVG props      -- in class-vbadge via UR.Publish(`CMTHOST_THREAD_OPEN`) calls
  * SVG Mechanisms -- in class-vbadge via UR.Publish(`CMTHOST_THREAD_OPEN`) calls

  URCommentBtnAlias is a visual component that passes clicks
  to URCommentThreadMgr via UR.Publish(`CMTHOST_THREAD_OPEN`) calls


  HOW IT WORKS
  When an EVLink, SVG prop, or SVG mechanism clicks on the
  URCommentBtnAlias, URCommentThreadMgr will:
  * Add the requested Thread to the URCommentThreadMgr
  * Open the URCommentThread
  * When the URCommentThread is closed, it will be removed from the URCommentThreadMgr

  UR MESSAGES
  *  CMTHOST_THREAD_OPEN {cref, position}
  *  CMTHOST_THREAD_CLOSE {cref}
  *  CMTHOST_THREAD_CLOSE_ALL


  NOTES
  * Differences with URCommentBtn

  USE:

    <URCommentThreadMgr message={message} handleMessageUpdate/>


  HISTORY
  Originally, URCommentBtn were designed to handle comment opening
  requests from two types componets: nodes/edges and
  NodeTables/EdgeTables in NetCreate.  Since the requests could come
  from different components, we had to keep track of which component
  was requesting the opening, so they could close the corresponding
  comment.  In order to do this, we used a reference that combined
  the comment id reference (collection reference, or cref)
  with a unique user interface id (uuiid).

  MEME doesn't need that so we simply use `cref` as the
  comment id.

  That simplifies the comment references, but there was a second
  challenge:

  Since the SVG props and mechanisms are NOT react components, we
  cannot use URCommentBtn to manage opening and editing comments.
  Moreover, URCommentBtns opened inside Evidence Links are embedded
  inside the Evidence Library and comments created inside the library
  end up hidden due to layers of overflow divs.

  To get around this, URCommentThreadMgr essentially replaces the
  functionality of URCommentBtn with three pieces, acting as a middle
  man and breaking out the...
  * visual display    -- URCommentBtnAlias
  * UI click requests -- UR messages
  * thread opening / closing requests -- URCommentThreadMgr
  ...into different functions handled by different components.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

import React, { useState, useEffect, useCallback } from 'react';

import UR from '../../../system/ursys';
const STATE = require('../lib/client-state');

import CMTMGR from '../comment-mgr';
import URCommentThread from '../../../system/comment-mgr/view/URCommentThread';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// Debug Flags
const DBG = true;
const PR = 'URCommentThreadMgr';

/// REACT FUNCTIONAL COMPONENT ////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function URCommentThreadMgr(props) {
  const uid = CMTMGR.GetCurrentUserId();
  const [cmtBtns, setCmtBtns] = useState([]);
  const [dummy, setDummy] = useState(0); // Dummy state variable to force update

  /** Component Effect - register listeners on mount */
  useEffect(() => {
    UR.Subscribe('CMTHOST_THREAD_OPEN', urmsg_THREAD_OPEN);
    UR.Subscribe('CMTHOST_THREAD_CLOSE', urmsg_THREAD_CLOSE);
    UR.Subscribe('CMTHOST_THREAD_CLOSE_ALL', urmsg_THREAD_CLOSE_ALL);

    return () => {
      UR.Unsubscribe('CMTHOST_THREAD_OPEN', urmsg_THREAD_OPEN);
      UR.Unsubscribe('CMTHOST_THREAD_CLOSE', urmsg_THREAD_CLOSE);
      UR.Unsubscribe('CMTHOST_THREAD_CLOSE_ALL', urmsg_THREAD_CLOSE_ALL);
    };
  }, []);


  /// COMPONENT HELPER METHODS ////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  /// UR HANDLERS /////////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /**
   * Handle CMTHOST_THREAD_OPEN message
   * 1. Register the button, and
   * 2. Open the URCommentBtn
   * @param {Object} data
   * @param {string} data.cref - Collection reference
   * @param {Object} data.position - Position of the button
   */
  function urmsg_THREAD_OPEN(data) {
    // Validate
    if (
      data.position === undefined ||
      data.position.x === undefined ||
      data.position.y === undefined
    )
      throw new Error(
        `URCommentThreadMgr: urmsg_THREAD_OPEN: missing position data ${data}`
      );

    // 1. Register the button
    setCmtBtns(prevBtns => [...prevBtns, data]);
    // 2. Open the URCommentThread
    CMTMGR.UpdateCommentUIState(data.cref, { cref: data.cref, isOpen: true });
  }

  function urmsg_THREAD_CLOSE(data) {
    if (DBG) console.log('urmsg_THREAD_CLOSE', data);
    setCmtBtns(prevBtns => prevBtns.filter(btn => btn.cref !== data.cref));
  }

  function urmsg_THREAD_CLOSE_ALL(data) {
    if (DBG) console.log('urmsg_THREAD_CLOSE_ALL', data);
    setCmtBtns([]);
  }

  return (
    <div className="URCommentThreadMgr">
      URCommentThreadMgrs:
      {cmtBtns.map(btn => (
        <URCommentThread
          key={btn.cref}
          uiref={btn.cref}
          cref={btn.cref}
          uid={uid}
          x={btn.position.x}
          y={btn.position.y}
        />
      ))}
    </div>
  );
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default URCommentThreadMgr;
