/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Classrooms List View

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Select from '@material-ui/core/Select';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from '../../components/MEMEStyles';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class ClassroomsList extends React.Component {
  constructor(props) {
    super(props);
    this.HandleChange = this.HandleChange.bind(this);
  }

  componentDidMount() { }

  componentWillUnmount() { }

  HandleChange(e) {
    if (e.target.value === 'new') {
      alert('"Add New" not implemented yet!');
    } else {
      this.props.UpdateClassroom(e.target.value);
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <FormControl variant="outlined" className={classes.admTeacherSelector}>
        <InputLabel>CLASSROOMS</InputLabel>
        <Select
          value={this.props.selectedClassroomId}
          onChange={this.HandleChange}
          input={<OutlinedInput name="classroom" id="classroom" labelWidth={120} />}
        >
          {this.props.classrooms.map(classroom => (
            classroom.teacherId === this.props.selectedTeacherId ? (
              <MenuItem value={classroom.id} key={classroom.id}>
                {classroom.name}
              </MenuItem>
            ) : (
              ''
            )
          ))}
          <MenuItem value="new">
            <i>Add New...</i>
          </MenuItem>
        </Select>
      </FormControl>
    );
  }
}

ClassroomsList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
  selectedTeacherId: PropTypes.string,
  selectedClassroomId: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  classrooms: PropTypes.array,
  UpdateClassroom: PropTypes.func
};

ClassroomsList.defaultProps = {
  classes: {},
  selectedTeacherId: '',
  selectedClassroomId: '',
  classrooms: [],
  UpdateClassroom: () => {
    console.error('Missing UpdateClassroom Handler!');
  },
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(ClassroomsList);
