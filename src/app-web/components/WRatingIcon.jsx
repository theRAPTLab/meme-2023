/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

RatingIcon

SVG Icon
Used by WRatingButton and WRatingsList

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React, { useRef, useEffect } from 'react';
import { SVG } from '@svgdotjs/svg.js';
import PropTypes from 'prop-types';
import './MEMEStyles.css';
import './WRatingButton.css';

import RATINGS from '../modules/class-ratings';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// REACT FUNCTIONAL COMPONENT ////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function WRatingIcon({ rating }) {
  const svgRef = useRef(null);
  const size = 24;

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
  }, [rating]);

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
  return <svg ref={svgRef} width={size} height={size} />;
}

WRatingIcon.propTypes = {
  rating: PropTypes.number
};

WRatingIcon.defaultProps = {
  rating: 0
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WRatingIcon;
