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
import '../../../components/MEMEStyles.css';
import './WAdmRatingsView.css';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../../../system/ursys';
import ADM from '../../../modules/data';
import ADMObj from '../../../modules/adm-objects';
import RATINGS from '../../../modules/class-ratings';
import WRatingsList from '../../../components/WRatingsList';

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'AdminRatingsView';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class WRatingsView extends React.Component {
  constructor(props) {
    super(props);
    this.DoClassroomSelect = this.DoClassroomSelect.bind(this);
    this.DoADMDataUpdate = this.DoADMDataUpdate.bind(this);
    this.DoLoadRatings = this.DoLoadRatings.bind(this);
    this.OnEditClick = this.OnEditClick.bind(this);
    this.OnSave = this.OnSave.bind(this);
    this.OnCancel = this.OnCancel.bind(this);
    // this.OnRevert = this.OnRevert.bind(this);
    this.DoClose = this.DoClose.bind(this);
    this.DoUpdateField = this.DoUpdateField.bind(this);

    this.state = {
      ratingsDef: [],
      origRatingsDef: [],
      isInEditMode: false,
      classroomId: -1
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
        classroomId: Number(data.classroomId)
      },
      () => {
        this.DoLoadRatings();
      }
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
      ratingsDef = RATINGS.getDefinitions();
      // Create defaults
      ratingsDefObj = ADMObj.RatingsDefinition({
        classroomId: this.state.classroomId,
        definitions: RATINGS.getDefinitions()
      });
      ADM.DB_RatingsAdd(this.state.classroomId, ratingsDefObj);
    } else {
      ratingsDef = ratingsDefObj.definitions;
    }

    // update state
    RATINGS.updateDefinitions(ratingsDef);

    const origRatingsDef = JSON.parse(JSON.stringify(ratingsDef)); // deep clone
    this.setState({
      ratingsDef,
      origRatingsDef
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
      state => {
        return { ratingsDef: state.origRatingsDef };
      },
      () => {
        this.DoClose();
      }
    );
  }

  // REVIEW: Revert doesn't revert immediately, but only after load
  // OnRevert() {
  //   const ratingsDef = RATINGS.getDefaultDefinitions();
  //   console.log('revert', ratingsDef);
  //   ADM.DB_RatingsUpdate(this.state.classroomId, ratingsDef);
  //   this.setState({ ratingsDef });
  //   this.DoClose();
  // }

  DoClose() {
    this.setState({ isInEditMode: false });
  }

  DoUpdateField(rating, label) {
    // Save the changes locally first
    // Store the whole object when "Save" is presssed.
    this.setState(state => {
      let ratingsDef = state.ratingsDef;

      const index = ratingsDef.findIndex(item => rating === item.rating);
      ratingsDef[index].label = label;

      return { ratingsDef };
    });
  }

  render() {
    const { ratingsDef, isInEditMode, classroomId } = this.state;

    const DIALOG = isInEditMode && (
      <div className="dialog-container">
        <div className="dialog">
          <h3>Edit Ratings Definitions</h3>
          <WRatingsList
            RatingsDef={ratingsDef}
            Mode={isInEditMode ? 'edit' : 'inactive'}
            UpdateField={this.DoUpdateField}
          />
          <div className="controlbar">
            {/* <button className="close" onClick={this.OnRevert}>
              Revert to Default
            </button> */}
            <button className="close" onClick={this.OnCancel} type="button">
              Cancel
            </button>
            <button className="primary" onClick={this.OnSave} type="submit">
              Save
            </button>
          </div>
        </div>
      </div>
    );

    return (
      <div className="WAdmRatingsView dialog">
        <h3>RATINGS DEFINITIONS</h3>
        <WRatingsList RatingsDef={ratingsDef} Mode="inactive" />
        <button
          className="edit"
          onClick={this.OnEditClick}
          hidden={isInEditMode || classroomId < 0}
        >
          Edit Ratings
        </button>
        {DIALOG}
      </div>
    );
  }
}

WRatingsView.propTypes = {};

WRatingsView.defaultProps = {};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WRatingsView;
