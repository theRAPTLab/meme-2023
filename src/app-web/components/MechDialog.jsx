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
import LinkButton from './LinkButton';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
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
    this.DoSelectSourceAndTarget = this.DoSelectSourceAndTarget.bind(this);
    this.DoSelectionChange = this.DoSelectionChange.bind(this);
    this.OnSourceLinkButtonClick = this.OnSourceLinkButtonClick.bind(this);
    this.OnTargetLinkButtonClick = this.OnTargetLinkButtonClick.bind(this);
    this.OnTextChange = this.OnTextChange.bind(this);
    this.DoSaveData = this.DoSaveData.bind(this);
    this.OnCreateClick = this.OnCreateClick.bind(this);

    this.state = {
      isOpen: false,
      editExisting: false,
      sourceId: '',
      sourceLabel: '',
      targetId: '',
      targetLabel: '',
      label: '',
      listenForSourceSelection: false,
      listenForTargetSelection: false,
      origSourceId: '',
      origTargetId: '',
      saveButtonLabel: 'Add'
    };

    UR.Subscribe('MECHDIALOG:ADD', this.DoAdd);
    UR.Subscribe('MECHDIALOG:EDIT', this.DoEdit);
    UR.Subscribe('SELECTION_CHANGED', this.DoSelectionChange);
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubcribe('MECHDIALOG:ADD', this.DoAdd);
    UR.Unsubcribe('MECHDIALOG:EDIT', this.DoEdit);
    UR.Unsubcribe('SELECTION_CHANGED', this.DoSelectionChange);
  }

  DoAdd() {
    if (DBG) console.log(PKG, 'Add Mech!');
    DATA.VM_SetSelectionLimit(2); // Allow up to 2 props to be selected.
    this.setState(
      {
        isOpen: true,
        editExisting: false,
        sourceId: '',
        sourceLabel: '',
        targetId: '',
        targetLabel: '',
        label: '',
        listenForSourceSelection: true,
        listenForTargetSelection: true,
        saveButtonLabel: 'Add'
      },
      () => {
        this.DoSelectionChange(); // Read selection to prepopulate
      }
    );
  }

  DoEdit(data) {
    if (DBG) console.log(PKG, 'Edit Mech!', data);
    const { label, sourceId, targetId } = data;
    this.setState(
      {
        isOpen: true,
        editExisting: true,
        sourceId,
        sourceLabel: DATA.Prop(sourceId).name,
        targetId,
        targetLabel: DATA.Prop(targetId).name,
        label,
        origSourceId: sourceId,
        origTargetId: targetId,
        listenForSourceSelection: false,
        listenForTargetSelection: false,
        saveButtonLabel: 'Update'
      },
      () => this.DoSelectSourceAndTarget(sourceId, targetId) // show the selected props
    );
  }

  DoClose() {
    this.setState({
      isOpen: false
    });
    DATA.VM_SetSelectionLimit(1); // Go back to allowing only one.
    UR.Publish('MECHDIALOG:CLOSED');
  }

  OnClose() {
    this.DoClose();
  }

  /**
   * Show the selected source and target properties.
   * This is used when the dialog opens to show which props are currently set to the source and target.
   * @param {*} sourceId
   * @param {*} targetId
   */
  DoSelectSourceAndTarget(sourceId, targetId) {
    console.error(PKG, 'DoSelectSourceAndTarget', sourceId, targetId);
    const currentVPropSource = DATA.VM_VProp(sourceId);
    DATA.VM_SelectProp(currentVPropSource);
    currentVPropSource.visualState.Select('first'); // hack, this shold probably be implemented as a PMCData call?
    const currentVPropTarget = DATA.VM_VProp(targetId);
    DATA.VM_SelectAddProp(currentVPropTarget);
  }

  DoSelectionChange() {
    let selectedPropIds = DATA.VM_SelectedPropsIds();
    if (DBG) console.log('selection changed', selectedPropIds);

    if (this.state.editExisting) {
      /**
       * Edit Existing Mech
       *
       * If we're editting an existing mech, we want to allow the user
       * to individually toggle the source / target components on and off
       */
      if (this.state.listenForSourceSelection) {
        if (selectedPropIds.length > 0) {
          const sourceId = selectedPropIds[0];
          if (sourceId === this.state.targetId) {
            alert(`${DATA.Prop(sourceId).name} is already selected!  Please select a different component / property!`);
            DATA.VM_DeselectAll();
          } else {
            this.setState({
              sourceId,
              sourceLabel: sourceId !== '' ? DATA.Prop(sourceId).name : '',
              listenForSourceSelection: false
            });
          }
        }
      }
      if (this.state.listenForTargetSelection) {
        if (selectedPropIds.length > 0) {
          const targetId = selectedPropIds[0];
          if (targetId === this.state.sourceId) {
            alert(`${DATA.Prop(targetId).name} is already selected!  Please select a different component / property!`);
            DATA.VM_DeselectAll();
          } else {
            this.setState({
              targetId,
              targetLabel: targetId !== '' ? DATA.Prop(targetId).name : '',
              listenForTargetSelection: false
            });
          }
        }
      }
    } else {
      /**
       * Adding New Mech
       *
       * If we're adding a new component, then initially use the double selection
       * method where the user can click on different selections to set.
       * Then when both are selected, go to standard edit mode
       * so that they can individually set links.
       */
      let sourceId = '';
      let targetId = '';
      let editExisting = false;
      let listenForSourceSelection = true;
      let listenForTargetSelection = true;

      if (selectedPropIds.length > 0) {
        sourceId = selectedPropIds[0];
        listenForSourceSelection = false;
      }
      if (selectedPropIds.length > 1) {
        targetId = selectedPropIds[1];
        listenForTargetSelection = false;
      }

      // If both source and target have been defined, we change the
      // dialog to edit existing mode so that you can individually
      // set each link
      if (sourceId !== '' && targetId !== '') {
        editExisting = true;
      }

      this.setState({
        sourceId,
        sourceLabel: sourceId !== '' ? DATA.Prop(sourceId).name : '',
        targetId,
        targetLabel: targetId !== '' ? DATA.Prop(targetId).name : '',
        editExisting,
        listenForSourceSelection,
        listenForTargetSelection
      });
    }
  }

  OnSourceLinkButtonClick() {
    // Deselect so that the first selection becomes the next source
    DATA.VM_DeselectAll();
    this.setState({
      sourceId: undefined,
      sourceLabel: undefined,
      listenForSourceSelection: true
    });
  }

  OnTargetLinkButtonClick() {
    // Deselect so that the first selection becomes the next target
    DATA.VM_DeselectAll();
    this.setState({
      targetId: undefined,
      targetLabel: undefined,
      listenForTargetSelection: true
    });
  }

  OnTextChange(e) {
    this.setState({ label: e.target.value });
  }

  DoSaveData() {
    const { sourceId, targetId, origSourceId, origTargetId, label, editExisting } = this.state;
    if (editExisting) {
      const origMech = { sourceId: origSourceId, targetId: origTargetId };
      const newMech = { sourceId, targetId, label };
      DATA.PMC_MechUpdate(origMech, newMech);
    } else {
      DATA.PMC_MechAdd(sourceId, targetId, label);
    }
  }

  OnCreateClick() {
    if (DBG) console.log('create edge');
    this.DoSaveData();
    this.DoClose();
  }

  render() {
    const {
      isOpen,
      label,
      sourceId,
      sourceLabel,
      targetId,
      targetLabel,
      editExisting,
      listenForSourceSelection,
      listenForTargetSelection,
      saveButtonLabel
    } = this.state;
    const { classes } = this.props;

    return (
      <Card className={classes.edgeDialog} hidden={!isOpen}>
        <Paper className={classes.edgeDialogPaper}>
          <div className={classes.edgeDialogWindowLabel}>ADD MECHANISM</div>
          <div className={classes.edgeDialogInput}>
            <LinkButton
              sourceType="prop"
              sourceLabel={sourceLabel}
              listenForSourceSelection={listenForSourceSelection}
              isBeingEdited
              isExpanded={false}
              OnLinkButtonClick={this.OnSourceLinkButtonClick}
            />
            &nbsp;&nbsp;
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
            &nbsp;&nbsp;
            <LinkButton
              sourceType="prop"
              sourceLabel={targetLabel}
              listenForSourceSelection={listenForTargetSelection}
              isBeingEdited
              isExpanded={false}
              OnLinkButtonClick={this.OnTargetLinkButtonClick}
            />
            <div style={{ flexGrow: '1' }} />
            <Button onClick={this.OnClose} color="default">
              Cancel
            </Button>
            <Button
              onClick={this.OnCreateClick}
              color="primary"
              variant="contained"
              disabled={sourceId === '' || targetId === ''}
            >
              {saveButtonLabel}
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
