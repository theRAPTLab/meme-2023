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

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class ClassroomsSelector extends React.Component {
  constructor(props) {
    super(props);
    this.OnClassroomSelect = this.OnClassroomSelect.bind(this);
  }

  componentDidMount() { }

  componentWillUnmount() { }

  OnClassroomSelect(e) {
    if (e.target.value === 'new') {
      alert('"Add New" not implemented yet!');
    } else {
      UR.Publish('CLASSROOM_SELECT', { classroomId: e.target.value });
    }
  }

  render() {
    const { selectedTeacherId, selectedClassroomId, classrooms, classes } = this.props;
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
              classroom.teacherId === selectedTeacherId ? (
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
      </Paper>
    );
  }
}

ClassroomsSelector.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
  selectedTeacherId: PropTypes.string,
  selectedClassroomId: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  classrooms: PropTypes.array
};

ClassroomsSelector.defaultProps = {
  classes: {},
  selectedTeacherId: '',
  selectedClassroomId: '',
  classrooms: []
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(ClassroomsSelector);
