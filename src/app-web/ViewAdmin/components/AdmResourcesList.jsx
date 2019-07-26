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
import MEMEStyles from '../../components/MEMEStyles';
import UR from '../../../system/ursys';
import DATA from '../../modules/pmc-data';
import ADM from '../../modules/adm-data';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class ResourcesList extends React.Component {
  constructor(props) {
    super(props);
    this.DoClassroomSelect = this.DoClassroomSelect.bind(this);
    this.OnResourceCheck = this.OnResourceCheck.bind(this);

    this.state = { classroomResources: [] };

    UR.Sub('CLASSROOM_SELECT', this.DoClassroomSelect);
  }

  componentDidMount() { }

  componentWillUnmount() { }

  DoClassroomSelect(data) {
    this.setState({
      classroomResources: ADM.GetResourcesByClassroom(data.classroomId)
    });
  }

  OnResourceCheck(e) {
    alert('"Select Checkbox" not implemented yet!');
  }

  render() {
    const { classes } = this.props;
    const { classroomResources } = this.state;

    DATA.LoadGraph();  // FIXME: Hack for now to force loading data
    const resources = DATA.AllResources();

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
          <TableBody>
            {resources.map(resource => (
              <TableRow key={resource.rsrcId}>
                <TableCell>
                  <Checkbox
                    checked={classroomResources.includes(resource.rsrcId)}
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
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  }
}

ResourcesList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object
};

ResourcesList.defaultProps = {
  classes: {}
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(ResourcesList);
