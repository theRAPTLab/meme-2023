/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Teacher Selector

Teachers use a groupId of 0.


\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
// Material UI Theming
import { withStyles } from '@mui/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from '../../../components/MEMEStyles';
import UR from '../../../../system/ursys';
import SESSION from '../../../../system/common-session';
import ADM from '../../../modules/data';
import ADMObj from '../../../modules/adm-objects';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class TeacherSelector extends React.Component {
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
      updateExistingTeacher: false,
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
      selectedTeacherName: ADM.GetTeacher(data.teacherId).name,
    });
  }

  // Called by User
  OnTeacherSelect(e) {
    let selectedTeacherId = e.target.value;
    if (selectedTeacherId === 'new') {
      this.setState({
        selectedTeacherName: '',
        addTeacherDialogOpen: true,
        updateExistingTeacher: false,
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
        name,
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
      updateExistingTeacher: true,
    });
  }

  render() {
    const { classes } = this.props;
    const {
      teachers,
      selectedTeacherId,
      selectedTeacher,
      addTeacherDialogOpen,
      selectedTeacherName,
    } = this.state;
    return (
      <Paper className={classes.admPaper}>
        <Grid container direction="row" space={2}>
          <Grid item xs={9}>
            <FormControl variant="outlined" className={classes.admTeacherSelector}>
              <InputLabel>TEACHER</InputLabel>
              <Select
                value={selectedTeacherId}
                onChange={this.OnTeacherSelect}
                input={<OutlinedInput name="teacher" id="teacher" labelWidth={120} />}
              >
                <MenuItem value="" />
                {teachers.map((teacher) => {
                  const tok = SESSION.MakeTeacherToken(teacher.name, {
                    groupId: 0,
                    teacherId: teacher.id,
                  });
                  return (
                    <MenuItem value={teacher.id} key={teacher.id}>
                      {teacher.name} - {tok}
                    </MenuItem>
                  );
                })}
                <MenuItem value="new">
                  <i>Add New...</i>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <Button onClick={this.OnTeacherEdit} disabled={selectedTeacherId === ''}>
              Edit
            </Button>
          </Grid>
        </Grid>
        <Dialog open={addTeacherDialogOpen} onClose={this.OnAddTeacherDialogClose}>
          <form onSubmit={this.OnAddTeacherName}>
            <DialogTitle>Add Teacher</DialogTitle>
            <DialogContent>
              <DialogContentText>Add a teacher by name, e.g. "Ms. Brown"</DialogContentText>
              <TextField
                autoFocus
                id="teacherName"
                label="Name"
                value={selectedTeacherName}
                fullWidth
                onChange={(e) => this.setState({ selectedTeacherName: e.target.value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.OnAddTeacherDialogClose} color="primary">
                Cancel
              </Button>
              <Button color="primary" type="submit">
                Save
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Paper>
    );
  }
}

TeacherSelector.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
};

TeacherSelector.defaultProps = {
  classes: {},
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(TeacherSelector);
