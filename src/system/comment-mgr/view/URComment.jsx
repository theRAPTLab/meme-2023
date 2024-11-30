/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  URComment is a representation of an individual comment, used in the context
  of a URCommentThread.

  USE:

    <URComment
      cref={cref} // collection reference (e.g. node, edge, project)
      cid={cvobj.comment_id} // comment id
      uid={uid} // user id
      key={cvobj.comment_id} // part of thread array
    />

  1. UI input cycle
      URComment handles updates from by the URCommentPrompt component.
      The data is stored locally until evt_SaveBtn is clicked, which then
      calls comment-mgr.UpdateComment.
  2. Data State management
      comment-mgr saves the data to the database
      and updates COMMENTVOJBS state, which triggers a re-render of the
      URCommentThread component.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

import React, { useState, useEffect, useCallback } from 'react';
// nc import UNISYS from 'unisys/client';
import UR from '../../../system/ursys';
import CMTMGR from '../comment-mgr';
import URCommentPrompt from './URCommentPrompt';
const STATE = require('../lib/client-state');

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// Initialize UNISYS DATA LINK for react component
// nc const UDATAOwner = { name: 'URComment' };
const UDATAOwner = 'URComment';
// nc const UDATA = UNISYS.NewDataLink(UDATAOwner);
const UDATA = UR.NewConnection(UDATAOwner);
/// Debug Flags
const DBG = false;
const PR = 'URComment';

/// REACT FUNCTIONAL COMPONENT ////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** URComment renders a single comment in the context of a URCommentThread
 *  manager.
 *  @param {string} cref - Collection reference
 *  @param {string} cid - Comment ID
 *  @param {string} uid - User ID
 *  @returns {React.Component} - URComment
 */
