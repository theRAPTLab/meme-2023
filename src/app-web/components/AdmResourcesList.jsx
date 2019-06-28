/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Resources List View

All resources are available for all classrooms.
Each classroom can define its own subset of resources to display.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
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
import DATA from '../modules/pmc-data';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class ResourcesList extends React.Component {
  constructor(props) {
    super(props);
    this.HandleAddClick = this.HandleAddClick.bind(this);
    this.HandleCheck = this.HandleCheck.bind(this);
  }

  componentDidMount() { }

  componentWillUnmount() { }

  HandleAddClick(e) {
    alert('"Add Criteria" not implemented yet!');
  }

  HandleCheck(e) {
    alert('"Select Checkbox" not implemented yet!');
  }

  render() {
    const { classes } = this.props;
    DATA.LoadGraph();  // FIXME: Hack for now to force loading data
    const resources = DATA.AllResources();
    const thisClassroomsResources = this.props.classroomResources.find(classRsrc => {
      return classRsrc.classroomId === this.props.selectedClassroomId;
    });
    let resourceList = [];
    if (thisClassroomsResources) {
      resourceList = thisClassroomsResources.resources;
    }
    const rows = resources.map(resource => {
      return (
        <TableRow key={resource.rsrcId}>
          <TableCell>
            <Checkbox
              checked={resourceList.includes(resource.rsrcId)}
              color="primary"
              onChange={this.HandleCheck}
            />
          </TableCell>
          <TableCell>{resource.rsrcId}</TableCell>
          <TableCell>{resource.label}</TableCell>
          <TableCell>{resource.notes}</TableCell>
          <TableCell>{resource.type}</TableCell>
          <TableCell>{resource.url}</TableCell>
        </TableRow>
      );
    });

    return (
      <Paper className={classes.admResourceListPaper}>
        <InputLabel>RESOURCES</InputLabel>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>INCLUDE FOR CLASSROOM</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>LABEL</TableCell>
              <TableCell>NOTES</TableCell>
              <TableCell>TYPE</TableCell>
              <TableCell>URL</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{rows}</TableBody>
        </Table>
      </Paper>
    );
  }
}

ResourcesList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
  selectedClassroomId: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  classroomResources: PropTypes.array
};

ResourcesList.defaultProps = {
  classes: {},
  selectedClassroomId: '',
  classroomResources: []
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(ResourcesList);
