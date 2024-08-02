/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Ratings List

The WRatingsList is part of a positive/neutral/negative rating system.

RatingsDialog displays a dialog showing the available types of ratings and
lets the user select a rating.

The RatingsList component actually renders each rating item, including the
positive/negative icons and the label.

The Ratings List has three Modes:
  * 'edit' -- The labels are editable, used to edit ratings in admin interface
  * 'active' -- The labels can be clicked, used in evidence link rating
  * 'inactive' -- The labels cannot be clicked nor edited, used to display in admin interace

It is opened via an URSYS call, e.g.
    const data = {
      evId: this.props.evlink.evId,
      rating: this.props.evlink.rating
    };
    UR.Publish('RATING_OPEN', data);

It relies on the parent object passing props for the ratingsDef (ratings definition)
and setting the mode.

The parent also needs to hand data updates (UpdateField).

Ratings List does not handle its own showing/hiding.  AdmRatingsView and
RatingsDialog does that.


\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import './MEMEStyles.css';
import './WRatingsList.css';

import RATINGS from './WRatings';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'WRatingsList:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class WRatingsList extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    const { classes, SelectedRating, RatingsDef, Mode, UpdateField, OnRatingSelect } =
      this.props;

    let ratingsDef = RatingsDef;

    return (
      <div className="WRatingsList">
        {ratingsDef.map(def => {
          switch (Mode) {
            case 'edit':
              return (
                <div className="rating transparent" key={def.rating}>
                  <div>{RATINGS.getIcon(def.rating)}</div>
                  <input
                    value={def.label}
                    placeholder="Label"
                    onChange={e => UpdateField(def.rating, e.target.value)}
                  />
                </div>
              );
            case 'active':
              return (
                <button
                  className={`rating transparent ${SelectedRating === String(def.rating) ? 'primary' : ''}`}
                  key={def.label}
                  onClick={e => OnRatingSelect(e, def.rating)}
                >
                  <div>{RATINGS.getIcon(def.rating)}</div>
                  <div>{def.label}</div>
                </button>
              );
            case 'inactive':
            default:
              return (
                <div className="rating transparent" key={def.label}>
                  <div>{RATINGS.getIcon(def.rating)}</div>
                  <div>{def.label}</div>
                </div>
              );
          }
        })}
      </div>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WRatingsList;
