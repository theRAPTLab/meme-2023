/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  ViewMEME - Main Application View

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import '../../components/MEMEStyles.css';
import './ViewMEME.css';

import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';

// Material UI Theming
import { yellow } from '@mui/material/colors';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Material UI Icons
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditIcon from '@mui/icons-material/Edit';
import MenuIcon from '@mui/icons-material/Menu';
import ZoomInMapIcon from '@mui/icons-material/CenterFocusWeak';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
// MEME App Components
import WDescriptionPopup from '../../components/WDescriptionPopup';
import InfoDialog from '../../components/InfoDialog';
import WHelpView from '../../components/WHelpView';
import WLogin from '../../components/WLogin';
import MechDialog from '../../components/MechDialog';
import WModelSelect from '../../components/WModelSelect';
import WPropDialog from '../../components/WPropDialog';
import EVResourceItemDialog from '../../components/EVResourceItemDialog';
import WRatingsDialog from '../../components/WRatingsDialog';
import WScreenshotView from '../../components/WScreenshotView';
import StickyNoteButton from '../../components/StickyNoteButton';
import StickyNoteCollection from '../../components/StickyNoteCollection';
import MEPanelTools from '../../components/MEPanelTools';
import MEPanelResources from '../../components/MEPanelResources';
// MEME Modules and Utils
import UR from '../../../system/ursys';
import RoutedView from './RoutedView';
import DATA from '../../modules/data';
import ADM from '../../modules/data';
import ASET from '../../modules/adm-settings';
import DATAMAP from '../../../system/common-datamap';
import { cssreact, cssdraw, cssalert } from '../../modules/console-styles';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'ViewMEME:';

