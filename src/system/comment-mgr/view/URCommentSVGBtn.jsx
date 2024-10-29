/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  URCommentSVGBtn

  A purely visual button that uses SVG Symbols.
  Relies on props to render.

  USE:
      <URCommentSVGBtn
        uiref={cref}
        count={countRepliesToMe}
        hasUnreadComments={countRepliesToMe > 0}
        hasReadComments={countRepliesToMe === 0}
        selected={false}
        disabled={false}
        small={false}
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
const { SVGDEFS } = DEFAULTS;
import './URComment.css';

/// REACT FUNCTIONAL COMPONENT ////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function URCommentSVGBtn({
  uiref,
  count,
  hasUnreadComments,
  hasReadComments,
  selected,
  disabled,
  small,
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

    return () => {
      draw.remove();
    };
  }, []);

  useEffect(() => {
    c_DrawCommentIcon();
  }, [count, hasUnreadComments, hasReadComments, selected]);

  /// COMPONENT HELPER METHODS ////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function c_DrawCommentIcon() {
    // css
    let css = ' ';
    if (hasUnreadComments) css += 'hasUnreadComments ';
    else if (hasReadComments) css += 'hasReadComments ';
    css += selected ? 'isOpen ' : '';
    css += disabled ? 'disabled ' : '';
    setCss(css);

    // commentCountLabel
    const commentCountLabel = count > 0 ? count : '';
    setLabel(commentCountLabel);

    // derive icon
    let symbolName = 'svgcmt--unread';
    if (hasReadComments && !hasUnreadComments) {
      // it's possible to have both read and unread comments
      // if there's anything unread, we want to mark it unread
      if (selected) symbolName = 'svgcmt-readSelected';
      else symbolName = 'svgcmt-read-outlined';
    } else {
      // hasUnreadComments or no comments
      if (selected) symbolName = 'svgcmt-unreadSelected';
      else symbolName = 'svgcmt-unread';
    }

    const draw = SVG(svgRef.current);
    draw.clear();
    draw
      .group()
      .attr('class', 'svgcmt-read-outlined')
      .add(SVGDEFS.get('comment').clone())
      .transform({
        translate: [4, 0], // center within 32,32
        origin: 'top left', // seems to default to 'center' if not specified
        scale: small ? 0.9 : 1.6
      });
  }

  /// COMPONENT RENDER ////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const size = small ? '24' : '32';
  return (
    <div id={uiref} className={'commentbtn' + css} onClick={onClick}>
      <div className="comment-count">{label}</div>
      <svg ref={svgRef} width={size} height={size} />
    </div>
  );
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default URCommentSVGBtn;
