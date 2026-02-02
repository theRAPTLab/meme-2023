/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  URCommentPrompt

  In edit mode, displays input widgets for entering prompts.
  In view mode, displays static comment prompt.
  A comment can contain one or more comment prompts.
  Each prompt can use a different prompt format.

  PROMPT FORMATS:
    - text
    - dropdown
    - checkbox
    - likert
    - radio
    - discrete-slider

  Prompt formats use exact `text` matching to determine the selected item,
  not an index.  So if you change the label on the prompt type, you will
  have to update the selection as well.  The rationale for this is that
  we want the comment database data to be as human-readable as possible.
  Otherwise comment data would mostly be a series of indices that you
  would have to back-match:
    - dropdown
    - likert
    - radio
  The exceptions are:
    - checkbox -- matches `text` within a \n-delimited string
    - discrete-slider -- matches based on the selected index value
                         In this case, using the value makes sense
                         because the saved data is a number.

  This uses a lot of props because it really is a helper componnent for
  URComment.  The current state is maintained in URComment, but during
  edit, input updates are stored temporarily in this component.

  USE:

    <URCommentPrompt
      cref={cref}  // collection reference (e.g. node, edge, project)
      commentType={comment_type} // currently selected comment type, not stored comment.comment_type
      commenterText={commenter_text}
      isMarkedDeleted={comment.comment_isMarkedDeleted}
      isMarkedRead={cvobj.isMarkedRead}
      viewMode={uViewMode}
      onChange={this.UIOnInputUpdate}
      errorMessage={comment_error}
    />

    We use props (especially `commenter_text`) here because URComment stores the
    current interim state of the comment text during editing.  The `commment`
    object stores the previous saved state.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

import React, { useState, useEffect, useCallback } from 'react';
import CMTMGR from '../comment-mgr';
import URCommentSVGBtn from '../../../system/comment-mgr/view/URCommentSVGBtn';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// Debug Flags
const DBG = false;
const PR = 'URCommentPrompt';
/// Constants
const CHECKBOX_DELIMITER = /\n/;

