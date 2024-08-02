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
      *   ratingsDefs     value
      *   rating          value
      *   isExpanded      display setting
    TO Parent
      *   OnRatingButtonClick


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
import React from 'react';
import './MEMEStyles.css';
import './WRatingButton.css';

import RATINGS from './WRatings';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class WRatingButton extends React.Component {
  constructor(props) {
    super(props);
    this.OnClick = this.OnClick.bind(this);
  }

  componentDidMount() {}

  componentWillUnmount() {}

  OnClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.OnRatingButtonClick();
  }

  render() {
    const { rating, isExpanded, classes, ratingDefs } = this.props;

    const ratingObject = ratingDefs.find(ro => ro.rating === rating);
    const label = ratingObject ? ratingObject.label : 'Label not found';

    return (
      <button className="WRatingButton transparent" onClick={this.OnClick}>
        {RATINGS.getIcon(rating)}&nbsp;
        <div>{isExpanded ? label : ''}</div>
      </button>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WRatingButton;
