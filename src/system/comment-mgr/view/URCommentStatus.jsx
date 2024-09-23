/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  URCommentStatus displays a summary of new comments being added across the
  network in the nav bar.  There are two views:
  - uiIsExpanded = false: A count of the most recent read and unread comments
  - uiIsExpanded = true: The full list of the the most recent comments
  In addition, there are two commands:
  - "Mark All Read" will mark all of the messages in the status list "read"
  - Close will close the status list

  The comment status messages remain visible through the whole user session.
  Marking all messages as "read" will clear the status list.

  USE:

    <URCommentStatus message={message} handleMessageUpdate/>

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

import React, { useState, useEffect, useCallback } from 'react';
import UR from '../../../system/ursys';
const STATE = require('../lib/client-state');
import CMTMGR from '../comment-mgr';
import URCommentThreadMgr from '../../../system/comment-mgr/view/URCommentThreadMgr';
import URCommentSVGBtn from '../../../system/comment-mgr/view/URCommentSVGBtn';
import URDialog from './URDialog';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// Initialize UNISYS DATA LINK for functional react component
const UDATAOwner = 'URCommentStatus';
const UDATA = UR.NewConnection(UDATAOwner);

/// Debug Flags
const DBG = false;
const PR = 'URCommentStatus';
/// Animation Timers
let AppearTimer;
let DisappearTimer;
let ResetTimer;

/// REACT FUNCTIONAL COMPONENT ////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** URCommentStatus renders a summary of new comments in the nav bar.
 * @param {*} props currently not used
 * @returns
 */
