/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Groups List View

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from './MEMEStyles';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class GroupsList extends React.Component {
  constructor(props) {
    super(props);
    this.HandleAddClick = this.HandleAddClick.bind(this);
  }

  componentDidMount() { }

  componentWillUnmount() { }

  HandleAddClick(e) {
    alert('"Add Group" not implemented yet!');
  }

  render() {
    const { classes } = this.props;
    let rows = this.props.groups.map(group => {
      if (group.classroomId === this.props.selectedClassroomId) {
        return (
          <TableRow key={group.id}>
            <TableCell>{group.id}</TableCell>
            <TableCell>{group.name}</TableCell>
            <TableCell>{group.students}</TableCell>
          </TableRow>
        );
      }
    });

    return (
      <Paper>
        <InputLabel>GROUPS</InputLabel>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>NAME</TableCell>
              <TableCell>STUDENTS</TableCell>
              <TableCell>TOKEN</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{rows}</TableBody>
        </Table>
        <Button variant="contained" className={classes.button} onClick={this.HandleAddClick}>
          Add Group
        </Button>
      </Paper>
    );
  }
}

GroupsList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
  selectedClassroomId: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  group: PropTypes.array
};

GroupsList.defaultProps = {
  classes: {},
  selectedClassroomId: '',
  group: []
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(GroupsList);