const SIDEBARWIDTH = 292;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class ViewMEME extends React.Component {
  // constructor
  constructor(props) {
    super(props);
    UR.ReactPreflight(ViewMEME, module);
    UR.DisableAdminPowers();

    this.displayName = this.constructor.name;
    this.refMain = React.createRef();
    this.refView = React.createRef();

    this.state = {
      viewHeight: 0,
      viewWidth: 0
    };

    this.DoDataUpdate = this.DoDataUpdate.bind(this);
    this.DoADMDataUpdate = this.DoADMDataUpdate.bind(this);
    this.UpdateDimensions = this.UpdateDimensions.bind(this);
    this.DoModelTitleUpdate = this.DoModelTitleUpdate.bind(this);
    this.OnChangeModelTitle = this.OnChangeModelTitle.bind(this);
    this.DoSaveModelTitle = this.DoSaveModelTitle.bind(this);
    this.DoSubmitModelTitleForm = this.DoSubmitModelTitleForm.bind(this);
    this.OnToggleToolsPanel = this.OnToggleToolsPanel.bind(this);
    this.OnToggleResourceLibrary = this.OnToggleResourceLibrary.bind(this);
    this.OnShowEvidenceLink = this.OnShowEvidenceLink.bind(this);
    this.OnOutcomeAdd = this.OnOutcomeAdd.bind(this);
    this.OnPropAdd = this.OnPropAdd.bind(this);
    this.OnPropDelete = this.OnPropDelete.bind(this);
    this.OnAddPropComment = this.OnAddPropComment.bind(this);
    this.OnAddMechComment = this.OnAddMechComment.bind(this);
    this.OnMechDelete = this.OnMechDelete.bind(this);
    this.DoPropEdit = this.DoPropEdit.bind(this);
    this.OnMechAdd = this.OnMechAdd.bind(this);
    this.OnMechEdit = this.OnMechEdit.bind(this);
    this.DoMechClosed = this.DoMechClosed.bind(this);
    this.OnComponentAdd = this.OnComponentAdd.bind(this);
    this.OnPropDialogClose = this.OnPropDialogClose.bind(this);
    this.handleEvLinkSourceSelectRequest =
      this.handleEvLinkSourceSelectRequest.bind(this);
    this.DoSelectionChange = this.DoSelectionChange.bind(this);
    this.OnCloseModel = this.OnCloseModel.bind(this);
    this.OnLogout = this.OnLogout.bind(this);
    this.OnHelp = this.OnHelp.bind(this);
    UR.Subscribe('WINDOW_SIZE', this.UpdateDimensions);
    UR.Subscribe('DATA_UPDATED', this.DoDataUpdate);
    UR.Subscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate);
    UR.Subscribe('SELECTION_CHANGED', this.DoSelectionChange);
    UR.Subscribe('MODEL_TITLE_UPDATED', this.DoModelTitleUpdate);
    UR.Subscribe('SHOW_EVIDENCE_LINK', this.OnShowEvidenceLink);
    UR.Subscribe('OUTCOME_ADD', this.OnOutcomeAdd);
    UR.Subscribe('PROP_ADD', this.OnComponentAdd);
    UR.Subscribe('PROPDIALOG_CLOSE', this.OnPropDialogClose);
    UR.Subscribe('MECH_ADD', this.OnMechAdd);
    UR.Subscribe(
      'REQUEST_SELECT_EVLINK_SOURCE',
      this.handleEvLinkSourceSelectRequest
    );
    UR.Subscribe('MECHDIALOG_CLOSED', this.DoMechClosed);
    this.state = {
      title: '',
      modelId: '',
      modelAuthorGroupName: '',
      isModelAuthor: true,
      studentId: '',
      studentName: '',
      studentGroup: '',
      viewHeight: 0, // need to init this to prevent error with first render of resourceList
      toolsPanelIsOpen: true,
      resourceLibraryIsOpen: true,
      addPropOpen: false,
      addEdgeOpen: false,
      addEdgeSource: '', // Add Mech Dialog
      addEdgeTarget: '', // Add Mech Dialog
      componentIsSelected: false, // A component or component property has been selected by user.  Used for pro-centric actions.
      outcomeIsSelected: false, // A outcome or outcome property has been selected by user.  Used for pro-centric actions.
      mechIsSelected: false // A mechanism is slected by user.  Used for mech-centric actions.
    };
  }

  componentDidMount() {
    // console.log(`%ccomponentDidMount()`, cssreact);
    //
    // child components need to know the dimensions
    // of this component, but they are invalid until
    // the root component renders in SystemInit.
    // SystemInit fires `WINDOW_SIZE` to force the
    // relayout
  }

  componentWillUnmount() {
    UR.Unsubscribe('WINDOW:SIZE', this.UpdateDimensions);
    UR.Unsubscribe('DATA_UPDATED', this.DoDataUpdate);
    UR.Unsubscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate);
    UR.Unsubscribe('SELECTION_CHANGED', this.DoSelectionChange);
    UR.Unsubscribe('MODEL_TITLE_UPDATED', this.DoModelTitleUpdate);
    UR.Unsubscribe('SHOW_EVIDENCE_LINK', this.OnShowEvidenceLink);
    UR.Unsubscribe('OUTCOME_ADD', this.OnOutcomeAdd);
    UR.Unsubscribe('PROP_ADD', this.OnComponentAdd);
    UR.Unsubscribe('PROPDIALOG_CLOSE', this.OnPropDialogClose);
    UR.Unsubscribe('MECH_ADD', this.OnMechAdd);
    UR.Unsubscribe(
      'REQUEST_SELECT_EVLINK_SOURCE',
      this.handleEvLinkSourceSelectRequest
    );
    UR.Unsubscribe('MECHDIALOG_CLOSED', this.DoMechClosed);
  }

  // PMCData calls DATA_UPDATED after loading model.
  // Here we update the model meta info
  DoDataUpdate() {
    if (DBG) console.log(PKG, 'DATA_UPDATE');
    // Read the group info from the model and set parameters

    // FIXME: The URSYS call should probably pass the modelId, e.g. data.modelId
    const modelId = ADM.GetSelectedModelId(); // get selected model for now
    const model = ADM.GetModelById(modelId);
    const title = ADM.GetModelTitle(modelId);
    const modelAuthorGroupName = ADM.GetGroupName(model ? model.groupId : '');
    const userStudentId = ADM.GetAuthorId();
    const userGroupId = ADM.GetGroupIdByStudent(userStudentId);
    const isModelAuthor = userGroupId === (model ? model.groupId : '');
    this.setState({
      title,
      modelId,
      modelAuthorGroupName,
      isModelAuthor,
      studentId: userStudentId,
      studentName: ADM.GetLoggedInUserName(),
      studentGroup: ADM.GetLoggedInGroupName()
    });
  }

  DoADMDataUpdate() {
    this.DoDataUpdate();
  }

  UpdateDimensions() {
    const { toolsPanelIsOpen, resourceLibraryIsOpen } = this.state;
    let sidebarwidth = resourceLibraryIsOpen ? SIDEBARWIDTH : 0;
    sidebarwidth += toolsPanelIsOpen ? SIDEBARWIDTH : 0;

    this.viewRect = this.refView.current.getBoundingClientRect();
    // NOTE: viewWidth/viewHeight
    const viewWidth = this.viewRect.width;
    const viewHeight = this.viewRect.height;
    const innerWidth = window.innerWidth - sidebarwidth;
    const innerHeight = window.innerHeight;
    console.log(
      'UpdateDimensions',
      'toolsPanelIsOpen',
      toolsPanelIsOpen,
      'resourceLibraryIsOpen',
      resourceLibraryIsOpen,
      'viewWidth',
      viewWidth,
      'window.innerWidth',
      window.innerWidth,
      'sidebarwidth',
      sidebarwidth,
      'innerWidth',
      innerWidth
    );
    this.setState({
      viewWidth: innerWidth,
      viewHeight: innerHeight
    });
    // orig -- use smaller of innner, but with non-MUI sidebars, just use full width
    // this.setState({
    //   viewWidth: Math.min(viewWidth, innerWidth),
    //   viewHeight: Math.min(viewHeight, innerHeight)
    // });
  }

  DoModelTitleUpdate(data) {
    if (this.state.modelId === data.id) this.setState({ title: data.title });
  }

  OnChangeModelTitle(e) {
    this.setState({ title: e.target.value });
  }

  DoSaveModelTitle() {
    ADM.DB_ModelTitleUpdate(this.state.modelId, this.state.title);
  }

  DoSubmitModelTitleForm(e) {
    e.preventDefault();
    e.stopPropagation();
    document.activeElement.blur(); // will trigger save
  }

  OnToggleToolsPanel() {
    this.setState({ toolsPanelIsOpen: !this.state.toolsPanelIsOpen }, () =>
      this.UpdateDimensions()
    );
  }

  OnToggleResourceLibrary() {
    this.setState({ resourceLibraryIsOpen: !this.state.resourceLibraryIsOpen }, () =>
      this.UpdateDimensions()
    );
  }

  OnShowEvidenceLink() {
    this.setState({ resourceLibraryIsOpen: true });
  }

  // User clicked on "(+) Add Outcome" drawer button
  OnOutcomeAdd() {
    UR.Publish('PROPDIALOG_OPEN', {
      isProperty: false,
      propType: DATAMAP.PMC_MODELTYPES.OUTCOME.id
    });
    this.setState({
      addPropOpen: true
    });
  }

  // User clicked on "(+) Add Component" drawer button
  OnComponentAdd() {
    UR.Publish('PROPDIALOG_OPEN', {
      isProperty: false,
      propType: DATAMAP.PMC_MODELTYPES.COMPONENT.id
    });
    this.setState({
      addPropOpen: true
    });
  }

  // User selected component/prop and clicked on "(+) Add Property Button"
  OnPropAdd() {
    let propType = this.state.componentIsSelected
      ? DATAMAP.PMC_MODELTYPES.COMPONENT.id
      : DATAMAP.PMC_MODELTYPES.OUTCOME.id;
    UR.Publish('PROPDIALOG_OPEN', { isProperty: true, propType });
    this.setState({
      addPropOpen: true
    });
  }

  // User selected component/prop and clicked on "(/) Edit Component / Property" button
  DoPropEdit() {
    let selectedPropIds = DATA.VM_SelectedPropsIds();
    if (selectedPropIds.length > 0) {
      let propId = selectedPropIds[0];
      let prop = DATA.Prop(propId);
      UR.Publish('PROPDIALOG_OPEN', {
        label: prop.name,
        propId,
        propType: prop.propType,
        description: prop.description,
        isProperty: false
      });
      this.setState({
        addPropOpen: true
      });
    }
  }

  OnPropDialogClose() {
    if (DBG) console.log('close');
    this.setState({ addPropOpen: false });
  }

  // User selected component/prop and clicked on "() Delete"
  OnPropDelete() {
    const selectedPropIds = DATA.VM_SelectedPropsIds();
    if (selectedPropIds.length > 0) {
      const pmcDataId = ASET.selectedPMCDataId;
      const propId = Number(selectedPropIds[0]);
      UR.DBTryLock('pmcData.entities', [pmcDataId, propId]).then(rdata => {
        const { success, semaphore, uaddr, lockedBy } = rdata;
        status += success
          ? `${semaphore} lock acquired by ${uaddr} `
          : `failed to acquired ${semaphore} lock `;
        if (rdata.success) {
          DATA.PMC_PropDelete(propId);
          if (this.state.addEdgeSource === propId) {
            this.setState({
              addEdgeSource: ''
            });
          }
        } else {
          alert(
            `Sorry, someone else (${rdata.lockedBy}) is editing this Component / Property right now.  Please try again later.`
          );
        }
      });
    }
    this.setState({
      componentIsSelected: false
    });
  }

  OnAddPropComment() {
    let selectedPropIds = DATA.VM_SelectedPropsIds();
    if (selectedPropIds.length > 0) {
      let propId = selectedPropIds[0];
      UR.Publish('STICKY_OPEN', {
        refId: propId,
        // FIXME: Set position according to parent prop?
        x: 600, // stickynote hack moves it by -325
        y: 100
      });
    }
  }

  OnAddMechComment() {
    let selectedMechIds = DATA.VM_SelectedMechIds();
    if (selectedMechIds.length > 0) {
      let mechId = selectedMechIds[0];
      let mech = DATA.Mech(mechId);
      UR.Publish('STICKY_OPEN', {
        refId: mech.id,
        // FIXME: Set position according to parent prop?
        x: 600, // stickynote hack moves it by -325
        y: 100
      });
    }
  }

  OnMechAdd() {
    if (DBG) console.log('Add!');
    // Deselect any mechanisms that might be currently selected so that user can select props
    DATA.VM_DeselectAllMechs();
    this.setState({
      suppressSelection: true // used to hide Add/Edit buttons
    });
    UR.Publish('MECHDIALOG:ADD');
  }

  // User selected mechanism and clicked on "(/) Edit Mechanism" button
  OnMechEdit() {
    let selectedMechIds = DATA.VM_SelectedMechIds();
    if (selectedMechIds.length > 0) {
      DATA.VM_DeselectAll(); // deselect so mech buttons disappear
      this.setState({
        suppressSelection: true, // used to hide Add/Edit buttons
        addEdgeOpen: true
      });
      let mechId = selectedMechIds[0];
      let mech = DATA.Mech(mechId);
      let vw = mechId.split(':');
      let data = {
        id: mech.id, // we want db id, not graphlib mechId
        label: mech.name,
        description: mech.description,
        sourceId: vw[0],
        targetId: vw[1],
        bidirectional: mech.bidirectional
      };
      UR.Publish('MECHDIALOG:EDIT', data);
    }
  }

  DoMechClosed() {
    this.setState({
      suppressSelection: false,
      addEdgeOpen: false
    });
  }

  // User selected component/prop and clicked on "() Delete"
  OnMechDelete() {
    let selectedMechIds = DATA.VM_SelectedMechIds();
    if (selectedMechIds.length > 0) {
      const mechId = selectedMechIds[0];
      const pmcDataId = ASET.selectedPMCDataId;
      const mech = DATA.Mech(mechId);
      const intMechId = Number(mech.id);
      UR.DBTryLock('pmcData.entities', [pmcDataId, intMechId]).then(rdata => {
        const { success, semaphore, uaddr, lockedBy } = rdata;
        status += success
          ? `${semaphore} lock acquired by ${uaddr} `
          : `failed to acquired ${semaphore} lock `;
        if (rdata.success) {
          DATA.PMC_MechDelete(mechId);
        } else {
          alert(
            `Sorry, someone else (${rdata.lockedBy}) is editing this Mechanism right now.  Please try again later.`
          );
        }
      });
    }
    this.setState({
      mechIsSelected: false
    });
  }

  OnPropDialogCreateClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (DBG) console.log('create prop');
    if (this.state.addPropIsProperty) {
      // Add a property to the selected component
      let selectedPropIds = DATA.VM_SelectedPropsIds();
      if (selectedPropIds.length > 0) {
        let parentPropId = selectedPropIds[0];
        if (DBG)
          console.log(
            '...setting parent of',
            this.state.addPropLabel,
            'to',
            parentPropId
          );
        // Create new prop
        DATA.PMC_PropAdd(this.state.addPropLabel, parentPropId);
      }
    } else if (this.state.addPropPropId !== '') {
      // Update existing prop
      const id = parseInt(this.state.addPropPropId);
      const name = this.state.addPropLabel;
      DATA.PMC_PropUpdate(id, { name });
    } else {
      // Create new prop
      DATA.PMC_PropAdd(this.state.addPropLabel);
    }
    this.OnPropDialogClose();
  }

  /*/
   *  User wants to set the source on an EvidenceLink, so:
   *  1. Close the ResourceView if open,
   *  2. Show and expand the evidence
   *  3. Enable source selection on the Evidence Link
  /*/
  handleEvLinkSourceSelectRequest(urdata) {
    this.setState({ resourceViewOpen: false }, () => {
      UR.Publish('RESOURCEVIEW:CLOSE');
      UR.Publish('EVLINK:ENABLE_SOURCE_SELECT', { evId: urdata.evId });
    });
  }

  // FIXME
  // Review: REMOVE VMECH CALLS HERE!
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

    // Set componentIsSelected for Component Editing
    // If more than one component is selected, hide the component
    // editing buttons
    let componentIsSelected = false;
    let outcomeIsSelected = false;
    if (selectedPropIds.length === 1 && !this.state.addEdgeOpen) {
      let selectedProp = DATA.Prop(selectedPropIds[0]);
      switch (selectedProp.propType) {
        case DATAMAP.PMC_MODELTYPES.OUTCOME.id:
          outcomeIsSelected = true;
          break;
        default:
        case DATAMAP.PMC_MODELTYPES.COMPONENT.id:
          componentIsSelected = true;
          break;
      }
    }
    // Set mechIsSelected for Mech Editing
    // If more than one mech is selected, hide the mech
    // editing buttons
    let mechIsSelected = false;
    let selectedMechIds = DATA.VM_SelectedMechIds();
    if (selectedMechIds.length === 1 && !this.state.addEdgeOpen)
      mechIsSelected = true;

    this.setState({
      addEdgeSource: sourceId,
      addEdgeTarget: targetId,
      componentIsSelected,
      outcomeIsSelected,
      mechIsSelected
    });
  }

  OnCloseModel() {
    UR.Publish('MECHDIALOG:CLOSE');
    UR.Publish('STICKY_CLOSE');
    UR.Publish('RATING_CLOSE');
    ADM.CloseModel();
  }

  OnLogout() {
    UR.Publish('MECHDIALOG:CLOSE');
    UR.Publish('STICKY_CLOSE');
    UR.Publish('RATING_CLOSE');
    ADM.Logout();
  }

  OnHelp() {
    UR.Publish('HELP_OPEN');
  }

  render() {
    const { theme: classes } = this.props;

    const {
      modelId,
      modelAuthorGroupName,
      isModelAuthor,
      title,
      studentId,
      studentName,
      studentGroup,
      toolsPanelIsOpen,
      resourceLibraryIsOpen,
      addPropOpen,
      addEdgeOpen,
      componentIsSelected,
      outcomeIsSelected,
      mechIsSelected,
      suppressSelection
    } = this.state;

    // we need to use the model author here, not the currently logged in student.
    const model = ADM.GetModelById(modelId);
    const classroomId = model ? ADM.GetClassroomIdByGroup(model.groupId) : '';
    const resources =
      classroomId !== '' ? ADM.GetResourcesForClassroom(classroomId) : [];

    const isViewOnly = ADM.IsViewOnly();
    const isDBReadOnly = ADM.IsDBReadOnly();
    let viewStatus;
    viewStatus = isViewOnly ? 'VIEW MODE' : '';
    viewStatus = isDBReadOnly ? 'DATABASE ARCHIVE REVIEW MODE' : '';

    // Layout
    const toolsPanelWidth = toolsPanelIsOpen ? `${SIDEBARWIDTH}px` : '0px';
    const resourceLibraryWidth = resourceLibraryIsOpen ? `${SIDEBARWIDTH}px` : '0px';
    const gridColumns = `${toolsPanelWidth} auto ${resourceLibraryWidth}`;

    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const DIALOGS = (
      <>
        <WLogin />
        <WModelSelect />
        {/* Resource View */}
        <EVResourceItemDialog />
        {/* Prop Dialog -- Property label editing dialog */}
        <WPropDialog />
        {/* General Information Dialog */}
        <InfoDialog />
        <StickyNoteCollection />
        <MechDialog />
        <WRatingsDialog />
        <WScreenshotView />
      </>
    );
    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const APPBAR_ELEMENTS = toolsPanelIsOpen ? (
      ''
    ) : (
      <div onClick={this.OnToggleToolsPanel}>&gt;&gt;</div>
    );
    const APPBAR_RESOURCELIB = resourceLibraryIsOpen ? (
      ''
    ) : (
      <div onClick={this.OnToggleResourceLibrary}>&lt;&lt;</div>
    );
    const APPBAR = (
      <div className={`appbar ${isModelAuthor ? '' : 'otherauthor'}`}>
        {APPBAR_ELEMENTS}
        <div onClick={this.OnCloseModel}>Home</div>
        <form onSubmit={this.DoSubmitModelTitleForm}>
          <input
            type="text"
            id="projectTitle"
            style={{ flexGrow: 1 }}
            placeholder="Untitled Model"
            value={title}
            disabled={isViewOnly}
            onChange={this.OnChangeModelTitle}
            onBlur={this.DoSaveModelTitle}
          />
        </form>
        <div>by {modelAuthorGroupName} Group</div>
        <StickyNoteButton refId="9999" />
        <button onClick={this.OnCloseModel}>
          {studentName}&nbsp;:&nbsp;{studentGroup}
        </button>
        <button onClick={this.OnLogout}>Logout</button>
        <button onClick={this.OnHelp}>?</button>
        {APPBAR_RESOURCELIB}
      </div>
    );
    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    /// Left Tool Sidebar Drawer
    const PANELTOOLS = (
      <MEPanelTools
        isDisabled={addPropOpen || addEdgeOpen}
        toggleOpen={this.OnToggleToolsPanel}
      />
    );
    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const PANELRESOURCES = (
      <MEPanelResources
        toggleOpen={this.OnToggleResourceLibrary}
        resources={resources}
      />
    );
    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    /// Component/Mech add/edit/delete buttons that respond to selection events
    const CONTROLBAR = (
      <div className="controlbar" hidden={suppressSelection}>
        <button
          className="danger"
          hidden={
            !(componentIsSelected || outcomeIsSelected || mechIsSelected) ||
            isViewOnly
          }
          onClick={
            componentIsSelected || outcomeIsSelected
              ? this.OnPropDelete
              : this.OnMechDelete
          }
        >
          <DeleteRoundedIcon />
          &nbsp;&nbsp;Delete&nbsp;
        </button>
        <button
          className="primary"
          hidden={
            !(componentIsSelected || outcomeIsSelected || mechIsSelected) ||
            isViewOnly
          }
          onClick={
            componentIsSelected || outcomeIsSelected
              ? this.DoPropEdit
              : this.OnMechEdit
          }
        >
          <EditIcon />
          &nbsp;&nbsp;Edit{' '}
          {componentIsSelected
            ? DATAMAP.PMC_MODELTYPES.COMPONENT.label
            : outcomeIsSelected
              ? DATAMAP.PMC_MODELTYPES.OUTCOME.label
              : DATAMAP.PMC_MODELTYPES.MECHANISM.label}
        </button>
        <button
          className="primary"
          hidden={!(componentIsSelected || outcomeIsSelected) || isViewOnly}
          onClick={this.OnPropAdd}
        >
          <AddIcon /> Add property
        </button>
        <button
          className="comment"
          hidden={
            !(componentIsSelected || outcomeIsSelected || mechIsSelected) ||
            isDBReadOnly
          }
          onClick={
            componentIsSelected || outcomeIsSelected
              ? this.OnAddPropComment
              : this.OnAddMechComment
          }
        >
          <ChatBubbleOutlineIcon htmlColor={yellow[800]} />
          &nbsp;&nbsp;Add Comment
        </button>
      </div>
    );
    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const MAINVIEW = (
      <div style={{ backgroundColor: 'red' }} ref={this.refMain}>
        <div
          className="view"
          ref={this.refView}
          // style={{
          //   height: this.state.viewHeight
          // }}
        >
          <Switch>
            <Route
              path="/:mode"
              render={props => (
                <RoutedView
                  {...props}
                  viewHeight={this.state.viewHeight}
                  viewWidth={this.state.viewWidth}
                />
              )}
            />
            <Route
              path="/"
              render={props => (
                <RoutedView
                  {...props}
                  viewHeight={this.state.viewHeight}
                  viewWidth={this.state.viewWidth}
                />
              )}
            />
          </Switch>
          <ZoomInMapIcon
            onClick={() => UR.Publish('SVG_PANZOOM_RESET')}
            style={{ position: 'absolute', left: '20px', top: '20px' }}
          />
          <ZoomOutMapIcon
            onClick={() => UR.Publish('SVG_PANZOOM_OUT')}
            style={{ position: 'absolute', left: '20px', top: '52px' }}
          />
          <div
            className="help"
            style={{ position: 'absolute', left: '20px', bottom: '12px' }}
          >
            {/* STATUS LABEL */}
            {viewStatus}
          </div>
          {CONTROLBAR}
          <WDescriptionPopup />
          <WHelpView />
        </div>
      </div>
    );

    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    return (
      <div className="MEME">
        <div className="ViewMEME" style={{ gridTemplateColumns: gridColumns }}>
          <div className="leftsidebar">{PANELTOOLS}</div>
          <div className="main">
            {APPBAR}
            {MAINVIEW}
            {DIALOGS}
          </div>
          <div className="rightsidebar">{PANELRESOURCES}</div>
        </div>
      </div>
    );
  }
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// default props are expect properties that we expect
/// and are declared for validation
ViewMEME.defaultProps = {
  classes: {}
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// propTypes are declared. Note "vague" propstypes are
/// disallowed by eslint, so use shape({prop: ProtType })
/// to describe them in more detail
ViewMEME.propTypes = {
  classes: PropTypes.shape({})
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// requirement for UR MODULES and COMPONENTS
ViewMEME.MOD_ID = __dirname;

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// include MaterialUI styles
export default ViewMEME;
