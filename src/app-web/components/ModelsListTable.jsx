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
import SESSION from '../../system/common-session';
import ADM from '../modules/data';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function HumanDate(timestamp) {
  if (timestamp === undefined || timestamp === '') return '<no date>';
  const date = new Date(timestamp);
  const timestring = date.toLocaleTimeString('en-Us', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const datestring = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  return `${datestring} ${timestring}`;
}

class ModelsListTable extends React.Component {
  componentDidMount() { }

  componentWillUnmount() { }

  render() {
    const { classes, models, OnModelSelect, OnModelMove, OnModelClone } = this.props;
    const isTeacher = SESSION.IsTeacher();

    return (
      <Paper className={classes.admPaper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>TITLE</TableCell>
              <TableCell>GROUP</TableCell>
              <TableCell>UPDATED</TableCell>
              <TableCell>CREATED</TableCell>
              <TableCell> </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {models.map(model => (
              <TableRow key={model.id}>
                <TableCell>
                  <Button color="primary" onClick={e => OnModelSelect(model.id)}>
                    {model.title}
                  </Button>
                </TableCell>
                <TableCell>{ADM.GetGroupName(model.groupId)}</TableCell>
                <TableCell>{HumanDate(model.dateModified)}</TableCell>
                <TableCell>{HumanDate(model.dateCreated)}</TableCell>
                <TableCell>
                  {isTeacher ? <Button onClick={e => OnModelMove(model.id)}>MOVE</Button> : ''}
                  <Button onClick={e => OnModelClone(model.id)}>CLONE</Button>
                </TableCell>
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
  models: PropTypes.array,
  OnModelSelect: PropTypes.func,
  OnModelMove: PropTypes.func,
  OnModelClone: PropTypes.func
};

ModelsListTable.defaultProps = {
  classes: {},
  models: [],
  OnModelSelect: () => {
    console.error('Missing OnModeSelect handler');
  },
  OnModelMove: () => {
    console.error('Missing OnModelMove handler');
  },
  OnModelClone: () => {
    console.error('Missing OnModelClone handler');
  }
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(ModelsListTable);
