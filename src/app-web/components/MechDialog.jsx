/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Mech Dialog

Used to add and edit Mechanisms.

This is deliberately not a Material UI <Dialog> component because the user 
needs to select Properties and Mechanisms while th e "dialog" is open.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from './MEMEStyles';
import UR from '../../system/ursys';
import DATA from '../modules/pmc-data';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const PKG = 'MechDialog:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class MechDialog extends React.Component {
  constructor(props) {
    super(props);
    this.DoAdd = this.DoAdd.bind(this);
    this.DoEdit = this.DoEdit.bind(this);
    this.DoClose = this.DoClose.bind(this);
    this.OnClose = this.OnClose.bind(this);
    this.DoSelectionChange = this.DoSelectionChange.bind(this);
    this.OnTextChange = this.OnTextChange.bind(this);
    this.DoSaveData = this.DoSaveData.bind(this);
    this.OnCreateClick = this.OnCreateClick.bind(this);

    this.state = {
      isOpen: false,
      label: '',
      sourceId: '',
      targetId: ''
    };

    UR.Sub('MECHDIALOG:ADD', this.DoAdd);
    UR.Sub('MECHDIALOG:EDIT', this.DoEdit);
    UR.Sub('SELECTION_CHANGED', this.DoSelectionChange);
  }

  componentDidMount() { }

  componentWillUnmount() {
    UR.Unsub('MECHDIALOG:ADD', this.DoAdd);
    UR.Unsub('MECHDIALOG:EDIT', this.DoEdit);
    UR.Unsub('SELECTION_CHANGED', this.DoSelectionChange);
  }

  DoAdd() {
    if (DBG) console.log(PKG, 'Add Mech!');
    this.setState({
      isOpen: true,
      label: '',
      editExisting: false
    });
  }

  DoEdit(data) {
    if (DBG) console.log(PKG, 'Edit Mech!', data);
    const { label, sourceId, targetId } = data;
    this.setState({
      isOpen: true,
      label,
      sourceId,
      targetId,
      editExisting: true
    });
  }

  DoClose() {
    this.setState({
      isOpen: false
    });
    UR.Publish('MECHDIALOG:CLOSED');
  }

  OnClose() {
    this.DoClose();
  }

  DoSelectionChange() {
    let selectedPropIds = DATA.VM_SelectedPropsIds();
    if (DBG) console.log('selection changed', selectedPropIds);
    let sourceId = '';
    let targetId = '';
    if (selectedPropIds.length > 0) {
      sourceId = selectedPropIds[0];
    }
    if (selectedPropIds.length > 1) {
      targetId = selectedPropIds[1];
    }

    this.setState({
      sourceId,
      targetId
    });
  }

  OnTextChange(e) {
    this.setState({ label: e.target.value });
  }

  DoSaveData() {
    let { sourceId, targetId, label, editExisting } = this.state;
    if (editExisting) {
      DATA.PMC_MechUdpate(sourceId, targetId, label);
    } else {
      DATA.PMC_AddMech(sourceId, targetId, label);
    }
  }

  OnCreateClick() {
    if (DBG) console.log('create edge');
    this.DoSaveData();
    this.DoClose();
  }

  render() {
    const { isOpen, label, sourceId, targetId, editExisting } = this.state;
    const { classes } = this.props;

    return (
      <Card className={classes.edgeDialog} hidden={!isOpen}>
        <Paper className={classes.edgeDialogPaper}>
          <div className={classes.edgeDialogWindowLabel}>ADD MECHANISM</div>
          <div className={classes.edgeDialogInput}>
            {sourceId !== '' ? (
              <div className={classes.evidenceLinkSourcePropAvatarSelected}>
                {DATA.Prop(sourceId).name}
              </div>
            ) : (
              <div className={classes.evidenceLinkSourceAvatarWaiting}>1. Click on a source...</div>
            )}
            &nbsp;
            <TextField
              autoFocus
              placeholder="link label"
              margin="dense"
              id="edgeLabel"
              label="Label"
              value={label}
              onChange={this.OnTextChange}
              className={classes.edgeDialogTextField}
            />
            &nbsp;
            {targetId !== '' ? (
              <div className={classes.evidenceLinkSourcePropAvatarSelected}>
                {DATA.Prop(targetId).name}
              </div>
            ) : (
              <div className={classes.evidenceLinkSourceAvatarWaiting}>2. Click on a target...</div>
            )}
            <div style={{ flexGrow: '1' }} />
            <Button onClick={this.OnClose} color="primary">
              Cancel
            </Button>
            <Button
              onClick={this.OnCreateClick}
              color="primary"
              variant="contained"
              disabled={sourceId === '' || targetId === ''}
            >
              {editExisting ? 'Update' : 'Add'}
            </Button>
          </div>
        </Paper>
      </Card>
    );
  }
}

MechDialog.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object
};

MechDialog.defaultProps = {
  classes: {}
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(MechDialog);
