/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Ratings Dialog

The RatingsDialog is part of a positive/neutral/negative rating system.

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
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// Material UI Icons
import PositiveIcon from '@mui/icons-material/Add';
import NegativeIcon from '@mui/icons-material/Clear';
// Material UI Theming
import { withStyles } from '@mui/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from './MEMEStyles';
import UR from '../../system/ursys';
import DATA from '../modules/data';
import ADM from '../modules/data';
import RatingsList from './RatingsList';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'RatingsDialog:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class RatingsDialog extends React.Component {
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
      ratingsDef: [],
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
      ratingsDef: ADM.GetRatingsDefinition(classroomId),
    });
  }

  DoClose() {
    this.setState({
      isOpen: false,
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
    const { classes } = this.props;

    return (
      <Dialog open={isOpen} onClose={this.OnClose} maxWidth="xs">
        <DialogTitle>How well does this evidence support your model?</DialogTitle>
        <DialogContent style={{ paddingBottom: '2em' }}>
          <RatingsList
            RatingsDef={ratingsDef}
            Mode="active"
            SelectedRating={selectedRating}
            UpdateField={this.DoUpdateField}
            OnRatingSelect={this.OnRatingSelect}
          />
        </DialogContent>
      </Dialog>
    );
  }
}

RatingsDialog.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
};

RatingsDialog.defaultProps = {
  classes: {},
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(RatingsDialog);
