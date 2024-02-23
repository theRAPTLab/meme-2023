/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Prop Dialog

Display a dialog for adding a new component or property

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
// Material UI Icons
import CloseIcon from '@mui/icons-material/Close';
// Material UI Theming
import { withStyles } from '@mui/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from './MEMEStyles';
import UR from '../../system/ursys';
import DATA from '../modules/data';
import ASET from '../modules/adm-settings';
import UTILS from '../modules/utils';
import DATAMAP from '../../system/common-datamap';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'HelpView:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class PropDialog extends React.Component {
  constructor(props) {
    super(props);
    this.DoOpen = this.DoOpen.bind(this);
    this.DoClose = this.DoClose.bind(this);
    this.OnLabelChange = this.OnLabelChange.bind(this);
    this.OnDescriptionChange = this.OnDescriptionChange.bind(this);
    this.OnSubmit = this.OnSubmit.bind(this);

    this.state = {
      isOpen: false,
      label: ``,
    };

    UR.Subscribe('PROPDIALOG_OPEN', this.DoOpen);
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubscribe('PROPDIALOG_OPEN', this.DoOpen);
  }

  DoOpen(data) {
    if (data.propId === undefined) {
      // new prop, so just open the dialog
      this.setState({
        isOpen: true,
        propId: data.propId || '', // new prop, so clear propId
        propType: data.propType || DATAMAP.PMC_MODELTYPES.COMPONENT.id,
        label: data.label || '', // clear the old property name
        description: data.description || '',
        isProperty: data.isProperty,
      });
      return;
    }
    const pmcDataId = ASET.selectedPMCDataId;
    const intPropId = Number(data.propId);
    if (intPropId === undefined || intPropId === NaN)
      throw Error(`DoOpen called with bad propId ${data.propId}`);
    // existing prop, so lock it
    UR.DBTryLock('pmcData.entities', [pmcDataId, intPropId]).then((rdata) => {
      const { success, semaphore, uaddr, lockedBy } = rdata;
      status += success
        ? `${semaphore} lock acquired by ${uaddr} `
        : `failed to acquired ${semaphore} lock `;
      if (rdata.success) {
        this.setState({
          isOpen: true,
          propId: data.propId || '', // new prop, so clear propId
          propType: data.propType || DATAMAP.PMC_MODELTYPES.COMPONENT.id, // default to component for backward compatibility
          label: data.label || '', // clear the old property name
          description: data.description || '',
          isProperty: data.isProperty,
        });
      } else {
        alert(
          `Sorry, someone else (${rdata.lockedBy}) is editing this ${data.propType} right now.  Please try again later.`,
        );
        UR.Publish('PROPDIALOG_CLOSE'); // tell ViewMain to re-enable ToolsPanel
      }
    });
  }

  DoClose() {
    this.setState({ isOpen: false });
    const pmcDataId = ASET.selectedPMCDataId;
    const intPropId = Number(this.state.propId);
    UR.DBTryRelease('pmcData.entities', [pmcDataId, intPropId]);
    UR.Publish('PROPDIALOG_CLOSE');
  }

  OnLabelChange(e) {
    this.setState({ label: e.target.value });
  }

  OnDescriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  OnSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    const { propId, propType, label, description, isProperty } = this.state;

    if (DBG) console.log('create prop');
    if (isProperty) {
      // Add a property to the selected component
      let selectedPropIds = DATA.VM_SelectedPropsIds();
      if (selectedPropIds.length > 0) {
        let parentPropId = selectedPropIds[0];
        if (DBG) console.log('...setting parent of', label, 'to', parentPropId);
        // Create new prop
        const propObj = { name: label, propType, description, parent: parentPropId };
        DATA.PMC_PropAdd(propObj);
      }
    } else if (propId !== '') {
      // Update existing prop
      const propObj = { name: label, propType, description };
      DATA.PMC_PropUpdate(propId, propObj);
    } else {
      // Create new prop
      const propObj = { name: label, propType, description };
      DATA.PMC_PropAdd(propObj);
    }
    this.DoClose();
  }

  render() {
    const { isOpen, propId, propType, label, description, isProperty } = this.state;
    const { classes } = this.props;
    const propTypeLabel =
      UTILS.InitialCaps(DATAMAP.ModelTypeLabel(propType)) + (isProperty ? ' property' : '');
    const propTypeDescription = DATAMAP.ModelTypeDescription(propType);

    return (
      <Dialog open={isOpen} onClose={this.DoClose} aria-labelledby="form-dialog-title">
        <form onSubmit={this.OnSubmit}>
          <DialogTitle id="form-dialog-title">Add {propTypeLabel}</DialogTitle>
          <DialogContent>
            <DialogContentText>{propTypeDescription}</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="propLabel"
              label="Label"
              fullWidth
              onChange={this.OnLabelChange}
              value={label}
            />
            <br />
            <br />
            <TextField
              margin="dense"
              id="propDescription"
              label="Description"
              fullWidth
              multiline
              rows={5}
              onChange={this.OnDescriptionChange}
              value={description}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.DoClose} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              {propId === '' ? 'Create' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

PropDialog.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
};

PropDialog.defaultProps = {
  classes: {},
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(PropDialog);
