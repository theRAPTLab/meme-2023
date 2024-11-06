/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Ratings List

The WRatingsList is part of a positive/neutral/negative rating system.

WRatingsDialog displays a dialog showing the available types of ratings and
lets the user select a rating.

The WRatingsList component actually renders each rating item, including the
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

WRatingsList does not handle its own showing/hiding.  WAdmRatingsView and
WRatingsDialog does that.


\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import './MEMEStyles.css';
import './WRatingsList.css';

import WRatingButton from './WRatingButton';

// import RATINGS from './WRatings';
import RATINGS from '../modules/class-ratings';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'WRatingsList:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// REACT FUNCTIONAL COMPONENT ////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function WRatingsList({
  // RatingsDef, // deprecated -- ratings are now burnt in.
  Mode,
  SelectedRating,
  // UpdateField, // deprecated -- ratings are now burnt in.
  OnRatingSelect
}) {
  const ratingsValues = RATINGS.getListOrder();
  return (
    <div className="WRatingsList">
      {ratingsValues.map(rating => (
        <div
          key={rating}
          className={`rating transparent ${SelectedRating === rating ? 'primary' : ''}`}
        >
          <WRatingButton
            rating={rating}
            isExpanded={true}
            disabled={SelectedRating === rating || Mode === 'inactive'}
            ratingLabel=""
            OnRatingButtonClick={OnRatingSelect}
          />
        </div>
      ))}
    </div>
  );
}

// Keep for reference
// If we need to restore the ability to edit the labels in the admin
// interface, we can use this code.
// class DEPRECATEDWRatingsList extends React.Component {
//   constructor(props) {
//     super(props);
//   }

//   componentDidMount() {}

//   componentWillUnmount() {}

//   render() {
//     const { SelectedRating, RatingsDef, Mode, UpdateField, OnRatingSelect } =
//       this.props;

//     let ratingsDef = RatingsDef;

//     return (
//       <div className="WRatingsList">
//         {ratingsDef.map(def => {
//           switch (Mode) {
//             case 'edit':
//               return (
//                 <div className="rating transparent" key={def.rating}>
//                   <div>{RATINGS.getIcon(def.rating)}</div>
//                   <input
//                     value={def.label}
//                     placeholder="Label"
//                     onChange={e => UpdateField(def.rating, e.target.value)}
//                   />
//                 </div>
//               );
//             case 'active':
//               return (
//                 <button
//                   className={`rating transparent ${SelectedRating === String(def.rating) ? 'primary' : ''}`}
//                   key={def.label}
//                   onClick={e => OnRatingSelect(e, def.rating)}
//                 >
//                   <div>{RATINGS.getIcon(def.rating)}</div>
//                   <div>{def.label}</div>
//                 </button>
//               );
//             case 'inactive':
//             default:
//               return (
//                 <div className="rating transparent" key={def.label}>
//                   <div>{RATINGS.getIcon(def.rating)}</div>
//                   <div>{def.label}</div>
//                 </div>
//               );
//           }
//         })}
//       </div>
//     );
//   }
// }

WRatingsList.propTypes = {
  SelectedRating: PropTypes.string, // optional
  // RatingsDef: PropTypes.array, // deprecated -- ratings are now burnt in.
  Mode: PropTypes.string,
  // UpdateField: PropTypes.func, // deprecated -- ratings are now burnt in.
  OnRatingSelect: PropTypes.func // optional
};

WRatingsList.defaultProps = {
  SelectedRating: '',
  // RatingsDef: [], // deprecated -- ratings are now burnt in.
  Mode: 'inactive',
  // UpdateField: () => { // deprecated -- ratings are now burnt in.
  //   console.error('Missing UpdateField handler');
  // },
  OnRatingSelect: () => {
    console.error('OnRatingSelect handler not defined (but optional)');
  }
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WRatingsList;
