/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Criteria List View

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
import MEMEStyles from '../../components/MEMEStyles';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class CriteriaList extends React.Component {
  constructor(props) {
    super(props);
    this.HandleAddClick = this.HandleAddClick.bind(this);
  }

  componentDidMount() { }

  componentWillUnmount() { }

  HandleAddClick(e) {
    alert('"Add Criteria" not implemented yet!');
  }

  render() {
    const { classes } = this.props;
    let rows = this.props.criteria.map(criteria => {
      if (criteria.classroomId === this.props.selectedClassroomId) {
        return (
          <TableRow key={criteria.id}>
            <TableCell>{criteria.id}</TableCell>
            <TableCell>{criteria.label}</TableCell>
            <TableCell>{criteria.description}</TableCell>
          </TableRow>
        );
      }
    });

    return (
      <Paper>
        <InputLabel>CRITERIA</InputLabel>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>LABEL</TableCell>
              <TableCell>DESCRIPTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{rows}</TableBody>
        </Table>
        <Button variant="contained" className={classes.button} onClick={this.HandleAddClick}>
          Add Criteria
        </Button>
      </Paper>
    );
  }
}

CriteriaList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
  selectedClassroomId: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  criteria: PropTypes.array
};

CriteriaList.defaultProps = {
  classes: {},
  selectedClassroomId: '',
  criteria: []
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(CriteriaList);
