/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Groups List View

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
// Material UI Icons
import AddIcon from '@material-ui/icons/Add';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from '../../components/MEMEStyles';
import UR from '../../../system/ursys';
import ADM from '../../modules/adm-data';
import ADMData from '../../modules/adm-data';

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class GroupsList extends React.Component {
  constructor(props) {
    super(props);
    this.DoClassroomSelect = this.DoClassroomSelect.bind(this);
    this.OnAddClick = this.OnAddClick.bind(this);

    this.state = { groups: [] };

    UR.Sub('CLASSROOM_SELECT', this.DoClassroomSelect);

  }

  componentDidMount() { }

  componentWillUnmount() { }

  DoClassroomSelect(data) {
    if (DBG) console.log('AdmGroupsList: DoClassroomSelect', data);
    this.setState({
      groups: ADM.GetGroupsByClassroom(data.classroomId)
    });
  }

  OnAddClick(e) {
    alert('"Add Group" not implemented yet!');
  }

  render() {
    const { classes } = this.props;
    const { groups, addStudentDialogOpen } = this.state;

    // FIXME: Fake token generator placeholder
    const generateToken = (groupId, student) => `BR-${groupId}-XYZ-${student}\n`;

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
            {groups.map(group => (
              <TableRow key={group.id}>
                <TableCell>{group.id}</TableCell>
                <TableCell>{group.name}</TableCell>
                <TableCell>
                  &nbsp;
                  {group.students.map((student, i) => {
                    return (
                      <Chip key={group.id + student} label={student} onDelete={this.OnDeleteStudent} />
                    );
                  })}
                  <IconButton size="small" onClick={e => this.OnAddStudentClick(e, group.id)}>
                    <AddIcon />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <textarea
                    rows={5}
                    readOnly
                    style={{ fontFamily: 'monospace' }}
                    value={group.students.reduce(
                      (accumulator, student) => accumulator + generateToken(group.id, student),
                      '' // initialValue to force start at index=0
                    )}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button variant="contained" className={classes.button} onClick={this.OnAddClick}>
          Add Group
        </Button>
      </Paper>
    );
  }
}

GroupsList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object
};

GroupsList.defaultProps = {
  classes: {}
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(GroupsList);