function URCommentStatus(props) {
  const uid = CMTMGR.GetCurrentUserId();

  const [CMTSTATUS, setCMTSTATUS] = useState({});

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [activeCSS, setActiveCSS] = useState('');
  const [uiIsExpanded, setUiIsExpanded] = useState(false);
  const [dummy, setDummy] = useState(0); // Dummy state variable to force update

  /** Component Effect - register listeners on mount */
  useEffect(() => {
    STATE.OnStateChange('CMTSTATUS', state_CMTSTATUS, UDATAOwner);
    STATE.OnStateChange('COMMENTCOLLECTION', redraw, UDATAOwner); // respond to close
    UR.Subscribe('COMMENTS_UPDATE', redraw);
    UR.Subscribe('COMMENT_UPDATE', urmsg_COMMENT_UPDATE);

    return () => {
      STATE.OffStateChange('CMTSTATUS', state_CMTSTATUS, UDATAOwner);
      STATE.OffStateChange('COMMENTCOLLECTION', redraw, UDATAOwner); // respond to close
      UR.Unsubscribe('COMMENTS_UPDATE', redraw);
      UR.Unsubscribe('COMMENT_UPDATE', urmsg_COMMENT_UPDATE);
    };
  }, []);

  /// UR HANDLERS /////////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function state_CMTSTATUS(CMTSTATUS) {
    setCMTSTATUS(CMTSTATUS);
  }

  /** force re-render after COMMENTS_UPDATE from a new comment another user */
  function redraw() {
    // This is necessary to force a re-render of the comment summaries
    // when the comment collection changes on the net
    setDummy(dummy => dummy + 1); // Trigger re-render
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** animate the addition of new comment messages after a new comment from another user */
  function urmsg_COMMENT_UPDATE(data) {
    const { comment, uaddr } = data;

    const my_uaddr = UR.SocketUADDR();
    const isNotMe = my_uaddr !== uaddr;

    if (comment && comment.commenter_text.length > 0) {
      let source;
      if (comment.comment_id_parent) {
        source = `${comment.commenter_id} replied: `;
      } else {
        source = `${comment.commenter_id} commented: `;
      }
      comment.commenter_id = source;
      const message = c_GetCommentItemJSX(comment);
      setMessages(prevMessages => [...prevMessages, message]);

      // Only show status update if it's coming from another
      if (isNotMe) {
        clearTimeout(AppearTimer);
        clearTimeout(DisappearTimer);
        clearTimeout(ResetTimer);
        // clear it first, then appear (so that each new comment triggers the animation)
        setMessage(message);
        setActiveCSS('');
        AppearTimer = setTimeout(() => {
          setActiveCSS('appear');
        }, 250);
        DisappearTimer = setTimeout(() => {
          setActiveCSS('disappear');
        }, 8000);
        ResetTimer = setTimeout(() => {
          setMessage('');
          setActiveCSS('');
        }, 13000); // should equal the `disappear` ease-in period + 'disappear' timeout
      } else {
        setDummy(dummy => dummy + 1); // force update to update counts
      }
    }
  }

  /// COMPONENT UI HANDLERS ///////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function evt_ExpandPanel() {
    clearTimeout(DisappearTimer);
    clearTimeout(ResetTimer);
    setActiveCSS('appear');
    setUiIsExpanded(true);
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function evt_Close() {
    setMessage('');
    setActiveCSS('');
    setUiIsExpanded(false);
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function evt_MarkAllRead() {
    CMTMGR.MarkAllRead();
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function evt_OpenReferent(event, cref) {
    event.preventDefault();
    event.stopPropagation();
    CMTMGR.OpenReferent(cref);
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function evt_OpenComment(event, cref, cid) {
    event.preventDefault();
    event.stopPropagation();
    CMTMGR.OpenComment(cref, cid);
  }

  /// RENDER HELPERS //////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** Renders each comment item summary as a JSX element
   *  @param {TCommentObject} comment
   *  @returns {JSX.Element}
   */
  function c_GetCommentItemJSX(comment) {
    if (comment.comment_isMarkedDeleted) return ''; // was marked deleted, so skip
    const cref = comment ? comment.collection_ref : '';
    const { typeLabel, sourceLabel } = CMTMGR.GetCREFSourceLabel(cref);
    if (sourceLabel === undefined) return ''; // source was deleted, so skip
    return (
      <div className="comment-item" key={comment.comment_id}>
        <div className="comment-sourcetype">{typeLabel}&nbsp;</div>
        <a
          href="#"
          className="comment-sourcelabel"
          onClick={event => evt_OpenReferent(event, cref)}
        >
          {sourceLabel}
        </a>
        <div className="commenter">: {comment.commenter_id}&nbsp;</div>
        <a
          href="#"
          onClick={event => evt_OpenComment(event, cref, comment.comment_id)}
        >{`#${comment.id}`}</a>
        &nbsp;&ldquo;
        <div className="comment-text">
          {String(comment.commenter_text.join('|')).trim()}
        </div>
        &rdquo;
      </div>
    );
  }

  /// COMPONENT RENDER ////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  if (!uid) return ''; // if not logged in, there's no comment status

  const { countRepliesToMe, countUnread } = CMTMGR.GetCommentStats();
  const unreadRepliesToMe = CMTMGR.GetUnreadRepliesToMe();
  const unreadRepliesToMeItems = unreadRepliesToMe.map(comment =>
    c_GetCommentItemJSX(comment)
  );
  const unreadComments = CMTMGR.GetUnreadComments();
  const unreadCommentItems = unreadComments.map(comment =>
    c_GetCommentItemJSX(comment)
  );

  const UnreadRepliesToMeButtonJSX = (
    <div>
      <URCommentSVGBtn
        uiref="unreadRepliesToMe"
        count={countRepliesToMe}
        hasUnreadComments={countRepliesToMe > 0}
        hasReadComments={countRepliesToMe === 0}
        selected={false}
        onClick={evt_ExpandPanel}
      />
      <h3>&nbsp;unread replies to me</h3>
    </div>
  );
  const UnreadButtonJSX = (
    <div>
      <URCommentSVGBtn
        uiref="unread"
        count={countUnread}
        hasUnreadComments={countUnread > 0}
        hasReadComments={countUnread === 0}
        selected={false}
        onClick={evt_ExpandPanel}
      />
      <h3>&nbsp;unread</h3>
    </div>
  );

  return (
    <>
      <URCommentThreadMgr />
      <URDialog info={CMTSTATUS.dialog} />
      <div id="comment-bar">
        <div
          id="comment-alert"
          className={`${activeCSS} ${uiIsExpanded ? ' expanded' : ''}`}
        >
          {!uiIsExpanded && <div className="comment-status-body">{message}</div>}
        </div>
        <div>
          <div
            id="comment-summary"
            className={`${uiIsExpanded ? ' expanded' : ''}`}
            onClick={evt_ExpandPanel}
          >
            {UnreadRepliesToMeButtonJSX}&nbsp;{UnreadButtonJSX}
          </div>
          <div
            id="comment-panel"
            className={`${uiIsExpanded ? ' expanded' : ''}`}
            onClick={evt_Close}
          >
            <div className="comments-unread">
              {UnreadRepliesToMeButtonJSX}
              <div className="comment-status-body">{unreadRepliesToMeItems}</div>
              {UnreadButtonJSX}
              <div className="comment-status-body">{unreadCommentItems}</div>
              <div className="commentbar">
                <button className="small" onClick={evt_Close}>
                  Close
                </button>
                <button className="small" onClick={evt_MarkAllRead}>
                  Mark All Read
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default URCommentStatus;
