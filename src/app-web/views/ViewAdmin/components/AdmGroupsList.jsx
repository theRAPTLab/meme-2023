/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Groups List View

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
// Material UI Icons
import AddIcon from '@mui/icons-material/Add';
// Material UI Theming
import { styled } from "@mui/system";

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from '../../../components/MEMEStyles';
import UR from '../../../../system/ursys';
import ADM from '../../../modules/data';

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class GroupsList extends React.Component {
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
      addStudentDialogInvalidNames: undefined,
      classroomId: '',
      editExistingGroup: false,
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
        classroomId: data.classroomId,
      });
    } else {
      this.setState({
        groups: [],
        classroomId: '',
      });
    }
  }

  // Update the groups list from ADMData in case a new group was added
  DoADMDataUpdate() {
    const classroomId = this.state.classroomId;
    if (classroomId) {
      this.setState({
        groups: ADM.GetGroupsByClassroom(classroomId),
      });
    }
  }

  OnAddGroupClick(e) {
    this.setState({
      addGroupDialogOpen: true,
      addGroupDialogName: '',
      editExistingGroup: false,
    });
  }

  OnAddGroupName(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.editExistingGroup) {
      ADM.DB_UpdateGroup(this.state.selectedGroupId, { name: this.state.addGroupDialogName });
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
      addStudentDialogGroupId: groupId,
    });
  }

  OnDeleteStudent(e, groupId, student) {
    if (DBG) console.log('AdmGroupsList: Deleting student', student);
    ADM.DeleteStudent(groupId, student);
  }

  OnAddStudentName(e) {
    e.preventDefault();
    e.stopPropagation();
    const names = this.state.addStudentDialogName.split(',').map((name) => name.trim());
    ADM.AddStudents(this.state.addStudentDialogGroupId, names);
    this.OnAddStudentDialogClose();
  }

  OnAddStudentDialogClose() {
    this.setState({ addStudentDialogOpen: false });
  }

  CheckForDuplicates(names) {
    let namesArr = names.split(',');
    let duplicateNamesArr = namesArr.filter((name) => {
      return ADM.GetGroupByStudent(name.trim());
    });
    return duplicateNamesArr.length > 0 ? duplicateNamesArr.join(', ') : undefined;
  }

  OnUpdateAddStudentName(e) {
    // Check for duplicates
    let duplicateNames = this.CheckForDuplicates(e.target.value);
    this.setState({
      addStudentDialogName: e.target.value,
      addStudentDialogInvalidNames: duplicateNames,
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
      editExistingGroup: true,
    });
  }

  render() {
    const { classes } = this.props;
    const {
      groups,
      addGroupDialogOpen,
      addGroupDialogName,
      addStudentDialogOpen,
      addStudentDialogInvalidNames,
      classroomId,
    } = this.state;

    return (
      <Paper className={classes.admPaper}>
        <InputLabel>GROUPS</InputLabel>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>NAME</TableCell>
              <TableCell>STUDENTS</TableCell>
              <TableCell>TOKENS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>{group.id}</TableCell>
                <TableCell>
                  {group.name}
                  <Button onClick={(e) => this.OnGroupEdit(e, group.id)}>Edit</Button>
                </TableCell>
                <TableCell>
                  &nbsp;
                  {group.students.map((student, i) => {
                    return (
                      <Chip
                        key={group.id + student}
                        label={student}
                        onDelete={(e) => this.OnDeleteStudent(e, group.id, student)}
                      />
                    );
                  })}
                  <IconButton size="small" onClick={(e) => this.OnAddStudentClick(e, group.id)}>
                    <AddIcon />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <textarea
                    rows={5}
                    readOnly
                    style={{ fontFamily: 'monospace' }}
                    value={group.students.reduce(
                      (accumulator, student) => accumulator + ADM.GetToken(group.id, student),
                      '', // initialValue to force start at index=0
                    )}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button
          variant="contained"
          className={classes.button}
          onClick={this.OnAddGroupClick}
          disabled={classroomId === ''}
        >
          Add Group
        </Button>
        <Dialog open={addGroupDialogOpen} onClose={this.OnAddGroupDialogClose}>
          <form onSubmit={this.OnAddGroupName}>
            <DialogTitle>Add Group</DialogTitle>
            <DialogContent>
              <DialogContentText>Add a group.</DialogContentText>
              <TextField
                autoFocus
                id="groupName"
                label="Group Name"
                fullWidth
                value={addGroupDialogName}
                onChange={(e) => this.setState({ addGroupDialogName: e.target.value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.OnAddGroupDialogClose} color="primary">
                Cancel
              </Button>
              <Button color="primary" type="submit">
                Save
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        <Dialog open={addStudentDialogOpen} onClose={this.OnAddStudentDialogClose}>
          <form onSubmit={this.OnAddStudentName}>
            <DialogTitle>Add Student(s)</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Add a student first name, or add multiple students separated by a comma. Please use
                first names only. (e.g. 'Bob, Brianna, Brenda').
              </DialogContentText>
              <FormControl
                error={addStudentDialogInvalidNames !== undefined}
                fullWidth
                className={classes.oneEmBefore}
              >
                <TextField
                  autoFocus
                  id="studentNames"
                  label="Name(s)"
                  fullWidth
                  onChange={this.OnUpdateAddStudentName}
                />
                <FormHelperText hidden={addStudentDialogInvalidNames === undefined}>
                  {addStudentDialogInvalidNames} is already in this group. Please use a unique name.
                </FormHelperText>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.OnAddStudentDialogClose} color="primary">
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                disabled={addStudentDialogInvalidNames !== undefined}
              >
                Add
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Paper>
    );
  }
}

GroupsList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
};

GroupsList.defaultProps = {
  classes: {},
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default styled(MEMEStyles)(GroupsList);
