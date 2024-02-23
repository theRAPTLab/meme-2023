/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Criteria List

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
// Material UI Icons
import DeleteIcon from '@mui/icons-material/Delete';
// Material UI Theming
import { withStyles } from '@mui/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from '../../../components/MEMEStyles';
import UR from '../../../../system/ursys';
import MDReactComponent from 'markdown-react-js';

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'AdminCriteriaList';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const SmTableCell = withStyles((theme) => ({
  root: {
    padding: '2px 10px 2px 2px',
  },
}))((props) => <TableCell {...props} />);

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class CriteriaList extends React.Component {
  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    const { Criteria, IsInEditMode, UpdateField, OnDeleteCriteriaClick } = this.props;

    return (
      <Table>
        <TableHead>
          <TableRow>
            <SmTableCell>LABEL</SmTableCell>
            <SmTableCell>DESCRIPTION</SmTableCell>
            <SmTableCell>{IsInEditMode ? 'DELETE' : ''}</SmTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Criteria.map((crit) =>
            IsInEditMode ? (
              <TableRow key={crit.id}>
                <SmTableCell>
                  <TextField
                    value={crit.label}
                    placeholder="Label"
                    onChange={(e) => UpdateField(crit.id, 'label', e.target.value)}
                  />
                </SmTableCell>
                <SmTableCell>
                  <TextField
                    value={crit.description}
                    placeholder="Description"
                    multiline
                    rows={2}
                    style={{ width: '20em' }}
                    onChange={(e) => UpdateField(crit.id, 'description', e.target.value)}
                  />
                </SmTableCell>
                <SmTableCell>
                  <IconButton size="small" onClick={() => OnDeleteCriteriaClick(crit.id)}>
                    <DeleteIcon />
                  </IconButton>
                </SmTableCell>
              </TableRow>
            ) : (
              <TableRow key={crit.id}>
                <SmTableCell>{crit.label}</SmTableCell>
                <SmTableCell>
                  <MDReactComponent
                    text={crit.description}
                    markdownOptions={{ html: true, typographer: true, linkify: true, breaks: true }}
                  />
                </SmTableCell>
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>
    );
  }
}

CriteriaList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  Criteria: PropTypes.array,
  IsInEditMode: PropTypes.bool,
  UpdateField: PropTypes.func,
  OnDeleteCriteriaClick: PropTypes.func,
};

CriteriaList.defaultProps = {
  Criteria: [],
  IsInEditMode: false,
  UpdateField: () => {
    console.error('Missing UpdateField handler');
  },
  OnDeleteCriteriaClick: () => {
    console.error('Missing OnDeleteCriteriaClick handler');
  },
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(CriteriaList);
