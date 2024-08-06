/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Criteria View

Unlike the other components, which send all data updates directly to ADM,
Criteria are editted locally first, and the whole set of changes is sent
to ADM after the user clicks "Save".  This removes the need to have to click
Save on every single edit.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import '../../../components/MEMEStyles.css';
import './WAdmCriteriaView.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
const IcnAdd = <FontAwesomeIcon icon={faPlus} />;

import PropTypes from 'prop-types';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../../../system/ursys';
import ADM from '../../../modules/data';
import WCriteriaList from './WAdmCriteriaList';

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'WAdminCriteriaView';
const defaults = [
  {
    label: 'Clarity',
    description: 'How clear is the explanation?'
  },
  {
    label: 'Visuals',
    description: 'Does the layout make sense?'
  }
];
/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class WCriteriaView extends React.Component {
  constructor(props) {
    super(props);
    this.DoClassroomSelect = this.DoClassroomSelect.bind(this);
    this.DoLoadCriteria = this.DoLoadCriteria.bind(this);
    this.OnEditClick = this.OnEditClick.bind(this);
    this.OnEditSave = this.OnEditSave.bind(this);
    this.OnEditCancel = this.OnEditCancel.bind(this);
    this.DoClose = this.DoClose.bind(this);
    this.OnAddClick = this.OnAddClick.bind(this);
    this.OnDeleteClick = this.OnDeleteClick.bind(this);
    this.UpdateField = this.UpdateField.bind(this);

    this.state = {
      criteria: [],
      isInEditMode: false,
      classroomId: -1
    };

    UR.Subscribe('CLASSROOM_SELECT', this.DoClassroomSelect);
    UR.Subscribe('ADM_DATA_UPDATED', this.DoLoadCriteria);
    UR.Subscribe('CRITERIA_SET_DEFAULTS', this.DoCreateDefaultCriteria);
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubscribe('CLASSROOM_SELECT', this.DoClassroomSelect);
    UR.Unsubscribe('ADM_DATA_UPDATED', this.DoLoadCriteria);
    UR.Unsubscribe('CRITERIA_SET_DEFAULTS', this.DoCreateDefaultCriteria);
  }

  DoClassroomSelect(data) {
    this.setState(
      {
        classroomId: Number(data.classroomId)
      },
      () => {
        this.DoLoadCriteria();
      }
    );
  }

  DoCreateDefaultCriteria(classroomId) {
    defaults.map(def => {
      ADM.DB_NewCriteria({
        classroomId: classroomId,
        label: def.label,
        description: def.description
      });
    });
  }

  DoLoadCriteria() {
    if (this.state.classroomId === -1) return;
    let criteria = ADM.GetCriteriaByClassroom(this.state.classroomId);
    this.setState({
      criteria
    });
  }

  OnEditClick() {
    this.DoLoadCriteria();
    this.setState({ isInEditMode: true });
  }

  OnEditSave(e) {
    ADM.DB_UpdateCriteriaList(this.state.criteria);
    this.DoClose();
  }

  OnEditCancel() {
    this.DoClose();

    /* Old Code
    // Restore original values.
    this.setState(state => {
      return { criteria: state.origCriteria }
    }, () => {

    });
    */
  }

  DoClose() {
    this.setState({
      isInEditMode: false
    });
  }

  OnAddClick() {
    ADM.DB_NewCriteria({}, () => this.setState({ isInEditMode: true }));

    /* old code
    this.setState(state => {
      let criteria = state.criteria;
      criteria.push(ADM.Criterion());
      return {
        criteria,
        isInEditMode: true
      };
    });
    */
  }

  OnDeleteClick(critId) {
    ADM.DB_CriteriaDelete(critId);

    // Old Code
    // this.setState(state => {
    //  const result = state.criteria.filter(crit => crit.id !== critId);
    //   return {
    //     criteria: result
    //   };
    // });
  }

  UpdateField(critId, fieldName, value, e) {
    // Save the changes locally first
    // Store the whole object when "Save" is presssed.
    this.setState(state => {
      let criteria = state.criteria;

      const i = criteria.findIndex(cr => cr.id === critId);
      if (i < 0) {
        console.error(
          PKG,
          'UpdateField could not find index of criteria with id',
          critId
        );
        return undefined;
      }

      // Update the value
      let crit = criteria[i];
      crit[fieldName] = value;

      // Update criteria data
      criteria.splice(i, 1, crit);
      return { criteria };
    });
  }

  render() {
    const { theme: classes } = this.props;
    const { criteria, isInEditMode, classroomId } = this.state;

    const DIALOG = (
      <div className="dialog">
        <h3>Edit Criteria</h3>
        <WCriteriaList
          Criteria={criteria}
          IsInEditMode={isInEditMode}
          UpdateField={this.UpdateField}
          OnDeleteCriteriaClick={this.OnDeleteClick}
        />
        <div className="controlbar">
          <button onClick={this.OnAddClick} hidden={!isInEditMode}>
            {IcnAdd}
          </button>
          <button onClick={this.OnEditCancel} hidden={!isInEditMode}>
            Close
          </button>
          <button onClick={this.OnEditSave} hidden={!isInEditMode}>
            Save
          </button>
        </div>
      </div>
    );

    return (
      <div className="WCriteriaView dialog">
        <h3>CRITERIA FOR A GOOD MODEL</h3>
        <WCriteriaList Criteria={criteria} IsInEditMode={false} />
        {isInEditMode && DIALOG}
        <button
          onClick={this.OnEditClick}
          disabled={classroomId === ''}
          hidden={isInEditMode}
        >
          Edit Criteria
        </button>
      </div>
    );
  }
}

WCriteriaView.propTypes = {
  classes: PropTypes.object
};

WCriteriaView.defaultProps = {
  classes: {}
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WCriteriaView;
