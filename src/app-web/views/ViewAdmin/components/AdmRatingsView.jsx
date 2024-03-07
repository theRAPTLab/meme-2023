/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Ratings View

Unlike the other components, which send all data updates directly to ADM,
Ratings are editted locally first, and the whole set of changes is sent
to ADM after the user clicks "Save".  This is necessary to let users "Cancel"
out of a criteria edit to revert to the previous state.

We also do things this way so that you can edit all of the items at the same
time rather than having to individually select and save each edit.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
// Material UI Theming
import { withTheme } from 'styled-components';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from '../../../components/MEMEStyles';
import UR from '../../../../system/ursys';
import ADM from '../../../modules/data';
import ADMObj from '../../../modules/adm-objects';
import RatingsList from '../../../components/RatingsList';

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'AdminRatingsView';

const defaults = [
  { label: 'Rocks!!', rating: 3 },
  { label: 'Medium support', rating: 2 },
  { label: 'Weak support', rating: 1 },
  { label: 'Not rated / Irrelevant', rating: 0 },
  { label: 'Disagrees a little', rating: -1 },
  { label: 'Kinda disagrees!', rating: -2 },
  { label: 'Really disagrees!', rating: -3 },
];

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class RatingsView extends React.Component {
  constructor(props) {
    super(props);
    this.DoClassroomSelect = this.DoClassroomSelect.bind(this);
    this.DoADMDataUpdate = this.DoADMDataUpdate.bind(this);
    this.DoLoadRatings = this.DoLoadRatings.bind(this);
    this.OnEditClick = this.OnEditClick.bind(this);
    this.OnSave = this.OnSave.bind(this);
    this.OnCancel = this.OnCancel.bind(this);
    this.DoClose = this.DoClose.bind(this);
    this.DoUpdateField = this.DoUpdateField.bind(this);

    this.state = {
      ratingsDef: [],
      origRatingsDef: [],
      isInEditMode: false,
      classroomId: -1,
    };

    UR.Subscribe('CLASSROOM_SELECT', this.DoClassroomSelect);
    UR.Subscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate);
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubscribe('CLASSROOM_SELECT', this.DoClassroomSelect);
    UR.Unsubscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate);
  }

  DoClassroomSelect(data) {
    this.setState(
      {
        classroomId: Number(data.classroomId),
      },
      () => {
        this.DoLoadRatings();
      },
    );
  }

  DoADMDataUpdate() {
    this.DoLoadRatings();
  }

  DoLoadRatings() {
    if (this.state.classroomId === -1) return;

    let ratingsDefObj = ADM.GetRatingsDefinitionObject(this.state.classroomId);
    let ratingsDef;
    if (ratingsDefObj === undefined) {
      ratingsDef = defaults;
      // Create defaults
      ratingsDefObj = ADMObj.RatingsDefinition({
        classroomId: this.state.classroomId,
        definitions: defaults,
      });
      ADM.DB_RatingsAdd(this.state.classroomId, ratingsDefObj);
    } else {
      ratingsDef = ratingsDefObj.definitions;
    }
    const origRatingsDef = JSON.parse(JSON.stringify(ratingsDef)); // deep clone
    this.setState({
      ratingsDef,
      origRatingsDef,
    });
  }

  OnEditClick() {
    this.DoLoadRatings();
    this.setState({ isInEditMode: true });
  }

  OnSave(e) {
    ADM.DB_RatingsUpdate(this.state.classroomId, this.state.ratingsDef);
    this.DoClose();
  }

  OnCancel() {
    // Restore original values.
    this.setState(
      (state) => {
        return { ratingsDef: state.origRatingsDef };
      },
      () => {
        this.DoClose();
      },
    );
  }

  DoClose() {
    this.setState({
      isInEditMode: false,
    });
  }

  DoUpdateField(rating, label) {
    // Save the changes locally first
    // Store the whole object when "Save" is presssed.
    this.setState((state) => {
      let ratingsDef = state.ratingsDef;

      const index = ratingsDef.findIndex((item) => rating === item.rating);
      ratingsDef[index].label = label;

      return { ratingsDef };
    });
  }

  render() {
    const { theme: classes } = this.props;
    const { ratingsDef, isInEditMode, classroomId } = this.state;

    return (
      <Paper style={classes.admPaper}>
        <InputLabel>RATINGS DEFINITIONS</InputLabel>
        <Dialog open={isInEditMode}>
          <DialogTitle>Edit Ratings Definitions</DialogTitle>
          <DialogContent>
            <RatingsList
              RatingsDef={ratingsDef}
              Mode={isInEditMode ? 'edit' : 'inactive'}
              UpdateField={this.DoUpdateField}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              className={classes.button}
              onClick={this.OnCancel}
              hidden={!isInEditMode}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              className={classes.button}
              onClick={this.OnSave}
              hidden={!isInEditMode}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <RatingsList RatingsDef={ratingsDef} Mode="inactive" />
        <Button
          variant="contained"
          className={classes.button}
          onClick={this.OnEditClick}
          hidden={isInEditMode}
          disabled={classroomId === ''}
        >
          Edit Ratings
        </Button>
      </Paper>
    );
  }
}

RatingsView.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
};

RatingsView.defaultProps = {
  classes: {},
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withTheme(RatingsView);
