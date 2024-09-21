/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  URCommentSVGBtn

  A purely visual button that uses SVG Symbols.
  Relies on props to render.

  USE:
      <URCommentSVGBtn
        count={countRepliesToMe}
        hasUnreadComments={countRepliesToMe > 0}
        hasReadComments={countRepliesToMe === 0}
        selected={false}
        onClick={evt_ExpandPanel}
      />

  Used by:
  - URCommentStatus

  Displays three visual states:
  - read/unread status
    - has unread comments (gold color)
    - all comments are read (gray color)
  - is open / selected (displaying comments)
  - the number of comments.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

import React, { useRef, useState, useEffect } from 'react';
import { SVG } from '@svgdotjs/svg.js';
import DEFAULTS from '../../../app-web/modules/defaults';
const { SVGSYMBOLS } = DEFAULTS;
import './URComment.css';

/// REACT FUNCTIONAL COMPONENT ////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function URCommentSVGBtn({
  uiref,
  count,
  hasUnreadComments,
  hasReadComments,
  selected,
  onClick
}) {
  const svgRef = useRef(null);
  const [label, setLabel] = useState('');
  const [css, setCss] = useState('');

  /// USEEFFECT ///////////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  useEffect(() => {
    const draw = SVG(svgRef.current);
    c_DrawCommentIcon();
  }, []);

  /// COMPONENT HELPER METHODS ////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function c_DrawCommentIcon() {
    // css
    let css = 'commentbtn ';
    if (hasUnreadComments) css += 'hasUnreadComments ';
    else if (hasReadComments) css += 'hasReadComments ';
    css += selected ? 'isOpen ' : '';
    setCss(css);

    // commentCountLabel
    const commentCountLabel = count > 0 ? count : '';
    setLabel(commentCountLabel);

    // derive icon
    let symbolName = 'commentUnread';
    if (hasReadComments && !hasUnreadComments) {
      // it's possible to have both read and unread comments
      // if there's anything unread, we want to mark it unread
      if (selected) symbolName = 'commentReadSelected';
      else symbolName = 'commentRead';
    } else {
      // hasUnreadComments or no comments
      if (selected) symbolName = 'commentUnreadSelected';
      else symbolName = 'commentUnread';
    }

    const draw = SVG(svgRef.current);
    draw.clear();
    draw.use(SVGSYMBOLS.get(symbolName)).transform({
      translate: [4, 0], // center within 32,32
      origin: 'top left', // seems to default to 'center' if not specified
      scale: 1.6
    });
  }

  /// COMPONENT RENDER ////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  return (
    <div id={uiref} className={css} onClick={onClick}>
      <div className="comment-count">{label}</div>
      <svg ref={svgRef} width="32" height="32" />
    </div>
  );
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default URCommentSVGBtn;
