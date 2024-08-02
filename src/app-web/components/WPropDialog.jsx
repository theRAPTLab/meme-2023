/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Prop Dialog

Display a dialog for adding a new component or property

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import './MEMEStyles.css';
import './WPropDialog.css';

import PropTypes from 'prop-types';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../system/ursys';
import DATA from '../modules/data';
import ASET from '../modules/adm-settings';
import UTILS from '../modules/utils';
import DATAMAP from '../../system/common-datamap';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'WPropDialog:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class WPropDialog extends React.Component {
  constructor(props) {
    super(props);
    this.DoOpen = this.DoOpen.bind(this);
    this.DoClose = this.DoClose.bind(this);
    this.OnLabelChange = this.OnLabelChange.bind(this);
    this.OnDescriptionChange = this.OnDescriptionChange.bind(this);
    this.OnSubmit = this.OnSubmit.bind(this);

    this.state = {
      isOpen: false,
      label: ``
    };

    UR.Subscribe('PROPDIALOG_OPEN', this.DoOpen);
  }

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
        isProperty: data.isProperty
      });
      return;
    }
    const pmcDataId = ASET.selectedPMCDataId;
    const intPropId = Number(data.propId);
    if (intPropId === undefined || intPropId === NaN)
      throw Error(`DoOpen called with bad propId ${data.propId}`);
    // existing prop, so lock it
    UR.DBTryLock('pmcData.entities', [pmcDataId, intPropId]).then(rdata => {
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
          isProperty: data.isProperty
        });
      } else {
        alert(
          `Sorry, someone else (${rdata.lockedBy}) is editing this ${data.propType} right now.  Please try again later.`
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
    const propTypeLabel =
      UTILS.InitialCaps(DATAMAP.ModelTypeLabel(propType)) +
      (isProperty ? ' property' : '');
    const propTypeDescription = DATAMAP.ModelTypeDescription(propType);

    if (!isOpen) return '';
    else
      return (
        <div className="dialog-container">
          <div className="WPropDialog">
            <form onSubmit={this.OnSubmit}>
              <h3>Add {propTypeLabel}</h3>
              <div>{propTypeDescription}</div>
              <label>
                <span>Label:</span>
                <input type="text" value={label} onChange={this.OnLabelChange} />
              </label>
              <label>
                <span>Description:</span>
                <textarea value={description} onChange={this.OnDescriptionChange} />
              </label>
              <div className="controlbar">
                <button className="cancel" onClick={this.DoClose}>
                  Cancel
                </button>
                <button className="primary" type="submit">
                  {propId === '' ? 'Create' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
  }
}

WPropDialog.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object
};

WPropDialog.defaultProps = {
  classes: {}
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WPropDialog;
