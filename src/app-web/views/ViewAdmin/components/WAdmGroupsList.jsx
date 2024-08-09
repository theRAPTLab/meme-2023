/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Groups List View

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import '../../../components/MEMEStyles.css';
import './WAdmGroupsList.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
const IcnClose = <FontAwesomeIcon icon={faXmark} />;

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../../../system/ursys';
import ADM from '../../../modules/data';

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class WGroupsList extends React.Component {
  constructor(props) {
    super(props);
    this.DoClassroomSelect = this.DoClassroomSelect.bind(this);
    this.DoADMDataUpdate = this.DoADMDataUpdate.bind(this);
    this.OnAddGroupClick = this.OnAddGroupClick.bind(this);
    this.OnAddGroupName = this.OnAddGroupName.bind(this);
    this.OnAddGroupDialogClose = this.OnAddGroupDialogClose.bind(this);
    this.OnAddStudentClick = this.OnAddStudentClick.bind(this);
    this.OnDeleteStudent = this.OnDeleteStudent.bind(this);
    this.OnAddStudentName = this.OnAddStudentName.bind(this);
    this.OnAddStudentDialogClose = this.OnAddStudentDialogClose.bind(this);
    this.OnUpdateAddStudentName = this.OnUpdateAddStudentName.bind(this);
    this.OnGroupEdit = this.OnGroupEdit.bind(this);

    this.state = {
      groups: [],
      addGroupDialogOpen: false,
      addGroupDialogName: '',
      selectedGroupId: '',
      addStudentDialogOpen: false,
      addStudentDialogGroupId: '',
      addStudentDialogName: '',
      addStudentDialogInvalidMsg: '',
      classroomId: '',
      editExistingGroup: false
    };

    UR.Subscribe('CLASSROOM_SELECT', this.DoClassroomSelect);
    UR.Subscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate); // Broadcast when a group is added.
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubscribe('CLASSROOM_SELECT', this.DoClassroomSelect);
    UR.Unsubscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate);
  }

  DoClassroomSelect(data) {
    if (DBG) console.log('AdmGroupsList: DoClassroomSelect', data);
    if (data && data.classroomId) {
      this.setState({
        groups: ADM.GetGroupsByClassroom(data.classroomId),
        classroomId: data.classroomId
      });
    } else {
      this.setState({
        groups: [],
        classroomId: ''
      });
    }
  }

  // Update the groups list from ADMData in case a new group was added
  DoADMDataUpdate() {
    const classroomId = this.state.classroomId;
    if (classroomId) {
      this.setState({
        groups: ADM.GetGroupsByClassroom(classroomId)
      });
    }
  }

  OnAddGroupClick(e) {
    this.setState({
      addGroupDialogOpen: true,
      addGroupDialogName: '',
      editExistingGroup: false
    });
  }

  OnAddGroupName(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.editExistingGroup) {
      ADM.DB_UpdateGroup(this.state.selectedGroupId, {
        name: this.state.addGroupDialogName
      });
    } else {
      ADM.DB_AddGroup(this.state.addGroupDialogName);
    }
    this.OnAddGroupDialogClose();
  }

  OnAddGroupDialogClose() {
    this.setState({ addGroupDialogOpen: false });
  }

  OnAddStudentClick(e, groupId) {
    this.setState({
      addStudentDialogOpen: true,
      addStudentDialogGroupId: groupId
    });
  }

  OnDeleteStudent(e, groupId, student) {
    if (DBG) console.log('AdmGroupsList: Deleting student', student);
    ADM.DeleteStudent(groupId, student);
  }

  OnAddStudentName(e) {
    e.preventDefault();
    e.stopPropagation();
    const names = this.state.addStudentDialogName.split(',').map(name => name.trim());
    ADM.AddStudents(this.state.addStudentDialogGroupId, names);
    this.OnAddStudentDialogClose();
  }

  OnAddStudentDialogClose() {
    this.setState({ addStudentDialogOpen: false });
  }

  CheckForMinimumLength(names) {
    let namesArr = names.split(',');
    let invalidNamesArr = namesArr.filter(name => {
      return name.trim().length < 3;
    });
    return invalidNamesArr.length > 0 ? invalidNamesArr.join(', ') : [];
  }

  CheckForDuplicates(names) {
    const { addStudentDialogGroupId } = this.state;
    const studentsInGroup = ADM.GetGroup(addStudentDialogGroupId).students;
    const caseInsensitiveStudentsInGroup = studentsInGroup.map(student =>
      student.toLowerCase()
    );
    let namesArr = names.split(',');
    let duplicateNamesArr = namesArr.filter(name => {
      return caseInsensitiveStudentsInGroup.includes(name.trim().toLowerCase());
    });
    return duplicateNamesArr.length > 0 ? duplicateNamesArr.join(', ') : [];
  }

  OnUpdateAddStudentName(e) {
    // Check for duplicates
    const invalidNames = this.CheckForMinimumLength(e.target.value);
    const duplicateNames = this.CheckForDuplicates(e.target.value);
    let addStudentDialogInvalidMsg =
      invalidNames.length > 0
        ? `Names need to have at least three letters: ${invalidNames}.\n`
        : '';
    addStudentDialogInvalidMsg +=
      duplicateNames.length > 0
        ? `${duplicateNames} is already in this group.  Please use a unique name.`
        : '';
    this.setState({
      addStudentDialogName: e.target.value,
      addStudentDialogInvalidMsg
    });
  }

  OnGroupEdit(e, groupId) {
    e.preventDefault();
    e.stopPropagation();
    const group = ADM.GetGroup(groupId);
    this.setState({
      addGroupDialogName: group.name,
      addGroupDialogOpen: true,
      selectedGroupId: groupId,
      editExistingGroup: true
    });
  }

  render() {
    const {
      groups,
      addGroupDialogOpen,
      addGroupDialogName,
      addStudentDialogOpen,
      addStudentDialogName,
      addStudentDialogInvalidMsg,
      classroomId
    } = this.state;
    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const DIALOG_ADD_GROUP = addGroupDialogOpen && (
      <div className="dialog-container">
        <div className="dialog">
          <form onSubmit={this.OnAddGroupName}>
            <h3>Add Group</h3>
            <label>
              Group Name:&nbsp;
              <input
                autoFocus
                type="text"
                value={addGroupDialogName}
                onChange={e => this.setState({ addGroupDialogName: e.target.value })}
              />
            </label>
            <div className="controlbar">
              <button onClick={this.OnAddGroupDialogClose}>Cancel</button>
              <button className="primary" type="submit">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const DIALOG_ADD_STUDENT = addStudentDialogOpen && (
      <div className="dialog-container">
        <div className="dialog">
          <form onSubmit={this.OnAddStudentName}>
            <h3>Add Student(s)</h3>
            <p>
              Add a student first name, or add multiple students separated by a comma.
              Please use first names only. (e.g. 'Bob, Brianna, Brenda'). Student
              names need to have at least three letters.
            </p>
            <label>
              Name(s):&nbsp;
              <input
                autoFocus
                type="text"
                value={addStudentDialogName}
                onChange={this.OnUpdateAddStudentName}
              />
            </label>
            {addStudentDialogInvalidMsg && (
              <p className="error">{addStudentDialogInvalidMsg}</p>
            )}
            <div className="controlbar">
              <button onClick={this.OnAddStudentDialogClose}>Cancel</button>
              <button
                className="primary"
                type="submit"
                disabled={addStudentDialogInvalidMsg !== ''}
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    );
    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    return (
      <div className="WAdmGroupsList dialog">
        <h3>GROUPS</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>STUDENTS</th>
              <th>TOKENS</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(group => (
              <tr key={group.id}>
                <td>{group.id}</td>
                <td>
                  {group.name}
                  &nbsp;
                  <button
                    className="transparent"
                    onClick={e => this.OnGroupEdit(e, group.id)}
                  >
                    Edit
                  </button>
                </td>
                <td className="students">
                  &nbsp;
                  {group.students.map((student, i) => {
                    return (
                      <div className="chip" key={group.id + student}>
                        {student}
                        &nbsp;&nbsp;
                        <button
                          className="sm"
                          onClick={e => this.OnDeleteStudent(e, group.id, student)}
                        >
                          {IcnClose}
                        </button>
                      </div>
                    );
                  })}
                  &nbsp;
                  <button
                    className="transparent"
                    onClick={e => this.OnAddStudentClick(e, group.id)}
                  >
                    Add
                  </button>
                </td>
                <td>
                  <textarea
                    readOnly
                    rows={group.students.length}
                    style={{ fontFamily: 'monospace' }}
                    value={group.students.reduce(
                      (accumulator, student) =>
                        accumulator + ADM.GetToken(group.id, student),
                      '' // initialValue to force start at index=0
                    )}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={this.OnAddGroupClick} disabled={classroomId === ''}>
          Add Group
        </button>
        {DIALOG_ADD_GROUP}
        {DIALOG_ADD_STUDENT}
      </div>
    );
  }
}

WGroupsList.propTypes = {};

WGroupsList.defaultProps = {};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WGroupsList;
