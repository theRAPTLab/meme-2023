/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Models List Table

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

class ModelsListTable extends React.Component {
  componentDidMount() { }

  componentWillUnmount() { }

  OnModelSelect(e) {
    alert('Model Selection is not implmented yet!');
  }

  render() {
    const { classes, models } = this.props;

    return (
      <Paper className={classes.admPaper}>
        <InputLabel>MODELS</InputLabel>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>TITLE</TableCell>
              <TableCell>GROUP</TableCell>
              <TableCell>UPDATED</TableCell>
              <TableCell>CREATED</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {models.map(model => (
              <TableRow key={model.id}>
                <TableCell>
                  <Button color="primary" onClick={this.OnModelSelect}>
                    {model.title}
                  </Button>
                </TableCell>
                <TableCell>{model.groupId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  }
}

ModelsListTable.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  models: PropTypes.array
};

ModelsListTable.defaultProps = {
  classes: {},
  models: []
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(ModelsListTable);
