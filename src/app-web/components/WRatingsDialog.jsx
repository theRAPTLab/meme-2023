/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Ratings Dialog

The WRatingsDialog is part of a positive/neutral/negative rating system.

RatingsDialog displays a dialog showing the available types of ratings and
lets the user select a rating.

It is opened via an URSYS call, e.g.
    const data = {
      evId: this.props.evlink.evId,
      rating: this.props.evlink.rating
    };
    UR.Publish('RATING:OPEN', data);


\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import './MEMEStyles.css';
import './WRatingsDialog.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
const ICNXmark = <FontAwesomeIcon icon={faXmark} />;

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../system/ursys';
import DATA from '../modules/data';
import ADM from '../modules/data';
import WRatingsList from './WRatingsList';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'WRatingsDialog:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class WRatingsDialog extends React.Component {
  constructor(props) {
    super(props);
    this.DoOpen = this.DoOpen.bind(this);
    this.DoClose = this.DoClose.bind(this);
    this.OnClose = this.OnClose.bind(this);
    this.OnRatingSelect = this.OnRatingSelect.bind(this);

    this.state = {
      isOpen: false,
      evId: '',
      selectedRating: '',
      ratingsDef: []
    };

    UR.Subscribe('RATING_OPEN', this.DoOpen);
    UR.Subscribe('RATING_CLOSE', this.DoClose); // used by ViewMain to force close Ratings when the main window is closing
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubscribe('RATING_OPEN', this.OnOpen);
    UR.Unsubscribe('RATING_CLOSE', this.DoClose);
  }

  DoOpen(data) {
    const classroomId = ADM.GetSelectedClassroomId();
    this.setState({
      evId: data.evId,
      selectedRating: String(data.rating),
      isOpen: true,
      ratingsDef: ADM.GetRatingsDefinition(classroomId)
    });
  }

  DoClose() {
    this.setState({
      isOpen: false
    });
  }

  OnClose() {
    this.DoClose();
  }

  OnRatingSelect(e, rating) {
    DATA.SetEvidenceLinkRating(this.state.evId, rating);
    this.DoClose();
  }

  render() {
    const { isOpen, ratingsDef, selectedRating } = this.state;

    return (
      isOpen && (
        <div className="dialog-container">
          <div className="WRatingsDialog">
            <button className="close" onClick={this.OnClose}>
              {ICNXmark}
            </button>
            <h3>How well does this evidence support your model?</h3>
            <WRatingsList
              RatingsDef={ratingsDef}
              Mode="active"
              SelectedRating={selectedRating}
              UpdateField={this.DoUpdateField}
              OnRatingSelect={this.OnRatingSelect}
            />
          </div>
        </div>
      )
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WRatingsDialog;
