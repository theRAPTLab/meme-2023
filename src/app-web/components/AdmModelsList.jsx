/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Models List View

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
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

class ModelsList extends React.Component {
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
    let rows = this.props.models.map(model => {
      // FIXME: This should probably be turned into a data lookup method in groups
      let group = this.props.groups.find(grp => {
        return grp.id === model.groupId;
      });
      let result;
      if (!group) {
        return result;
      }
      if (group.classroomId === this.props.selectedClassroomId) {
        result = (
          <TableRow key={model.id}>
            <TableCell>{model.id}</TableCell>
            <TableCell>
              <a href="#">{model.title}</a>
            </TableCell>
            <TableCell>{model.groupId}</TableCell>
          </TableRow>
        );
      }
      return result;
    });

    return (
      <Paper>
        <InputLabel>MODELS</InputLabel>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>TITLE</TableCell>
              <TableCell>GROUP</TableCell>
              <TableCell>CREATED</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{rows}</TableBody>
        </Table>
      </Paper>
    );
  }
}

ModelsList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
  selectedClassroomId: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  models: PropTypes.array,
  // eslint-disable-next-line react/forbid-prop-types
  groups: PropTypes.array
};

ModelsList.defaultProps = {
  classes: {},
  selectedClassroomId: '',
  models: [],
  groups: []
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(ModelsList);