function URComment({ cref, cid, uid }) {
  const [element, setElement] = useState(null);
  const [state, setState] = useState({
    id: undefined,
    commenter: '',
    createtime_string: '',
    modifytime_string: '',
    selected_comment_type: '',
    commenter_text: ['hah'],
    comment_error: '',
    uViewMode: CMTMGR.VIEWMODE.VIEW,
    uIsSelected: false,
    uIsBeingEdited: false,
    uIsEditable: false,
    uIsDisabled: false,
    uAllowReply: false
  });

  /** Component Effect - initial comment viewobject on mount */
  useEffect(
    () => c_LoadCommentVObj(),
    [] // run once because no dependencies are declared
  );

  /** Component Effect - scroll component into view on mount */
  useEffect(() => {
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  }, [element]);

  /** Component Effect - updated comment */
  useEffect(() => {
    // declare helpers
    const urmsg_UpdatePermissions = data => {
      setState(prevState => ({
        ...prevState,
        uIsDisabled: data.commentBeingEditedByMe
      }));
    };
    const urstate_UpdateCommentVObjs = () => c_LoadCommentVObj();

    // hook UNISYS state change and message handlers
    STATE.OnStateChange('COMMENTVOBJS', urstate_UpdateCommentVObjs, UDATAOwner);
    UR.Subscribe('COMMENT_UPDATE_PERMISSIONS', urmsg_UpdatePermissions);

    // cleanup methods for functional component unmount
    return () => {
      if (state.uIsBeingEdited) CMTMGR.UnlockComment(cid);
      STATE.OffStateChange('COMMENTVOBJS', urstate_UpdateCommentVObjs);
      UR.Unsubscribe('COMMENT_UPDATE_PERMISSIONS', urmsg_UpdatePermissions);
    };
  }, [state.uIsBeingEdited]); // run when uIsBeingEdited changes

  /// COMPONENT HELPER METHODS ////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** Declare helper method to load viewdata from comment manager into the
   *  component state */
  function c_LoadCommentVObj() {
    const cvobj = CMTMGR.GetCommentVObj(cref, cid);
    const comment = CMTMGR.GetComment(cid);

    // When deleting, COMMENTVOBJS state change will trigger a load and render
    // before the component is unmounted.  So catch it and skip the state update.
    if (!cvobj || !comment) {
      console.error('c_LoadCommentVObj: comment or cvobj not found!');
      return;
    }

    // Error check: verify that comment types exist, if not, fall back gracefully to default type
    const { comment_error, selected_comment_type } = c_ValidateCommentType(
      comment.comment_type
    );

    // set component state from retrieved data
    setState({
      // Data
      id: comment.id, // human readable "#xxx" id matching pmcData id
      comment_id_parent: comment.comment_id_parent,
      commenter: CMTMGR.GetUserName(comment.commenter_id),
      selected_comment_type,
      commenter_text: [...comment.commenter_text],
      createtime_string: cvobj.createtime_string,
      modifytime_string: cvobj.modifytime_string,
      // Messaging
      comment_error,
      // UI State
      uViewMode: cvobj.isBeingEdited ? CMTMGR.VIEWMODE.EDIT : CMTMGR.VIEWMODE.VIEW,
      uIsSelected: cvobj.isSelected,
      uIsBeingEdited: cvobj.isBeingEdited,
      uIsEditable: cvobj.isEditable,
      uAllowReply: cvobj.allowReply
    });

    // Lock edit upon creation of a new comment or a new reply
    if (cvobj.isBeingEdited) CMTMGR.LockComment(comment.comment_id);
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** Validate selected comment type
   *  Make sure the selected comment type exists.  If not, show error.
   */
  function c_ValidateCommentType(selected_comment_type) {
    let comment_error = '';
    if (!CMTMGR.GetCommentType(selected_comment_type)) {
      const defaultCommentTypeObject = CMTMGR.GetDefaultCommentType();
      comment_error = `Comment type "${selected_comment_type}" not found: Falling back to default  "${defaultCommentTypeObject.label}"`;
      console.warn(comment_error);
      selected_comment_type = defaultCommentTypeObject.slug;
    }
    // set component state from retrieved data
    return { comment_error, selected_comment_type };
  }
  /// COMPONENT UI HANDLERS ///////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** handle edit button, which toggles the viewmode of this URComment */
  function evt_EditBtn() {
    const uViewMode =
      state.uViewMode === CMTMGR.VIEWMODE.EDIT
        ? CMTMGR.VIEWMODE.VIEW
        : CMTMGR.VIEWMODE.EDIT;
    setState(prevState => ({
      ...prevState,
      uViewMode
    }));
    CMTMGR.UIEditComment(cid);
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** handle save button, which saves the state to comment manager.
   *  looks like there are some side effects being handled at the end */
  function evt_SaveBtn() {
    const { selected_comment_type, commenter_text } = state;
    const comment = CMTMGR.GetComment(cid);
    comment.comment_type = selected_comment_type;
    comment.commenter_text = [...commenter_text]; // clone, not byref
    comment.commenter_id = uid;
    CMTMGR.UISaveComment(comment);
    setState(prevState => ({
      ...prevState,
      uViewMode: CMTMGR.VIEWMODE.VIEW
    }));
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** handle reply button, which adds a new comment via comment manager,
   *  updating the thread data structure associated with URCommentThread */
  function evt_ReplyBtn() {
    const { comment_id_parent } = state;
    if (comment_id_parent === '') {
      // Reply to a root comment
      CMTMGR.AddComment({
        cref,
        comment_id_parent: cid,
        comment_id_previous: '',
        commenter_id: uid
      });
    } else {
      // Reply to a threaded comment
      CMTMGR.AddComment({
        cref,
        comment_id_parent,
        comment_id_previous: cid,
        commenter_id: uid
      });
    }
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** handle delete button, which removes the comment associated with this
   *  commment from the comment manager */
  function evt_DeleteBtn() {
    const { id } = state;
    CMTMGR.RemoveComment({
      collection_ref: cref,
      id,
      comment_id: cid,
      uid
    });
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** handle cancel button, which reverts the comment to its previous state,
   *  doing additional housekeeping to keep comment manager consistent
   *  If the comment is empty and it's a new comment, just remove it
   * */
  function evt_CancelBtn() {
    const { commenter_text, id } = state;

    let previouslyHadText = false;
    CMTMGR.GetComment(cid).commenter_text.forEach(t => {
      if (t !== '') previouslyHadText = true;
    });

    if (previouslyHadText) {
      // revert to previous text
      CMTMGR.UICancelComment(cid);
      const comment = CMTMGR.GetComment(cid);
      setState(prevState => ({
        ...prevState,
        modifytime_string: comment.modifytime_string,
        selected_comment_type: comment.comment_type,
        commenter_text: [...comment.commenter_text], // restore previous text clone, not by ref
        comment_error: '',
        uViewMode: CMTMGR.VIEWMODE.VIEW
      }));
    } else {
      // Remove the temporary comment and unlock
      CMTMGR.RemoveComment({
        collection_ref: cref,
        id,
        comment_id: cid,
        uid,
        skipDialog: true
      });
      setState({
        commenter_text: [],
        uViewMode: CMTMGR.VIEWMODE.VIEW
      });
    }

    return;
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** handle select button, which updates the comment type associated with this
   *  comment via comment manager */
  function evt_TypeSelector(event) {
    const selection = event.target.value;
    // Error check: verify that comment types exist, if not, fall back gracefully to default type
    const { comment_error, selected_comment_type } = c_ValidateCommentType(selection);
    setState(prevState => ({
      ...prevState,
      comment_error,
      selected_comment_type
    }));
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** handle input update, which updates the text associated with this comment
   *  via comment manager */
  function evt_CommentText(index, event) {
    const { commenter_text } = state;
    commenter_text[index] = event.target.value;
    setState(prevState => ({
      ...prevState,
      commenter_text: [...commenter_text]
    }));
  }

  /// COMPONENT RENDER ////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** The URComment conditionally renders its display state based on several
   *  states:
   *  - isAdmin - read from commentmgr directly
   *  - state.uViewMode - "edit" or "view" mode of comment
   *  - state.uIsSelected - is current selected comment
   *  - state.uIsBeingEdited - is being live edited
   *  - state.uIsEditable - can be edited
   *  - state.uIsDisabled - is active/inactive
   */
  const {
    commenter,
    selected_comment_type,
    commenter_text,
    createtime_string,
    modifytime_string,
    comment_error,
    uViewMode,
    uIsDisabled,
    uAllowReply
  } = state;

  const isAdmin = CMTMGR.IsAdmin();
  const comment = CMTMGR.GetComment(cid);
  const commentTypes = CMTMGR.GetCommentTypes();

  if (!comment) {
    if (DBG)
      console.log(`URComment rendering skipped because comment ${cid} was removed`);
    return '';
  }
  if (!commenter) return null; // not ready

  // TODO Allow admins
  const isAllowedToEditOwnComment = uid === comment.commenter_id;

  /// SUB COMPONENTS
  const EditBtn = (
    <button className="outline small" onClick={evt_EditBtn}>
      Edit
    </button>
  );
  const DeleteBtn = (
    <button className="outline small danger" onClick={evt_DeleteBtn}>
      Delete
    </button>
  );
  const SaveBtn = <button onClick={evt_SaveBtn}>Save</button>;
  const ReplyBtn = uAllowReply ? (
    <button onClick={evt_ReplyBtn}>Reply</button>
  ) : (
    <div></div> // empty div to keep layout consistent
  );
  const CancelBtn = (
    <button className="secondary" onClick={evt_CancelBtn}>
      Cancel
    </button>
  );
  const TypeSelector = (
    <select value={selected_comment_type} onChange={evt_TypeSelector}>
      {[...commentTypes.entries()].map(type => (
        <option key={type[0]} value={type[0]}>
          {type[1].label}
        </option>
      ))}
    </select>
  );
  const SelectedType = commentTypes.get(selected_comment_type);
  const SelectedTypeLabel = SelectedType ? SelectedType.label : 'Type not found';
  // Alternative three-dot menu approach to hide "Edit" and "Delete"
  // const UIOnEditMenuSelect = event => {
  //   switch (event.target.value) {
  //     case 'edit':
  //       evt_EditBtn();
  //       break;
  //     case 'delete':
  //       evt_DeleteBtn();
  //       break;
  //     default:
  //       break;
  //   }
  // };
  // const EditMenu = (
  //   <select className="editmenu" onChange={this.UIOnEditMenuSelect}>
  //     <option>...</option>
  //     <option value="edit">EDIT</option>
  //     <option value="delete">DELETE</option>
  //   </select>
  // );

  const cvobj = CMTMGR.GetCommentVObj(cref, cid);

  let CommentComponent;
  if (uViewMode === CMTMGR.VIEWMODE.EDIT) {
    // EDIT mode
    CommentComponent = (
      <div
        id={cid}
        ref={setElement}
        className={`comment ${comment.comment_isMarkedDeleted && 'deleted'}`}
        onMouseDown={e => e.stopPropagation()}
      >
        <div>
          <div className="commenter">{commenter}</div>
          <div className="date">{modifytime_string || createtime_string}</div>
        </div>
        <div>
          <div className="commentTypeBar">
            <div className="commentTypeLabel">{TypeSelector}</div>
            <div className="commentId">#{comment.id}</div>
          </div>
          <URCommentPrompt
            cref={cref}
            commentType={selected_comment_type}
            commenterText={commenter_text}
            isMarkedDeleted={comment.comment_isMarkedDeleted}
            isMarkedRead={cvobj.isMarkedRead}
            viewMode={CMTMGR.VIEWMODE.EDIT}
            onChange={evt_CommentText}
            errorMessage={comment_error}
          />
          <div className="editbar">
            {CancelBtn}
            {SaveBtn}
          </div>
        </div>
      </div>
    );
  } else {
    // VIEW mode
    CommentComponent = (
      <div
        id={cid}
        ref={setElement}
        className={`comment ${comment.comment_isMarkedDeleted ? 'deleted' : ''} ${cvobj.isMarkedRead ? '' : 'unread'}`}
      >
        <div>
          <div className="commenter">{commenter}</div>
          <div className="date">{modifytime_string || createtime_string}</div>
        </div>
        <div>
          <div className="commentTypeBar">
            <div className="commentTypeLabel">
              <span className="date">TYPE: </span>
              <span className="type">{SelectedTypeLabel}</span>
            </div>
            <div className="commentId">#{comment.id}</div>
          </div>
          <URCommentPrompt
            cref={cref}
            commentType={selected_comment_type}
            commenterText={commenter_text}
            isMarkedDeleted={comment.comment_isMarkedDeleted}
            isMarkedRead={cvobj.isMarkedRead}
            viewMode={CMTMGR.VIEWMODE.VIEW}
            errorMessage={comment_error}
          />
          {uid && !uIsDisabled && (
            <div className="commentbar">
              {!comment.comment_isMarkedDeleted && ReplyBtn}
              {(isAllowedToEditOwnComment &&
                !comment.comment_isMarkedDeleted &&
                EditBtn) || <div></div>}
              {(((isAllowedToEditOwnComment && !comment.comment_isMarkedDeleted) ||
                isAdmin) &&
                DeleteBtn) || <div></div>}
            </div>
          )}
        </div>
      </div>
    );
  }
  // Simple show threads -- if comment has a parent, indent it
  return cvobj.level > 0 ? (
    <div className="commentIndented">{CommentComponent}</div>
  ) : (
    CommentComponent
  );
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default URComment;
