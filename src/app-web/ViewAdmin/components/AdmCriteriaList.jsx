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
    this.OnAddClick = this.OnAddClick.bind(this);
  }

  componentDidMount() { }

  componentWillUnmount() { }

  OnAddClick(e) {
    alert('"Add Criteria" not implemented yet!');
  }

  render() {
    const { selectedClassroomId, criteria, classes } = this.props;
    let rows = criteria.map(crit => {
      let result;
      if (crit.classroomId === selectedClassroomId) {
        result = (
          <TableRow key={crit.id}>
            <TableCell>{crit.id}</TableCell>
            <TableCell>{crit.label}</TableCell>
            <TableCell>{crit.description}</TableCell>
          </TableRow>
        );
      }
      return result;
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
        <Button variant="contained" className={classes.button} onClick={this.OnAddClick}>
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
