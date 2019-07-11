/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Classrooms Selector

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Select from '@material-ui/core/Select';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from '../../components/MEMEStyles';
import UR from '../../../system/ursys';
import ADM from '../../modules/adm-data';

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class ClassroomsSelector extends React.Component {
  constructor(props) {
    super(props);

    this.DoTeacherSelect = this.DoTeacherSelect.bind(this);
    this.OnClassroomSelect = this.OnClassroomSelect.bind(this);

    UR.Sub('TEACHER_SELECT', this.DoTeacherSelect);

    this.state = {
      classrooms: [],
      selectedClassroomId: ''
    };
  }

  componentDidMount() { }

  componentWillUnmount() { }

  DoTeacherSelect(data) {
    if (DBG) console.log('AdmClassroomsSelector: loading classrooms with teacher', data.teacherId);
    this.setState({
      classrooms: ADM.GetClassroomsByTeacher(data.teacherId)
    });
    this.DoClassroomSelect(''); // When a teacher is selected, clear the classroom selection
  }

  // Update the state and inform subscribers (groupList, models, criteria, resources
  DoClassroomSelect(classroomId) {
    if (DBG) console.log('AdmClassroomsSelector: Setting classroom to',classroomId);
    this.setState({ selectedClassroomId: classroomId });
    UR.Publish('CLASSROOM_SELECT', { classroomId });
  }

  // User has selected a classroom from the dropdown menu
  OnClassroomSelect(e) {
    let classroomId = e.target.value;
    if (classroomId === 'new') {
      alert('"Add New" not implemented yet!');
    } else {
      ADM.SelectClassroom(classroomId);
      this.DoClassroomSelect(classroomId);
    }
  }

  render() {
    const { classes } = this.props;
    const { classrooms, selectedClassroomId } = this.state;
    return (
      <Paper className={classes.admPaper}>
        <FormControl variant="outlined" className={classes.admTeacherSelector}>
          <InputLabel>CLASSROOMS</InputLabel>
          <Select
            value={selectedClassroomId}
            onChange={this.OnClassroomSelect}
            input={<OutlinedInput name="classroom" id="classroom" labelWidth={120} />}
          >
            {classrooms.map(classroom => (
              <MenuItem value={classroom.id} key={classroom.id}>
                {classroom.name}
              </MenuItem>
            ))}
            <MenuItem value="new">
              <i>Add New...</i>
            </MenuItem>
          </Select>
        </FormControl>
      </Paper>
    );
  }
}

ClassroomsSelector.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object
};

ClassroomsSelector.defaultProps = {
  classes: {}
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(ClassroomsSelector);
