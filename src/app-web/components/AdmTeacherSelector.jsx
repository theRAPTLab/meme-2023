/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Teacher Selector

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
import MEMEStyles from './MEMEStyles';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class TeacherSelector extends React.Component {
  constructor(props) {
    super(props);
    this.HandleChange = this.HandleChange.bind(this);
  }

  componentDidMount() { }

  componentWillUnmount() { }

  HandleChange(e) {
    this.props.UpdateTeacher(e.target.value);
  }

  render() {
    const { classes } = this.props;
    return (
      <FormControl variant="outlined" className={classes.admTeacherSelector}>
        <InputLabel>TEACHER</InputLabel>
        <Select
          value={this.props.selectedTeacherId}
          onChange={this.HandleChange}
          input={<OutlinedInput name="teacher" id="teacher" />}
        >
          <MenuItem value="" />
          {this.props.teachers.map(teacher => (
            <MenuItem value={teacher.id} key={teacher.id}>
              {teacher.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
}

TeacherSelector.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
  selectedTeacherId: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  teachers: PropTypes.array,
  UpdateTeacher: PropTypes.func
};

TeacherSelector.defaultProps = {
  classes: {},
  selectedTeacherId: '',
  teachers: [],
  UpdateTeacher: () => {
    console.error('Missing UpdateRating Handler!');
  },
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(TeacherSelector);
