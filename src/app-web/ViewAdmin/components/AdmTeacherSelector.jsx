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

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class TeacherSelector extends React.Component {
  constructor(props) {
    super(props);
    this.OnTeacherSelect = this.OnTeacherSelect.bind(this);
    this.state = { teachers: [] };
  }

  componentDidMount() {
    this.setState({ teachers: ADM.GetAllTeachers() });
  }

  componentWillUnmount() { }

  OnTeacherSelect(e) {
    UR.Publish('TEACHER_SELECT', { teacherId: e.target.value });
  }

  render() {
    const { selectedTeacherId, classes } = this.props;
    const { teachers } = this.state;
    return (
      <Paper className={classes.admPaper}>
        <FormControl variant="outlined" className={classes.admTeacherSelector}>
          <InputLabel>TEACHER</InputLabel>
          <Select
            value={selectedTeacherId}
            onChange={this.OnTeacherSelect}
            input={<OutlinedInput name="teacher" id="teacher" labelWidth={120} />}
          >
            <MenuItem value="" />
            {teachers.map(teacher => (
              <MenuItem value={teacher.id} key={teacher.id}>
                {teacher.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
    );
  }
}

TeacherSelector.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
  selectedTeacherId: PropTypes.string
};

TeacherSelector.defaultProps = {
  classes: {},
  selectedTeacherId: ''
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(TeacherSelector);
