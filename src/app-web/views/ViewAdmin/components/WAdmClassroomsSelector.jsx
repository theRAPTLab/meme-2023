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

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class WClassroomsSelector extends React.Component {
  constructor(props) {
    super(props);

    this.DoADMDataUpdate = this.DoADMDataUpdate.bind(this);
    this.DoClassroomListUpdate = this.DoClassroomListUpdate.bind(this);
    this.DoTeacherSelect = this.DoTeacherSelect.bind(this);
    this.DoClassroomSelect = this.DoClassroomSelect.bind(this);
    this.OnClassroomSelect = this.OnClassroomSelect.bind(this);
    this.OnAddClasssroomName = this.OnAddClasssroomName.bind(this);
    this.OnClassesModelsVisibilityChange =
      this.OnClassesModelsVisibilityChange.bind(this);
    this.OnAddClassroomDialogClose = this.OnAddClassroomDialogClose.bind(this);
    this.OnClassroomEdit = this.OnClassroomEdit.bind(this);

    UR.Subscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate);
    UR.Subscribe('TEACHER_SELECT', this.DoTeacherSelect);
    UR.Subscribe('CLASSROOM_SELECT', this.DoClassroomSelect);

    this.state = {
      classrooms: [],
      selectedClassroomId: '',
      selectedClassroomName: '',
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
    this.DoClassroomListUpdate();
    this.setState({
      canViewOthers: ADM.CanViewOthers()
    });
  }

  DoClassroomListUpdate() {
    const classrooms = ADM.GetClassroomsByTeacher();
    const selectedClassroomId =
      classrooms && classrooms.length > 0 ? classrooms[0].id : '';
    this.setState({ classrooms }, () => ADM.SelectClassroom(selectedClassroomId));
  }

  DoTeacherSelect(data) {
    if (DBG)
      console.log(
        'AdmClassroomsSelector: loading classrooms with teacher',
        data.teacherId
      );
    this.DoClassroomListUpdate(data.teacherId);
    ADM.SelectClassroom('');
  }

  // Update the state and inform subscribers (groupList, models, criteria, resources
  DoClassroomSelect(data) {
    if (DBG) console.error('AdmClassroomsSelector: Setting classroom to', data);
    const classroom = ADM.GetClassroom(data.classroomId);
    if (classroom) {
      classroom.canViewOthers = classroom.canViewOthers || false; // clean data to prevent props error
      this.setState({
        selectedClassroomId: classroom.id,
        selectedClassroomName: classroom.name,
        canViewOthers: classroom.canViewOthers
      });
    }
  }

  // User has selected a classroom from the dropdown menu
  OnClassroomSelect(e) {
    let classroomId = e.target.value;
    if (classroomId === 'new') {
      this.setState({
        selectedClassroomName: '',
        addClassroomDialogOpen: true,
        updateExistingClassroom: false
      });
    } else {
      ADM.SelectClassroom(Number(classroomId));
    }
  }

  OnAddClasssroomName(e) {
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

  render() {
    const {
      classrooms,
      selectedClassroomId,
      selectedClassroomName,
      addClassroomDialogOpen,
      canViewOthers
    } = this.state;

    const DIALOG = addClassroomDialogOpen && (
      <div className="dialog">
        <h3>ADD CLASSROOM</h3>
        <p>Add a classroom by name, e.g. "Period 1" or "Science 1A"</p>
        <form onSubmit={this.OnAddClasssroomName}>
          <input
            autoFocus
            type="text"
            value={selectedClassroomName}
            onChange={e => this.setState({ selectedClassroomName: e.target.value })}
          />
          <div className="controlbar">
            <button onClick={this.OnAddClassroomDialogClose}>Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    );

    return (
      <div className="WAdmClassroomsSelector dialog">
        <h3>CLASSROOMS</h3>
        <div>
          <select
            value={selectedClassroomId}
            onChange={this.OnClassroomSelect}
            className="select"
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
          <label>Students can view class' models?</label>
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
