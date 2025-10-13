/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Classrooms Selector

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import '../../../components/MEMEStyles.css';
import './WAdmClassroomsSelector.css';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../../../system/ursys';
import ADM from '../../../modules/data';
import ASET from '../../../modules/adm-settings';

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class WClassroomsSelector extends React.Component {
  constructor(props) {
    super(props);

    this.DoADMDataUpdate = this.DoADMDataUpdate.bind(this);
    this.DoTeacherSelect = this.DoTeacherSelect.bind(this);
    this.DoClassroomSelect = this.DoClassroomSelect.bind(this);
    this.OnClassroomSelect = this.OnClassroomSelect.bind(this);
    this.OnClassroomUnitSelect = this.OnClassroomUnitSelect.bind(this);
    this.OnAddClasssroom = this.OnAddClasssroom.bind(this);
    this.OnClassesModelsVisibilityChange =
      this.OnClassesModelsVisibilityChange.bind(this);
    this.OnAddClassroomDialogClose = this.OnAddClassroomDialogClose.bind(this);
    this.OnClassroomEdit = this.OnClassroomEdit.bind(this);
    this.OnReloadUnits = this.OnReloadUnits.bind(this);

    UR.Subscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate);
    UR.Subscribe('TEACHER_SELECT', this.DoTeacherSelect);
    UR.Subscribe('CLASSROOM_SELECT', this.DoClassroomSelect);

    this.state = {
      selectedTeacherId: '',
      selectedClassroomId: '',
      selectedClassroomName: '',
      selectedClassroomUnitId: '',
      addClassroomDialogOpen: false,
      updateExistingClassroom: false,
      canViewOthers: false
    };
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate);
    UR.Unsubscribe('TEACHER_SELECT', this.DoTeacherSelect);
    UR.Unsubscribe('CLASSROOM_SELECT', this.DoClassroomSelect);
  }

  DoADMDataUpdate(data) {
    if (DBG) console.log('WAdmClassroomsSelector: ADM_DATA_UPDATED', data);

    // If selected unit is no longer valid trigger a save
    const unitId = ADM.GetClassroomSelectedUnitId(this.state.selectedClassroomId);
    if (unitId !== this.state.selectedClassroomUnitId) {
      // unitId has changed, update it, force database update
      this.OnClassroomUnitSelect({ target: { value: unitId } });
    }

    this.setState({
      selectedClassroomUnitId: unitId,
      canViewOthers: ADM.CanViewOthers()
    });
  }

  // Called by TEACHER_SELECT
  DoTeacherSelect(data) {
    const selectedTeacher = ADM.GetTeacher(data.teacherId);
    this.setState({ selectedTeacherId: data.teacherId });
  }

  // Update the state and inform subscribers (groupList, models, criteria, resources
  // {classroomId}
  DoClassroomSelect(data) {
    if (DBG) console.log('AdmClassroomsSelector: Setting classroom to', data);
    const classroom = ADM.GetClassroom(data.classroomId);
    if (classroom) {
      classroom.canViewOthers = classroom.canViewOthers || false; // clean data to prevent props error
      this.setState({
        selectedClassroomId: classroom.id,
        selectedClassroomName: classroom.name,
        selectedClassroomUnitId: classroom.unitId,
        canViewOthers: classroom.canViewOthers
      });
    } else {
      // clear if no classroom is defined
      this.setState({
        selectedClassroomId: '',
        selectedClassroomName: '',
        selectedClassroomUnitId: ''
      });
    }
  }

  // User has selected a classroom from the dropdown menu
  OnClassroomSelect(e) {
    let classroomId = e.target.value;
    if (classroomId === 'new') {
      this.setState({
        selectedClassroomName: '',
        selectedClassroomUnitId: '',
        addClassroomDialogOpen: true,
        updateExistingClassroom: false
      });
    } else {
      ADM.SelectClassroom(Number(classroomId));
    }
  }

  OnClassroomUnitSelect(e) {
    const unitId = e.target.value;
    this.setState({ selectedClassroomUnitId: unitId });
    ADM.SelectUnit(this.state.selectedClassroomId, unitId);
  }

  OnAddClasssroom(e) {
    e.preventDefault();
    e.stopPropagation();
    let name = this.state.selectedClassroomName;
    if (this.state.updateExistingClassroom) {
      const classroomData = {
        id: this.state.selectedClassroomId,
        name
      };
      ADM.DB_UpdateClassroom(this.state.selectedClassroomId, classroomData);
    } else {
      ADM.DB_AddClassroom(name);
    }
    this.OnAddClassroomDialogClose();
  }

  OnClassesModelsVisibilityChange(e) {
    console.log('checked', e.target.value, e.target, this.state.canViewOthers);
    ADM.DB_UpdateClassroom(this.state.selectedClassroomId, {
      canViewOthers: !this.state.canViewOthers
      // orig
      // canViewOthers: e.target.checked
    });
  }

  OnAddClassroomDialogClose() {
    this.setState({ addClassroomDialogOpen: false });
  }

  OnClassroomEdit(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      addClassroomDialogOpen: true,
      updateExistingClassroom: true
    });
  }

  OnReloadUnits() {
    UR.NetCall('NET:SRV_RELOAD_UNITS', {}).then(response => {
      if (response.success) {
        if (DBG) console.log('Units reloaded:', response.unitIds);
      } else {
        console.error('Failed to reload units');
      }
    });
  }

  render() {
    const {
      selectedTeacherId,
      selectedClassroomId,
      selectedClassroomName,
      selectedClassroomUnitId,
      addClassroomDialogOpen,
      canViewOthers
    } = this.state;

    const DIALOG = addClassroomDialogOpen && (
      <div className="dialog">
        <h3>ADD CLASSROOM</h3>
        <p>Add a classroom by name, e.g. "Period 1" or "Science 1A"</p>
        <form onSubmit={this.OnAddClasssroom}>
          <input
            autoFocus
            type="text"
            value={selectedClassroomName}
            onChange={e => this.setState({ selectedClassroomName: e.target.value })}
          />
          <div className="controlbar">
            <button onClick={this.OnAddClassroomDialogClose} type="button">
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    );

    const UNITS = ADM.GetUnitsList();
    const UNIT_SELECTOR = (
      <div>
        <select
          value={selectedClassroomUnitId}
          onChange={this.OnClassroomUnitSelect}
          className="select"
          disabled={selectedTeacherId === '' || selectedClassroomId === ''}
        >
          <option value="">Select a Unit</option>
          {UNITS.map(unit => (
            <option key={unit.id} value={unit.id}>
              {unit.label}
            </option>
          ))}
        </select>
        &nbsp; unit <i className="help"> newly-created models will use this unit</i>
      </div>
    );

    const classrooms = ADM.GetClassroomsByTeacher(ASET.selectedTeacherId);
    return (
      <div className="WAdmClassroomsSelector dialog">
        <h3>CLASSROOMS</h3>
        <div>
          <select
            value={selectedClassroomId}
            onChange={this.OnClassroomSelect}
            className="select"
            disabled={selectedTeacherId === ''}
          >
            <option value="">Select a Classroom</option>
            {classrooms.map(classroom => (
              <option value={classroom.id} key={classroom.id}>
                {classroom.name}
              </option>
            ))}
            <option value="new">Add New...</option>
          </select>
          &nbsp;
          <button
            onClick={this.OnClassroomEdit}
            disabled={selectedClassroomId === ''}
          >
            Edit
          </button>
        </div>
        {UNIT_SELECTOR}
        <br />
        <div>
          <button
            type="button"
            role="switch"
            aria-checked={canViewOthers}
            id="direction-switch"
            className="switch"
            onClick={this.OnClassesModelsVisibilityChange}
            disabled={selectedClassroomId === ''}
          >
            <span aria-hidden="true">Hide</span>
            <span aria-hidden="true">Show</span>
          </button>
          &nbsp;
          <i className="help">Students can view class' models?</i>
        </div>
        <br />
        <div>
          <button type="button" className="med" onClick={this.OnReloadUnits}>
            Reload Units
          </button>
          <i className="help">
            &nbsp;Force reload of ALL units after adding/updating unit definitions
          </i>
          <p className="help danger">
            Be careful reloading units. Removing unit parameters can lead to corrupted
            projects.
          </p>
        </div>
        {DIALOG}
      </div>
    );
  }
}

WClassroomsSelector.propTypes = {};

WClassroomsSelector.defaultProps = {};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WClassroomsSelector;
