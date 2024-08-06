/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  GroupSelector

  Used by a teacher or administrator
  to select a target classroom or group
  for cloning or moving


  # Cloning

  If cloning:
  * Either a classroom and/or a group can be selected
  * Submit button displays "CLONE"


  # Moving

  If moving:
  * A groupId MUST be selected
  * Submit button displays "MOVE"

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import '../../../components/MEMEStyles.css';
import './WAdmGroupSelector.css';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../../../system/ursys';
/// MODULES ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import ADM from '../../../modules/data';
import SESSION from '../../../../system/common-session';

/// DEBUG CONTROL /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class WGroupSelector extends React.Component {
  // constructor
  constructor(props) {
    super();
    this.state = {
      selectedTeacherId: '',
      selectedClassroomId: '',
      selectedGroupId: ''
    };
    this.OnTeacherSelect = this.OnTeacherSelect.bind(this);
    this.OnClassroomSelect = this.OnClassroomSelect.bind(this);
    this.OnGroupSelect = this.OnGroupSelect.bind(this);
    this.OnSelect = this.OnSelect.bind(this);
  }

  componentDidMount() {}

  OnTeacherSelect(e) {
    this.setState({
      selectedTeacherId: Number(e.target.value)
    });
  }

  OnClassroomSelect(e) {
    this.setState({
      selectedClassroomId: Number(e.target.value)
    });
  }

  OnGroupSelect(e) {
    this.setState({
      selectedGroupId: Number(e.target.value)
    });
  }

  OnSelect() {
    const { selectedTeacherId, selectedClassroomId, selectedGroupId } = this.state;
    const data = { selectedTeacherId, selectedClassroomId, selectedGroupId };
    this.props.OnSelect(data);
  }

  render() {
    let { selectedTeacherId, selectedClassroomId, selectedGroupId } = this.state;
    const { open, type, OnClose } = this.props;
    const teachers = ADM.GetAllTeachers();
    if (selectedTeacherId === '') {
      // use the currently selected teacher if possible
      if (SESSION.IsTeacher()) {
        // logged in as teacher
        // When logged in as a teacher, ADM.GetTeacher does not work,
        // since it looks up the teacher by classroom.  But SESSION.LoggedInProps
        // has the teacherId saved.
        const lprops = SESSION.LoggedInProps();
        selectedTeacherId = lprops.teacherId;
      }
    }
    const classrooms = ADM.GetClassroomsByTeacher(selectedTeacherId);
    const groups = ADM.GetGroupsByClassroom(selectedClassroomId);

    return (
      open && (
        <div className="dialog-container">
          <div className="WGroupSelector">
            <h3>
              {type === 'clone'
                ? 'Clone Model to Classroom or Group'
                : 'Move Model to Classroom or Group'}
            </h3>
            <div className="menus">
              <div className="labelbox">
                <label>Teacher</label>
                <select value={selectedTeacherId} onChange={this.OnTeacherSelect}>
                  <option value=""> </option>
                  {teachers.map(teacher => (
                    <option value={teacher.id} key={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="labelbox">
                <label>Classroom</label>
                <select value={selectedClassroomId} onChange={this.OnClassroomSelect}>
                  <option value=""> </option>
                  {classrooms.map(classroom => (
                    <option value={classroom.id} key={classroom.id}>
                      {classroom.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="labelbox">
                <label>Group</label>
                <select value={selectedGroupId} onChange={this.OnGroupSelect}>
                  <option value=""> </option>
                  {groups.map(group => (
                    <option value={group.id} key={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              {type === 'clone'
                ? 'Leave "Group" unselected if you want to clone the model to every group in the class. Click "CLONE" when done.'
                : 'Please select both "Classroom" and "Group".  Click "MOVE" when done.'}
            </div>
            <div className="toolbar">
              <button onClick={OnClose}>Cancel</button>
              <button
                onClick={this.OnSelect}
                disabled={
                  type === 'clone'
                    ? selectedClassroomId === ''
                    : selectedGroupId === ''
                }
              >
                {type === 'clone' ? 'Clone' : 'Move'}
              </button>
            </div>
          </div>
        </div>
      )
    );
  }
}

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// required for UR EXEC phase filtering by view path
WGroupSelector.MOD_ID = __dirname;

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WGroupSelector;