/// REACT FUNCTIONAL COMPONENT ////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function URCommentPrompt({
  cref,
  commentType,
  commenterText,
  isMarkedDeleted,
  isMarkedRead,
  viewMode,
  onChange,
  errorMessage
}) {
  const commentTypes = CMTMGR.GetCommentTypes();

  useEffect(() => {
    if (viewMode === CMTMGR.VIEWMODE.EDIT) {
      const promptList = commentTypes.get(commentType).prompts;
      // find the first empty prompt
      let focusIndex = -1;
      promptList.find((prompt, promptIndex) => {
        if (u_IsEmpty(commenterText[promptIndex])) {
          focusIndex = promptIndex;
          return true;
        }
      });

      // if everything is filled, focus the first prompt
      if (focusIndex === -1) focusIndex = 0;

      // set focus to the found element
      const element = document.getElementById(u_PromptElementId(cref, focusIndex));
      if (element) {
        element.focus();
        // if it's an empty select element, set default and try to trigger picker
        if (element.tagName === 'SELECT' && u_IsEmpty(commenterText[focusIndex])) {
          const prompt = promptList[focusIndex];
          if (prompt.options && prompt.options.length > 0) {
            // trigger onChange to set the default value in parent state
            onChange(focusIndex, { target: { value: prompt.options[0] } });
            // try to show picker
            if (typeof element.showPicker === 'function') {
              try {
                element.showPicker();
              } catch (e) {
                console.warn(`${PR}: showPicker() failed`, e);
              }
            }
          }
        }
      }
    }
  }, [viewMode, commentType]);

  /// UTILITIES ///////////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** Used for radio buttons to indicate that there is nothing selected
   * @param {string} commenterTextStr current radio button value
   * @returns {boolean} true if the string is empty
   */
  function u_IsEmpty(commenterTextStr) {
    return (
      commenterTextStr === undefined ||
      commenterTextStr === null ||
      commenterTextStr === ''
    );
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** Converts `index` into "prompt-<index>" for use in HTML id attributes */
  function u_PromptElementId(cref, index) {
    return `prompt-${cref}-${index}`;
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /**
   * Converts "Apple Pie\nApple Fritter" into ["Apple Pie", "Apple Fritter"]
   * @param {string} commenterTextStr newline delimited string, e.g. "Apple Pie\nApple Fritter"
   * @returns {string[]} updated commenter text
   */
  function u_SplitCheckboxCommentText(commenterTextStr) {
    if (!commenterTextStr) return [];
    return commenterTextStr.split(CHECKBOX_DELIMITER);
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /**
   * Converts a selection 0-based index into a stacked discrete slider string
   * to save as comment text, e.g. 2 becomes `★★★`
   * Each option can have a different value
   * @param {number} index the selected item index (0-based)
   * @param {string[]} options e.g.  ['💙', '💚', '💛', '🧡', '🩷']
   * @returns {string} e.g. 2 returns '💙💚💛'
   */
  function u_SelectedIndex2CommentText(index, options) {
    return options.map((o, i) => (i <= index ? o : '')).join('');
  }

  /// COMPONENT UI HANDLERS ///////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /**
   * handles checkbox changing by
   * 1. combining all checkbox items into a single newline-delimited string
   * 2. calling onChange handler with derived data for checkboxes
   * e.g. "Apple\nBanana"
   * @param {number} promptIndex index pointing to the currently active prompt
   * @param {number} optionIndex index of the checkbox option item
   * @param {Object} options all of the checkbox options
   * @param {Object} event
   */
  function evt_OnCheck(promptIndex, optionIndex, options, event) {
    // e.g. selectedCheckboxes =  ["Apple Pie", "Apple Fritter"]
    const selectedCheckboxes = u_SplitCheckboxCommentText(commenterText[promptIndex]);
    let items = [];
    options.forEach((o, index) => {
      if (optionIndex === index) {
        // handle the current selection
        if (event.target.checked) items[index] = o;
        else items[index] = '';
      } else {
        // handle previous selections
        if (selectedCheckboxes.includes(o)) items[index] = o;
        else items[index] = '';
      }
    });
    event.target.value = items.join('\n');
    onChange(promptIndex, event);
  }

  /// COMPONENT RENDER ////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** URCommentPrompt renders its display state based on:
   *  - viewMode -- "edit" or "view" mode
   */
  const RenderEditMode = () => {
    return commentTypes.get(commentType).prompts.map((prompt, promptIndex) => {
      let inputJSX;
      switch (prompt.format) {
        case 'text':
          inputJSX = (
            <textarea
              id={u_PromptElementId(cref, promptIndex)}
              autoFocus
              onChange={event => onChange(promptIndex, event)}
              value={commenterText[promptIndex] || ''}
            />
          );
          break;
        case 'dropdown': {
          let selectedValue = commenterText[promptIndex];
          if (!prompt.options.includes(selectedValue)) {
            // currently selected value does not match an item in the dropdown
            // fall back to the first item for display only (don't mutate props!)
            if (prompt.options.length > 0) selectedValue = prompt.options[0];
            else {
              console.warn(
                `Dropdown for ${commentType} has no options! Check definition!`
              );
              selectedValue = '';
            }
          }
          inputJSX = (
            <select
              id={u_PromptElementId(cref, promptIndex)}
              value={selectedValue || ''}
              onChange={event => onChange(promptIndex, event)}
            >
              {prompt.options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
          break;
        }
        case 'checkbox': {
          // converts commment text into ["Apple", "Banana"]
          const selectedCheckboxes = u_SplitCheckboxCommentText(
            commenterText[promptIndex]
          );
          inputJSX = (
            <div className="prompt">
              {prompt.options.map((option, optionIndex) => (
                <label key={optionIndex}>
                  <input
                    type="checkbox"
                    value={option}
                    onChange={event =>
                      evt_OnCheck(promptIndex, optionIndex, prompt.options, event)
                    }
                    checked={selectedCheckboxes.includes(option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          );
          break;
        }
        case 'radio':
          inputJSX = (
            <div>
              {prompt.options.map((option, index) => (
                <label key={index}>
                  <input
                    type="radio"
                    value={option}
                    onChange={event => onChange(promptIndex, event)}
                    checked={commenterText[promptIndex] === option}
                  />
                  {option}
                </label>
              ))}
            </div>
          );
          break;
        case 'likert':
          inputJSX = (
            <div className="prompt">
              {prompt.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  value={option}
                  className={
                    commenterText[promptIndex] === option ? 'selected' : 'notselected'
                  }
                  onClick={event => onChange(promptIndex, event)}
                >
                  {option}
                </button>
              ))}
            </div>
          );
          break;
        case 'discrete-slider':
          inputJSX = (
            <div className="prompt">
              {prompt.options.map((option, index) => (
                <button
                  key={index}
                  value={[index, u_SelectedIndex2CommentText(index, prompt.options)]}
                  className={
                    String(index) <= commenterText[promptIndex]
                      ? 'selected'
                      : 'notselected'
                  }
                  onClick={event => onChange(promptIndex, event)}
                >
                  {option}
                </button>
              ))}
            </div>
          );
          break;
        default:
          break;
      }
      return (
        <div key={promptIndex}>
          <div className="label">{prompt.prompt}</div>
          <div className="help">{prompt.help}</div>
          {inputJSX}
          <div className="feedback">{prompt.feedback}</div>
          <div className="error">{errorMessage}</div>
        </div>
      );
    });
  };

  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  const RenderViewMode = () => {
    const NOTHING_SELECTED = <span className="help">(nothing selected)</span>;
    if (isMarkedDeleted) return <div className="commenttext">DELETED</div>;
    return commentTypes.get(commentType).prompts.map((prompt, promptIndex) => {
      let displayJSX;
      switch (prompt.format) {
        case 'text':
        case 'dropdown':
        case 'radio':
          displayJSX = (
            <div className="commenttext">
              {!isMarkedDeleted && commenterText[promptIndex]}
              {u_IsEmpty(commenterText[promptIndex]) && NOTHING_SELECTED}
            </div>
          );
          break;
        case 'checkbox': {
          const selectedCheckboxes = u_SplitCheckboxCommentText(
            commenterText[promptIndex]
          );
          displayJSX = (
            <div className="prompt">
              {prompt.options.map((option, optionIndex) => (
                <label key={optionIndex}>
                  <input
                    type="checkbox"
                    value={option}
                    checked={selectedCheckboxes.includes(option)}
                    readOnly // React will emit warning if there isn't an onChange handler
                    className={'readonly'} // css: class is necessary for styling
                    // css: `input[type='checkbox']:read-only` doesn't work -- it matches non-`readOnly` too
                    // css: `disabled` grays out the checkbox too much, use the css class to style
                  />
                  {option}
                </label>
              ))}
            </div>
          );
          break;
        }
        case 'likert':
          displayJSX = (
            <div className="prompt">
              {prompt.options.map((option, index) => (
                <button
                  key={index}
                  value={option}
                  className={
                    commenterText[promptIndex] === option ? 'selected' : 'notselected'
                  }
                  disabled
                >
                  {option}
                </button>
              ))}
            </div>
          );
          break;
        case 'discrete-slider':
          displayJSX = (
            <div className="prompt">
              {prompt.options.map((option, index) => (
                <button
                  key={index}
                  value={option}
                  className={
                    String(index) <= commenterText[promptIndex]
                      ? 'selected'
                      : 'notselected'
                  }
                  disabled
                >
                  {option}
                </button>
              ))}
            </div>
          );
          break;
        default:
          break;
      }

      return (
        <div key={promptIndex} className="comment-item">
          <div className="label">{prompt.prompt}</div>
          {/* <div className="help">{prompt.help}</div> */}
          {displayJSX}
          {/* <div className="feedback">{prompt.feedback}</div> */}
          <div className="error">{errorMessage}</div>
        </div>
      );
    });
  };
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  return viewMode === CMTMGR.VIEWMODE.EDIT ? RenderEditMode() : RenderViewMode();
}

export default URCommentPrompt;
