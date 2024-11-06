/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

RatingButton

The WRatingButton is part of a positive/neutral/negative rating system.

The RatingButton is primarily a display component.  It's main purpose is
display the currently selected rating.

It handles a click request to change the rating, passing off the
update to RatingsDialog.jsx.

Features:
* Any number of ratings can be set
* Supports an expanded and collasped (minified) view.


RATIONALE

The goal is to make this a generalized component that can be used in
various different circumstances.  So we rely on props calls to communicate
with the parent component.

Props:
    FROM Parent
      *   ratingsDefs     value     DEPRECATED
      *   rating          value
      *   isExpanded      display setting
    TO Parent
      *   OnRatingButtonClick


DEPRECATED -- ratingsDefs are now handled by RATINGS.
              Loading via ratingsDefs might be necessary to restore if
              we want to support dynamically changing ratings via the admin UI.
ratingsDefs looks like this:
    [
      { label: 'Really disagrees!', rating: -3 },
      { label: 'Kinda disagrees!', rating: -2 },
      { label: 'Disagrees a little', rating: -1 },
      { label: 'Not rated / Irrelevant', rating: 0 },
      { label: 'Weak support', rating: 1 },
      { label: 'Medium support', rating: 2 },
      { label: 'Rocks!!', rating: 3 }
    ]

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React, { useRef, useEffect } from 'react';
import { SVG } from '@svgdotjs/svg.js';
import PropTypes from 'prop-types';
import './MEMEStyles.css';
import './WRatingButton.css';

// import RATINGS from './WRatings';  // deprecated -- ratings are now burnt in.
import RATINGS from '../modules/class-ratings';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// REACT FUNCTIONAL COMPONENT ////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function WRatingButton({
  rating,
  isExpanded,
  // ratingDefs, // deprecated -- ratings are now burnt in.
  disabled,
  OnRatingButtonClick // handler defined in WRatingsDialog
}) {
  const svgRef = useRef(null);
  const size = 24;
  const label = RATINGS.getLabel(rating);

  /// USEEFFECT ///////////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  useEffect(() => {
    const draw = SVG(svgRef.current);
    c_DrawRatingIcon();

    return () => {
      draw.remove();
    };
  }, []);

  useEffect(() => {
    c_DrawRatingIcon();
  }, [rating, isExpanded, disabled]);

  /// COMPONENT HELPER METHODS ////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function c_DrawRatingIcon() {
    const draw = SVG(svgRef.current);
    draw.clear();
    draw.group().add(RATINGS.getSVGIcon(rating)).transform({
      origin: 'top left', // seems to default to 'center' if not specified
      scale: 1.6
    });
  }

  /// COMPONENT RENDER ////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  return (
    <button
      className="WRatingButton transparent"
      onClick={e => OnRatingButtonClick(e, rating)}
      disabled={disabled}
    >
      <svg ref={svgRef} width={size} height={size} />
      &nbsp;&nbsp;
      <div>{isExpanded ? label : ''}</div>
    </button>
  );
}

WRatingButton.propTypes = {
  rating: PropTypes.number,
  isExpanded: PropTypes.bool,
  // ratingDefs: PropTypes.array, // deprecated -- ratings are now burnt in.
  disabled: PropTypes.bool,
  OnRatingButtonClick: PropTypes.func
};

WRatingButton.defaultProps = {
  rating: 0,
  isExpanded: false,
  // ratingDefs: [], // deprecated -- ratings are now burnt in.
  disabled: false,
  OnRatingButtonClick: () => {
    console.error('Missing OnRatingButtonClick Handler!');
  }
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WRatingButton;
