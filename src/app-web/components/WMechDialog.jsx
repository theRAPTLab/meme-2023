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
import './MEMEStyles.css';
import './WMechDialog.css';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../system/ursys';
import DATAMAP from '../../system/common-datamap';
import DATA from '../modules/data';
import ASET from '../modules/adm-settings';
import UTILS from '../modules/utils';
import EVLinkButton from './EVLinkButton';
import ICNMechArrow from './ICNMechArrow';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'WMechDialog:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class WMechDialog extends React.Component {
  constructor(props) {
    super();
    this.DoAdd = this.DoAdd.bind(this);
    this.DoEdit = this.DoEdit.bind(this);
    this.DoClose = this.DoClose.bind(this);
    this.OnClose = this.OnClose.bind(this);
    this.DoSelectSourceAndTarget = this.DoSelectSourceAndTarget.bind(this);
    this.DoSelectionChange = this.DoSelectionChange.bind(this);
    this.DoPropDelete = this.DoPropDelete.bind(this);
    this.OnSourceLinkButtonClick = this.OnSourceLinkButtonClick.bind(this);
    this.OnTargetLinkButtonClick = this.OnTargetLinkButtonClick.bind(this);
    this.OnTextChange = this.OnTextChange.bind(this);
    this.OnDescriptionChange = this.OnDescriptionChange.bind(this);
    this.OnToggleBidirection = this.OnToggleBidirection.bind(this);
    this.OnReverse = this.OnReverse.bind(this);
    this.DoSaveData = this.DoSaveData.bind(this);
    this.OnCreateClick = this.OnCreateClick.bind(this);

    this.state = {
      isOpen: false,
      editExisting: false,
      sourceId: '',
      sourceLabel: undefined,
      targetId: '',
      targetLabel: undefined,
      label: '',
      description: '',
      listenForSourceSelection: false,
      listenForTargetSelection: false,
      origSourceId: '',
      origTargetId: '',
      saveButtonLabel: 'Add',
      reversing: false,
      slideIn: true,
      bidirectional: false
    };

    UR.Subscribe('MECHDIALOG:ADD', this.DoAdd);
    UR.Subscribe('MECHDIALOG:EDIT', this.DoEdit);
    UR.Subscribe('MECHDIALOG:CLOSE', this.DoClose);
    UR.Subscribe('SELECTION_CHANGED', this.DoSelectionChange);
    UR.Subscribe('PROP_DELETE', this.DoPropDelete);
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubscribe('MECHDIALOG:ADD', this.DoAdd);
    UR.Unsubscribe('MECHDIALOG:EDIT', this.DoEdit);
    UR.Unsubscribe('MECHDIALOG:CLOSE', this.DoClose);
    UR.Unsubscribe('SELECTION_CHANGED', this.DoSelectionChange);
    UR.Unsubscribe('PROP_DELETE', this.DoPropDelete);
  }

  DoAdd() {
    if (DBG) console.log(PKG, 'Add Mech!');
    DATA.VM_SetSelectionLimit(2); // Allow up to 2 props to be selected.
    this.setState(
      {
        isOpen: true,
        editExisting: false,
        id: '',
        sourceId: '',
        sourceLabel: undefined,
        targetId: '',
        targetLabel: undefined,
        label: '',
        description: '',
        origSourceId: '',
        origTargetId: '',
        listenForSourceSelection: true,
        listenForTargetSelection: true,
        saveButtonLabel: 'Add',
        bidirectional: false
      },
      () => {
        this.DoSelectionChange(); // Read selection to prepopulate
      }
    );
  }

  DoEdit(data) {
    if (DBG) console.log(PKG, 'Edit Mech!', data);
    const { id, label, description, bidirectional, sourceId, targetId } = data;
    const pmcDataId = ASET.selectedPMCDataId;
    const intMechId = Number(data.id);
    if (intMechId) {
      UR.DBTryLock('pmcData.entities', [pmcDataId, intMechId]).then(rdata => {
        const { success, semaphore, uaddr, lockedBy } = rdata;
        status += success
          ? `${semaphore} lock acquired by ${uaddr} `
          : `failed to acquired ${semaphore} lock `;
        if (rdata.success) {
          this.setState(
            {
              isOpen: true,
              editExisting: true,
              id,
              sourceId,
              sourceLabel: DATA.Prop(sourceId).name,
              targetId,
              targetLabel: DATA.Prop(targetId).name,
              label,
              description: description || '', // Simple validation
              origSourceId: sourceId,
              origTargetId: targetId,
              listenForSourceSelection: false,
              listenForTargetSelection: false,
              saveButtonLabel: 'Update',
              bidirectional
            },
            () => this.DoSelectSourceAndTarget(sourceId, targetId) // show the selected props
          );
        } else {
          alert(
            `Sorry, someone else (${rdata.lockedBy}) is editing this ${DATAMAP.PMC_MODELTYPES.MECHANISM.label} right now.  Please try again later.`
          );
          UR.Publish('MECHDIALOG_CLOSED'); // tell ViewMain to re-enable ToolsPanel
        }
      });
    }
  }

  DoClose() {
    this.setState({
      isOpen: false,
      sourceId: '', // clear so mech dialog doesn't try to re-render them
      targetId: '' // clear so mech dialog doesn't try to re-render them
    });
    const pmcDataId = ASET.selectedPMCDataId;
    const intMechId = Number(this.state.id);
    // Only release if intMechId has been defined.  Otherwise DBTryRelease will throw invalid id error.
    if (intMechId) {
      UR.DBTryRelease('pmcData.entities', [pmcDataId, intMechId]);
    }
    DATA.VM_SetSelectionLimit(1); // Go back to allowing only one.
    UR.Publish('MECHDIALOG_CLOSED');
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
    const currentVPropSource = DATA.VM_VProp(sourceId);
    DATA.VM_SelectProp(currentVPropSource);
    currentVPropSource.visualState.Select('first'); // hack, this shold probably be implemented as a PMCData call?
    const currentVPropTarget = DATA.VM_VProp(targetId);
    DATA.VM_SelectAddProp(currentVPropTarget);
  }

  DoSelectionChange() {
    if (!this.state.isOpen) return; // ignore selection change if we're not active

    let selectedPropIds = DATA.VM_SelectedPropsIds();
    if (DBG) console.log('selection changed', selectedPropIds);
    if (this.state.sourceId !== '' || this.state.targetId !== '') {
      /**
       * Edit Existing Mech
       *
       * If either source or target are already set, then consider it
       * an existing mech
       *
       * If we're editting an existing mech, we want to allow the user
       * to individually toggle the source / target components on and off
       */
      if (this.state.listenForSourceSelection) {
        if (selectedPropIds.length > 0) {
          const sourceId = selectedPropIds[0];
          if (sourceId === this.state.targetId) {
            alert(
              `${DATA.Prop(sourceId).name} is already selected!  Please select a different ${
                DATAMAP.PMC_MODELTYPES.COMPONENT.label
              } or ${DATAMAP.PMC_MODELTYPES.OUTCOME.label}!`
            );
            DATA.VM_DeselectAll();
          } else {
            this.setState({
              sourceId,
              sourceLabel: sourceId !== '' ? DATA.Prop(sourceId).name : undefined,
              listenForSourceSelection: false
            });
          }
        }
      }
      if (this.state.listenForTargetSelection) {
        if (selectedPropIds.length > 0) {
          // if two are selected, grab the second one, since source would grabed the first?
          const targetId =
            selectedPropIds.length > 1 ? selectedPropIds[1] : selectedPropIds[0];
          if (targetId === this.state.sourceId) {
            alert(
              `${DATA.Prop(targetId).name} is already selected!  Please select a different ${
                DATAMAP.PMC_MODELTYPES.COMPONENT.label
              } or ${DATAMAP.PMC_MODELTYPES.OUTCOME.label}!`
            );
            DATA.VM_DeselectAll();
          } else {
            this.setState({
              targetId,
              targetLabel: targetId !== '' ? DATA.Prop(targetId).name : undefined,
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
        if (!DATA.HasProp(sourceId)) {
          sourceId = '';
        } else {
          listenForSourceSelection = false;
        }
      }
      if (selectedPropIds.length > 1) {
        targetId = selectedPropIds[1];
        if (!DATA.HasProp(targetId)) {
          targetId = '';
        } else {
          listenForTargetSelection = false;
        }
      }

      this.setState({
        sourceId,
        sourceLabel: sourceId !== '' ? DATA.Prop(sourceId).name : undefined,
        targetId,
        targetLabel: targetId !== '' ? DATA.Prop(targetId).name : undefined,
        editExisting,
        listenForSourceSelection,
        listenForTargetSelection,
        bidirectional: false
      });
    }
  }

  DoPropDelete(data) {
    const { isOpen, sourceId, targetId } = this.state;
    const deletedPropId = String(data.id); // coerce to String because sourceID and targetId are strings
    if (isOpen) {
      if (sourceId === deletedPropId) {
        // deselect it
        this.setState({
          sourceId: '',
          sourceLabel: undefined,
          listenForSourceSelection: true
        });
      }
      if (targetId === deletedPropId) {
        // deselect it
        this.setState({
          targetId: '',
          targetLabel: undefined,
          listenForTargetSelection: true
        });
      }
      alert(
        `The ${DATAMAP.PMC_MODELTYPES.COMPONENT.label} or ${DATAMAP.PMC_MODELTYPES.OUTCOME.label} you were linking was deleted by someone else.  Please select a different component or property.`
      );
    }
  }

  OnSourceLinkButtonClick() {
    // Deselect so that the first selection becomes the next source
    DATA.VM_DeselectAll();
    this.setState({
      sourceId: '',
      sourceLabel: undefined,
      listenForSourceSelection: true
    });
  }

  OnTargetLinkButtonClick() {
    // Deselect so that the first selection becomes the next target
    DATA.VM_DeselectAll();
    this.setState({
      targetId: '',
      targetLabel: undefined,
      listenForTargetSelection: true
    });
  }

  OnTextChange(e) {
    this.setState({ label: e.target.value });
  }

  OnDescriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  OnToggleBidirection() {
    console.log('switch', this.state.bidirectional);
    this.setState(state => ({ bidirectional: !state.bidirectional }));
  }

  OnReverse(e) {
    e.preventDefault();
    e.stopPropagation();
    // Swap source and target
    const { sourceId, sourceLabel, targetId, targetLabel } = this.state;
    // hack to prevent scrollbars from appearing during slide
    let origOverflowSetting = document.getElementsByTagName('body')[0].style.overflow;
    document.getElementsByTagName('body')[0].style.overflow = 'hidden';
    // ANIMATE REVERSE -- TODO - this is currently broken post MUI-migration
    this.setState(
      {
        sourceId: targetId,
        sourceLabel: targetLabel,
        targetId: sourceId,
        targetLabel: sourceLabel,
        reversing: true,
        slideIn: false
      },
      () => {
        setTimeout(() => {
          this.setState({ slideIn: true });
          setTimeout(() => {
            // hack to prevent scrollbars from appearing during slide
            document.getElementsByTagName('body')[0].style.overflow =
              origOverflowSetting;
          }, 250);
        }, 250);
      }
    );
    UTILS.RLog(
      'MechanismReverse',
      `new source "${targetId}" to new target "${sourceId}"`
    );
  }

  DoSaveData() {
    const {
      id,
      sourceId,
      targetId,
      origSourceId,
      origTargetId,
      label,
      description,
      editExisting,
      bidirectional
    } = this.state;
    if (editExisting) {
      const origMech = { sourceId: origSourceId, targetId: origTargetId, id };
      const newMech = { sourceId, targetId, label, description, bidirectional };
      DATA.PMC_MechUpdate(origMech, newMech);
    } else {
      DATA.PMC_MechAdd(sourceId, targetId, label, description, bidirectional);
    }
  }

  OnCreateClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (DBG) console.log('create edge');
    this.DoSaveData();
    this.DoClose();
  }

  render() {
    const {
      isOpen,
      label,
      description,
      sourceId,
      sourceLabel,
      targetId,
      targetLabel,
      listenForSourceSelection,
      listenForTargetSelection,
      saveButtonLabel,
      reversing,
      slideIn,
      bidirectional
    } = this.state;

    let sourceSourceType;
    if (sourceId !== '') {
      if (DATA.Prop(sourceId).propType === DATAMAP.PMC_MODELTYPES.OUTCOME.id) {
        sourceSourceType = DATAMAP.PMC_MODELTYPES.OUTCOME.id;
      } else {
        sourceSourceType = DATAMAP.PMC_MODELTYPES.COMPONENT.id;
      }
    }

    let targetSourceType;
    if (targetId !== '') {
      if (DATA.Prop(targetId).propType === DATAMAP.PMC_MODELTYPES.OUTCOME.id) {
        targetSourceType = DATAMAP.PMC_MODELTYPES.OUTCOME.id;
      } else {
        targetSourceType = DATAMAP.PMC_MODELTYPES.COMPONENT.id;
      }
    }

    return (
      isOpen && (
        <div className="WMechDialog dialog-container">
          <div className="dialog">
            <h3>Add {DATAMAP.PMC_MODELTYPES.MECHANISM.label}</h3>
            <p>{DATAMAP.PMC_MODELTYPES.MECHANISM.description}</p>
            <form onSubmit={this.OnCreateClick}>
              <div className="dialog-row">
                {/* slide */}
                <EVLinkButton
                  sourceType={sourceSourceType}
                  sourceLabel={sourceLabel}
                  listenForSourceSelection={listenForSourceSelection}
                  isBeingEdited
                  isExpanded={false}
                  OnLinkButtonClick={this.OnSourceLinkButtonClick}
                />
                {/* end slide */}
                <ICNMechArrow orientation="left" disabled={!bidirectional} />
                <div className="labelbox">
                  <label htmlFor="linkLabel">Label</label>
                  <input
                    id="linkLabel"
                    autoFocus
                    type="text"
                    placeholder="link label"
                    value={label}
                    onChange={this.OnTextChange}
                  />
                </div>
                <ICNMechArrow />
                {/* slide */}
                <EVLinkButton
                  sourceType={targetSourceType}
                  sourceLabel={targetLabel}
                  listenForSourceSelection={listenForTargetSelection}
                  isBeingEdited
                  isExpanded={false}
                  OnLinkButtonClick={this.OnTargetLinkButtonClick}
                />
                {/* end slide */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={bidirectional}
                  id="direction-switch"
                  className="switch"
                  onClick={this.OnToggleBidirection}
                >
                  <span aria-hidden="true">One-way</span>
                  <span aria-hidden="true">Two-way</span>
                </button>
                <button onClick={this.OnReverse}>Reverse Direction</button>
              </div>
              <div className="dialog-row control-bar">
                <div className="labelbox">
                  <label htmlFor="linkdescription">Description</label>
                  <textarea
                    id="linkdescription"
                    placeholder="Describe how the the two are linked together..."
                    value={description}
                    onChange={this.OnDescriptionChange}
                    rows="2"
                  />
                </div>
                <button className="close" onClick={this.OnClose}>
                  Cancel
                </button>
                <button
                  className="primary"
                  type="submit"
                  disabled={sourceId === '' || targetId === '' || label === ''}
                >
                  {saveButtonLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )
    );
  }
}

WMechDialog.propTypes = {};

WMechDialog.defaultProps = {};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WMechDialog;
