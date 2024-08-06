/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Teacher Selector

Teachers use a groupId of 0.


\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import '../../../components/MEMEStyles.css';
import './WAdmTeacherSelector.css';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../../../system/ursys';
import SESSION from '../../../../system/common-session';
import ADM from '../../../modules/data';
import ADMObj from '../../../modules/adm-objects';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class WTeacherSelector extends React.Component {
  constructor(props) {
    super(props);
    this.DoADMDataUpdate = this.DoADMDataUpdate.bind(this);
    this.DoTeacherSelect = this.DoTeacherSelect.bind(this);
    this.OnTeacherSelect = this.OnTeacherSelect.bind(this);
    this.OnAddTeacherDialogClose = this.OnAddTeacherDialogClose.bind(this);
    this.OnAddTeacherName = this.OnAddTeacherName.bind(this);
    this.OnTeacherEdit = this.OnTeacherEdit.bind(this);

    UR.Subscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate);
    UR.Subscribe('TEACHER_SELECT', this.DoTeacherSelect);

    this.state = {
      teachers: [],
      selectedTeacherId: '',
      selectedTeacherName: '',
      addTeacherDialogOpen: false,
      updateExistingTeacher: false
    };
  }

  componentDidMount() {
    this.DoADMDataUpdate();
  }

  componentWillUnmount() {
    UR.Unsubscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate);
    UR.Unsubscribe('TEACHER_SELECT', this.DoTeacherSelect);
  }

  DoADMDataUpdate() {
    this.setState({ teachers: ADM.GetAllTeachers() });
  }

  // Called by TEACHER_SELECT
  DoTeacherSelect(data) {
    this.setState({
      selectedTeacherId: data.teacherId,
      selectedTeacherName: ADM.GetTeacher(data.teacherId).name
    });
  }

  // Called by User
  OnTeacherSelect(e) {
    let selectedTeacherId = Number(e.target.value);
    if (selectedTeacherId === 'new') {
      this.setState({
        selectedTeacherName: '',
        addTeacherDialogOpen: true,
        updateExistingTeacher: false
      });
    } else {
      ADM.SelectTeacher(selectedTeacherId);
    }
  }

  OnAddTeacherName(e) {
    e.preventDefault();
    e.stopPropagation();
    const name = this.state.selectedTeacherName;
    if (this.state.updateExistingTeacher) {
      const teacher = ADMObj.Teacher({
        id: this.state.selectedTeacherId,
        name
      });
      ADM.DB_UpdateTeacher(teacher);
    } else {
      ADM.DB_AddTeacher(name);
    }
    this.OnAddTeacherDialogClose();
  }

  OnAddTeacherDialogClose() {
    this.setState({ addTeacherDialogOpen: false });
  }

  OnTeacherEdit(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      addTeacherDialogOpen: true,
      updateExistingTeacher: true
    });
  }

  render() {
    const {
      teachers,
      selectedTeacherId,
      selectedTeacher,
      addTeacherDialogOpen,
      selectedTeacherName
    } = this.state;

    const DIALOG = addTeacherDialogOpen && (
      <div className="dialog">
        <form onSubmit={this.OnAddTeacherName}>
          <h3>Add Teacher</h3>
          <p>Add a teacher by name, e.g. "Ms. Brown"</p>
          <input
            autoFocus
            type="text"
            value={selectedTeacherName}
            onChange={e => this.setState({ selectedTeacherName: e.target.value })}
          />
          <div className="controlbar">
            <button onClick={this.OnAddTeacherDialogClose}>Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    );

    return (
      <div className="WAdmTeacherSelector dialog">
        <div>
          <h3>TEACHER</h3>
          <select value={selectedTeacherId} onChange={this.OnTeacherSelect}>
            <option value="">Select a Teacher</option>
            {teachers.map(teacher => (
              <option value={teacher.id} key={teacher.id}>
                {teacher.name} -{' '}
                {SESSION.MakeTeacherToken(teacher.name, {
                  groupId: 0,
                  teacherId: teacher.id
                })}
              </option>
            ))}
            <option value="new">Add New...</option>
          </select>
          &nbsp;
          <button onClick={this.OnTeacherEdit} disabled={selectedTeacherId === ''}>
            Edit
          </button>
        </div>
        {DIALOG}
      </div>
    );
  }
}

WTeacherSelector.propTypes = {
  classes: PropTypes.object
};

WTeacherSelector.defaultProps = {
  classes: {}
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WTeacherSelector;
