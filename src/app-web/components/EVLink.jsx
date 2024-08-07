/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

EvidenceLinks are used to display individual pieces of evidence created by
students to link an information resource item (e.g. simulation, report) to
a component, property, or mechanism.

They are controlled components.


# Life Cycle

## Saving Data

Triggers to save data happens in multiple places:

1. Non-text field modifications immediately save data:
  * Setting the target link immediately saves data
  * Setting the rating immediately saves data
  * Adding a screenshot immediate saves data
  * Adding a comment immediately saves data

2. Text field modifications triggers saves when:
  * OnBlur for the text field -- This is necessary to catch the user
    navigating away, e.g. clicking on "Model" to select a new model
  * When the "Close" button is clicked
  * When the user clicks on a prop or mech to select it
  * When the user clicks away from the evidence link (e.g. on model)
  * When the user clicks on "Model" to select a new model, or logs out
  * When the user clicks away from the browser
  * When the user collapses the resource
  * NOT When the user drags a prop -- no handler for drag



# QA Testing

## 1. Collapsed

* [ ]  a. Click to expand/contract
* [ ]  b. Comments can be added
* [ ]  c. Ratings can be changed

## 2. Expanded, Non-Edit Mode

* [ ]  a. Click disclosure triangle to collapse
* [ ]  b. Comments can be added
* [ ]  c. Ratings can be changed
* [ ]  d. Delete works
* [ ]  e. Duplicate works
* [ ]  f. Edit mode can be turned don

## 3. Edit Mode

* [ ]  a. When edit mode is set, focus is in Description field
* [ ]  b. Comments can be added
* [ ]  xx  b1. When comment is completed, retain edit mode? <= Not implemented
* [ ]  c. Link Button click to set target
* [ ]     c1. After clicking on target, edit mode is maintained
* [ ]  d. Ratings can be changed
* [ ]     d1. After setting rating, edit mode is maintained
* [ ]  e. Description field change text
* [ ]     e1. Blur will trigger save
* [ ]     e2. ClickAway will trigger save, but not duplicate blur save
* [ ]  f. Why field change text
* [ ]     f1. Blur will trigger save
* [ ]     f2. ClickAway will trigger save, but not duplicate blur save
* [ ]  g. Can add a screesnhot

## 4. From Resource View

* [ ]  a. Link Button click to set target
* [ ]     a0. Any changes to Description or Note is saved
* [ ]     a1. ResourceView will close
* [ ]     a2. ResourceItem will expand if collapsed
* [ ]     a3. EvLink item in ResourceItem will be expanded
* [ ]     a4. EvLink will go into Edit Mode
* [ ]     a5. EvLink LinkButton is ready to set target
* [ ]     a6. Clicking target will set target in LinkButton

## 5. Networked

* [ ]  a. When evidence is not being edited, any updates to the evidence from another
          computer should be loaded and displayed, whether collapsed or expanded.
* [ ]  b. If someone else is editing the Evidence Link and you try to edit the
          Evidence Link you should get an error about someone else editing and you
          should not be able to enter edit mode.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import './MEMEStyles.css';
import './EVLink.css';

import ICNCountBadge from './ICNCountBadge';
import ICNExpandSingleArrow from './ICNExpandSingleArrow';

// Material UI Elements
import ClickAwayListener from '@mui/material/ClickAwayListener';

// MEME
import DATAMAP from '../../system/common-datamap';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import ADM from '../modules/data';
import DATA from '../modules/data';
import ASET from '../modules/adm-settings';
import UR from '../../system/ursys';
import EXT from '../../system/ur-extension';
import StickyNoteButton from './StickyNoteButton';
import WRatingButton from './WRatingButton';
import EVLinkButton from './EVLinkButton';
import { Dropzone } from './Dropzone';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'EVLink:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @class
 */
class EVLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      note: this.props.evlink.note,
      rating: this.props.evlink.rating,
      ratingDefs: [],
      why: this.props.evlink.why,
      isBeingEdited: false,
      isExpanded: false,
      isHovered: false,
      listenForSourceSelection: false, // Used to set LinkButton state
      listenForRatingSelection: false, // Used to skip saves when editing rating
      needsSaving: false,
      saveInProgress: false
    };

    // Handle Promise cancellation
    this._isMounted = false;

    // Handle Focus
    // create a ref to store the evlink and textInput DOM elements
    this.ref = React.createRef(); // used for scrollIntoView
    this.textInputRef = React.createRef(); // used for focusTextInput

    this.DoDataUpdate = this.DoDataUpdate.bind(this);
    this.DoScrollIntoView = this.DoScrollIntoView.bind(this);
    this.DoEditStart = this.DoEditStart.bind(this);
    this.DoEditStop = this.DoEditStop.bind(this);
    this.DoSave = this.DoSave.bind(this);
    this.OnCancelButtonClick = this.OnCancelButtonClick.bind(this);
    this.OnDeleteButtonClick = this.OnDeleteButtonClick.bind(this);
    this.OnDuplicateButtonClick = this.OnDuplicateButtonClick.bind(this);
    this.OnEditButtonClick = this.OnEditButtonClick.bind(this);
    this.OnSaveButtonClick = this.OnSaveButtonClick.bind(this);
    this.OnClickAway = this.OnClickAway.bind(this);
    this.OnBlur = this.OnBlur.bind(this);
    this.DoEvidenceLinkOpen = this.DoEvidenceLinkOpen.bind(this);
    this.OnScreenShotClick = this.OnScreenShotClick.bind(this);
    this.OnCaptureScreenShotClick = this.OnCaptureScreenShotClick.bind(this);
    this.OnNoteChange = this.OnNoteChange.bind(this);
    this.OnWhyChange = this.OnWhyChange.bind(this);
    this.OnLinkButtonClick = this.OnLinkButtonClick.bind(this);
    this.DoEnableSourceSelect = this.DoEnableSourceSelect.bind(this);
    this.DoSelectionChange = this.DoSelectionChange.bind(this);
    this.DoToggleExpanded = this.DoToggleExpanded.bind(this);
    this.OnRatingButtonClick = this.OnRatingButtonClick.bind(this);
    this.OnDrop = this.OnDrop.bind(this);

    UR.Subscribe('DATA_UPDATED', this.DoDataUpdate);
    UR.Subscribe('SHOW_EVIDENCE_LINK_SECONDARY', this.DoEvidenceLinkOpen);
    UR.Subscribe('EVLINK:ENABLE_SOURCE_SELECT', this.DoEnableSourceSelect);
    UR.Subscribe('SELECTION_CHANGED', this.DoSelectionChange);
  }

  componentDidMount() {
    this._isMounted = true;
    this.DoDataUpdate(); // Force load ratingDefs
  }

  componentWillUnmount() {
    this._isMounted = false;
    UR.Unsubscribe('DATA_UPDATED', this.DoDataUpdate);
    UR.Unsubscribe('SHOW_EVIDENCE_LINK_SECONDARY', this.DoEvidenceLinkOpen);
    UR.Unsubscribe('EVLINK:ENABLE_SOURCE_SELECT', this.DoEnableSourceSelect);
    UR.Unsubscribe('SELECTION_CHANGED', this.DoSelectionChange);
  }

  DoDataUpdate() {
    // The same EvidenceLink can be displayed in both the Resource Library
    // and a Resource View.  If one is updated, the other needs to update itself
    // via the DATA_UPDATED call because `note` is only set by props
    // during construction.
    let evlink = DATA.PMC_GetEvLinkByEvId(this.props.evlink.id);
    if (evlink) {
      // Get current model's rating definitions
      const model = ADM.GetModelById();
      const classroomId = ADM.GetClassroomIdByGroup(model.groupId);
      const ratingDefs = ADM.GetRatingsDefinition(classroomId);
      let { note, rating, why } = evlink;
      this.setState({
        note,
        rating,
        ratingDefs,
        why
      });
    }
    // Don't throw an error here
    // If the EvidenceLink has been deleted, the deletion event triggers
    // DATA_UPDATED, so this EvidenceLink may receive the event before
    // it's been unmounted.  Just ignore missing EvidenceLink.
    // throw Error(`no evidence link with evId '${this.props.evId}' exists`);
  }

  DoScrollIntoView() {
    this.ref.current.scrollIntoView({ block: 'start', inline: 'start' }); // alignToTop=true
  }

  DoEditStart() {
    const pmcDataId = ASET.selectedPMCDataId;
    const intEvId = Number(this.props.evlink.id);
    UR.DBTryLock('pmcData.entities', [pmcDataId, intEvId]).then(rdata => {
      const { success, semaphore, uaddr, lockedBy } = rdata;
      status += success
        ? `${semaphore} lock acquired by ${uaddr} `
        : `failed to acquired ${semaphore} lock `;
      if (rdata.success) {
        this.setState(
          {
            isBeingEdited: true,
            isExpanded: true
          },
          () => this.FocusTextInput()
        );
        UR.Publish('EVIDENCE_EDIT_STATE', { isBeingEdited: true });
      } else {
        console.log('aw, locked by', rdata.lockedBy);
        alert(
          `Sorry, someone else (${rdata.lockedBy}) is editing this Evidence Link right now.  Please try again later.`
        );
      }
    });
  }

  DoEditStop() {
    this.setState({
      isBeingEdited: false,
      listenForSourceSelection: false // cancel out and restore orig values
    });
    const pmcDataId = ASET.selectedPMCDataId;
    const intEvId = Number(this.props.evlink.id);
    UR.Publish('EVIDENCE_EDIT_STATE', { isBeingEdited: false });
    UR.DBTryRelease('pmcData.entities', [pmcDataId, intEvId]);
  }

  DoSave() {
    // If a save has already been triggered, don't save again?
    if (this.state.saveInProgress) {
      if (DBG) console.log('DoSave skipping -- saveInProgress');
      return;
    }
    if (!this.state.needsSaving) {
      if (DBG) console.log("DoSave skipping -- doesn't need saving");
      return;
    }

    // Comments, Targets, Ratings are all immediately saved
    // when they are changed.  So the only thing we need to explicitly
    // save are the two text fields: Description and Why
    this.setState(
      {
        saveInProgress: true,
        needsSaving: false
      },
      () =>
        DATA.SetEvidenceLinkTextFields(this.props.evlink.id, {
          note: this.state.note,
          why: this.state.why
        }).then(() => {
          // The promise can get returned after the component is unmounted
          // which will generate a warning if the user clicks on "Model"
          // so only set the state if the componet is still mounted
          if (this._isMounted) {
            this.setState({
              saveInProgress: false
            });
          }
        })
    );
  }

  OnScreenShotClick(e) {
    e.stopPropagation();
    // show screenshot large
    // give option of reseting imageURL
    UR.Publish('SCREENSHOT_OPEN', {
      evId: this.props.evlink.id,
      imageURL: this.props.evlink.imageURL
    });
  }

  OnCaptureScreenShotClick(e) {
    e.stopPropagation();
    const resourceFrame = document.getElementById('resourceFrame');
    if (resourceFrame !== null) {
      const px = window.devicePixelRatio;
      const sx = resourceFrame.offsetLeft * px;
      const sy = resourceFrame.offsetTop * px;
      const sw = resourceFrame.clientWidth * px;
      const sh = resourceFrame.clientHeight * px;
      let opt = { sx, sy, sw, sh };
      UR.PromiseCaptureScreen(opt).then(rdata => {
        const { href, error } = rdata;
        if (error) console.log('PromiseCaptureScreen:', error);
        if (href) DATA.PMC_EvidenceUpdate(this.props.evlink.id, { imageURL: href });
      });
    }
  }

  // Not being used
  OnCancelButtonClick(e) {
    e.stopPropagation();
    this.DoEditStop();
    // restore previous note
    this.setState({
      note: this.props.evlink.note,
      why: this.props.evlink.why
    });
  }

  OnDeleteButtonClick() {
    const pmcDataId = ASET.selectedPMCDataId;
    const intEvId = Number(this.props.evlink.id);
    UR.DBTryLock('pmcData.entities', [pmcDataId, intEvId]).then(rdata => {
      const { success, semaphore, uaddr, lockedBy } = rdata;
      status += success
        ? `${semaphore} lock acquired by ${uaddr} `
        : `failed to acquired ${semaphore} lock `;
      if (rdata.success) {
        DATA.PMC_DeleteEvidenceLink(this.props.evlink.id);
      } else {
        alert(
          `Sorry, someone else (${rdata.lockedBy}) is editing this Evidence Link right now.  Please try again later.`
        );
      }
    });
  }

  OnDuplicateButtonClick() {
    DATA.PMC_DuplicateEvidenceLink(this.props.evlink.id, id => {
      const newEvLink = DATA.PMC_GetEvLinkByEvId(id);
      UR.Publish('SHOW_EVIDENCE_LINK', {
        evId: newEvLink.id,
        rsrcId: newEvLink.rsrcId
      });
    });
  }

  OnEditButtonClick(e) {
    e.stopPropagation();
    this.DoEditStart();
  }

  FocusTextInput() {
    // Explicitly focus the text input using the raw DOM API
    // Note: we're accessing "current" to get the DOM node
    // https://reactjs.org/docs/refs-and-the-dom.html#adding-a-ref-to-a-dom-element
    // https://stackoverflow.com/questions/52222988/how-to-focus-a-material-ui-textfield-on-button-click/52223078
    this.textInputRef.current.focus();
    // Set cursor to end of text.
    const pos = this.textInputRef.current.value.length;
    this.textInputRef.current.setSelectionRange(pos, pos);
  }

  OnSaveButtonClick(e) {
    e.stopPropagation();
    this.DoSave();
    this.DoEditStop();
  }

  OnBlur(e) {
    // OnBlur will trigger before any state updates
    if (DBG) console.log('onblur triggering save');
    this.DoSave();
  }

  OnClickAway(e) {
    if (this.state.isBeingEdited) {
      if (DBG) console.log('clickaway (evlink)');

      // If the user is only changing the rating or setting a target link, don't exit Edit Mode
      if (
        !this.state.listenForRatingSelection &&
        !this.state.listenForSourceSelection
      ) {
        // only save if we're not setting a rating or listening for source
        this.DoSave();
        this.DoEditStop();
      }

      // Clear listens
      // should rating be cleared by some other clearer mechanism?
      this.setState({
        listenForRatingSelection: false
      });
    }
  }

  DoEvidenceLinkOpen(data) {
    if (this.props.evlink.id === data.evId) {
      if (DBG) console.log(PKG, 'Expanding', data.evId);

      // If we're being opened for the first time, notes is empty
      // and no links have been set, so automatically go into edit mode
      if (
        this.props.evlink.note === '' ||
        (this.props.evlink.propId === undefined &&
          this.props.evlink.mechId === undefined)
      ) {
        this.DoEditStart();
      } else {
        // just expand
        this.setState({
          isExpanded: true
        });
        this.DoScrollIntoView();
      }
    } else {
      // Always contract if someone else is expanding
      // This is only called when an evidence link is opened
      // programmaticaly either when creating a new evidence link
      // or expanding one via a badge.
      // A user can still directly expand two simultaneously.
      this.setState({ isExpanded: false });
    }
  }

  OnNoteChange(e) {
    if (DBG) console.log(PKG, 'Note Change:', e.target.value);
    this.setState({
      note: e.target.value,
      needsSaving: true
    });
  }

  OnWhyChange(e) {
    if (DBG) console.log(PKG, 'Why Change:', e.target.value);
    this.setState({
      why: e.target.value,
      needsSaving: true
    });
  }

  /* User has clicked on the 'link' button, so we want to
     send the request to ViewMain, which will handle
     the sequence of closing the resource view (so that the
     user can see the components for selection) and opening up
     the evLink
  */
  OnLinkButtonClick(e) {
    if (this.state.isBeingEdited) {
      this.setState({ listenForSourceSelection: true }, () => {
        // Deselect the prop first, otherwise the deleted prop will remain selected
        DATA.VM_DeselectAllProps();
        let evlink = this.props.evlink;
        UR.Publish('REQUEST_SELECT_EVLINK_SOURCE', {
          evId: evlink.id,
          rsrcId: evlink.rsrcId
        });
      });
    }
  }

  DoEnableSourceSelect(data) {
    // Other EvidenceLink has triggered a set target (usually from ResourceView)
    // so we need to listen too
    if (data.evId === this.props.evlink.id) {
      this.setState({
        listenForSourceSelection: true
      });
    }
  }

  // User has selected a different component/property/mechanism as the source
  DoSelectionChange() {
    if (this.state.listenForSourceSelection) {
      let sourceId;
      // Assume mechs are harder to select so check for them first.
      let selectedMechIds = DATA.VM_SelectedMechIds();
      if (DBG) console.log(PKG, 'selection changed mechsIds:', selectedMechIds);
      if (selectedMechIds.length > 0) {
        // Get the last selection
        sourceId = selectedMechIds[selectedMechIds.length - 1];
        DATA.SetEvidenceLinkMechId(this.props.evlink.id, sourceId).then(() => {
          if (this._isMounted) {
            this.setState({ listenForSourceSelection: false });
          }
        });
        return;
      }

      let selectedPropIds = DATA.VM_SelectedPropsIds();
      if (DBG) console.log(PKG, 'selection changed propIds:', selectedPropIds);
      if (selectedPropIds.length > 0) {
        // Get the last selection
        sourceId = selectedPropIds[selectedPropIds.length - 1];
        DATA.SetEvidenceLinkPropId(this.props.evlink.id, sourceId).then(() => {
          if (this._isMounted) {
            this.setState({ listenForSourceSelection: false });
          }
        });
      }
    }
  }

  DoToggleExpanded(event) {
    event.stopPropagation();
    event.preventDefault();
    if (this.state.isBeingEdited) return; // Don't toggle if being edited
    if (DBG) console.log(PKG, 'evidence link clicked');
    if (this.state.isExpanded) {
      this.setState({ isExpanded: false }, () => this.DoEditStop());
    } else {
      this.setState({
        isExpanded: true
      });
    }
  }

  OnRatingButtonClick() {
    if (ADM.IsViewOnly()) return;
    const data = { evId: this.props.evlink.id, rating: this.props.evlink.rating };
    this.setState(
      { listenForRatingSelection: true },
      UR.Publish('RATING_OPEN', data)
    );
  }

  OnDrop(href) {
    DATA.PMC_EvidenceUpdate(this.props.evlink.id, { imageURL: href });
  }

  render() {
    // evidenceLinks is an array of arrays because there might be more than one?!?
    const { evlink } = this.props;
    const { id, rsrcId, propId, mechId, imageURL } = evlink;
    const {
      note,
      rating,
      ratingDefs,
      why,
      isBeingEdited,
      isExpanded,
      isHovered,
      listenForSourceSelection
    } = this.state;
    if (id === '') return '';

    let sourceType;
    let sourceLabel;
    // If we are listeningForSourceSelection, then leave sourceType and sourceLabel
    // undefined so that the link button will show "Click on Target"
    // otherwise show the prop or mech linked.
    if (!listenForSourceSelection) {
      if (
        propId !== undefined &&
        propId !== null &&
        DATA.HasProp(propId) &&
        DATA.Prop(propId)
      ) {
        if (DATA.Prop(propId).propType === DATAMAP.PMC_MODELTYPES.OUTCOME.id) {
          sourceType = DATAMAP.PMC_MODELTYPES.OUTCOME.id;
        } else {
          sourceType = DATAMAP.PMC_MODELTYPES.COMPONENT.id;
        }
        sourceLabel = DATA.Prop(propId).name;
      } else if (mechId !== undefined && mechId !== null && DATA.Mech(mechId)) {
        sourceType = DATAMAP.PMC_MODELTYPES.MECHANISM.id;
        sourceLabel = DATA.Mech(mechId).name;
      }
    }

    const isViewOnly = ADM.IsViewOnly();

    // Display Capture Screen button?
    // resourceFrame's clientWidth is 0 if it's not whoing
    const resourceFrame = document.getElementById('resourceFrame');
    const resourceFrameIsVisible =
      resourceFrame !== null && resourceFrame.clientWidth > 0;
    const extensionIsConnected = EXT.IsConnected();

    /// COMPONENT RENDER ////////////////////////////////////////////////////////
    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    /// HELPER VIEWS

    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const TARGET =
      sourceType === undefined && !isBeingEdited ? (
        <label>(Not linked to model yet)</label>
      ) : (
        <EVLinkButton
          sourceType={sourceType}
          sourceLabel={sourceLabel}
          listenForSourceSelection={listenForSourceSelection}
          isBeingEdited={isBeingEdited}
          isExpanded={isExpanded}
          OnLinkButtonClick={this.OnLinkButtonClick}
        />
      );

    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const CLAIM = isBeingEdited ? (
      <input
        ref={this.textInputRef}
        type="text"
        value={note}
        placeholder="One claim from this evidence..."
        onChange={this.OnNoteChange}
        onBlur={this.OnBlur}
        onClick={e => {
          e.stopPropagation();
        }}
        autoFocus
      />
    ) : (
      <input type="text" value={note} readOnly />
    );

    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    let SCREENSHOT;
    if (imageURL === undefined || imageURL === null) {
      if (!isBeingEdited) {
        // Screenshot not defined yet -- Show message
        SCREENSHOT = <div className="static">No Screenshot</div>;
      } else {
        // Edit: No image selected -- Show dropzone
        SCREENSHOT = <Dropzone onDrop={this.OnDrop} />;
      }
    } else {
      // Edit: Image selected -- Show image with click to select
      SCREENSHOT = (
        <button onClick={this.OnScreenShotClick}>
          <img src={imageURL} alt="screenshot" />
        </button>
      );
    }

    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const RATING = (
      <WRatingButton
        rating={rating}
        isExpanded={isExpanded}
        disabled={isViewOnly}
        ratingLabel=""
        ratingDefs={ratingDefs}
        OnRatingButtonClick={this.OnRatingButtonClick}
      />
    );

    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const REASON = isBeingEdited ? (
      <textarea
        type="text"
        value={why}
        placeholder="Why did you choose this rating?"
        onChange={this.OnWhyChange}
        onBlur={this.OnBlur}
      />
    ) : (
      <textarea type="text" value={why} readOnly />
    );

    ///////////////////////////////////////////////////////////////////////////
    /// MAIN VIEWS

    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // hover: isHovered -- restore?  not currently used.
    const VIEW_COLLAPSED = (
      <div
        className={`EVLink collapsed`}
        onClick={this.DoToggleExpanded}
        key={`${rsrcId}`}
        ref={this.ref}
      >
        {/* Badge --------------------------------------------------------- */}
        <ICNCountBadge count={evlink.numberLabel} size="medium" type="ev-light" />
        {/* Title Bar ----------------------------------------------------- */}
        <div className="titlebar">
          {note && <div className="claim">{note}</div>}
          {why && <div className="reason">{why}</div>}
          <div className="target">{TARGET}</div>
        </div>
        {/* Buttons ------------------------------------------------------- */}
        <div className="rightbar">
          <StickyNoteButton refId={id} />
          {RATING}
        </div>
      </div>
    );

    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // hover: isHovered -- restore?  not currently used.
    const VIEW_EXPANDED = (
      <div
        className={`EVLink`}
        onClick={this.DoToggleExpanded}
        key={`${rsrcId}`}
        ref={this.ref}
      >
        {/* Title Bar ------------------------------------------------- */}
        <div className="titlebar">
          <ICNCountBadge count={evlink.numberLabel} size="medium" type="ev-light" />
          <div style={{ flexGrow: 1 }}></div>
          <StickyNoteButton refId={id} />
          {!isBeingEdited && <ICNExpandSingleArrow expanded={isExpanded} />}
        </div>
        {/* Leave it out for now to save space
              <div className="titlebar">
                <h3>Evidence Link</h3>
              </div>
        */}
        {/* Body  ----------------------------------------------------- */}
        <div className="ev-form">
          <label>Claim:</label>
          {CLAIM}
          <label>Screenshot:</label>
          {SCREENSHOT}
          <label>Target:</label>
          <div className="target">{TARGET}</div>
          <label>Rating:</label>
          <div className="rating">{RATING}</div>
          <label>Reason:</label>
          {REASON}
        </div>
        {/* Control Bar  ----------------------------------------------- */}
        <div className="controlbar">
          {isBeingEdited && !isViewOnly ? (
            <>
              <button className="primary" onClick={this.OnSaveButtonClick}>
                Save
              </button>
            </>
          ) : (
            <>
              <button className="primary" onClick={this.OnEditButtonClick}>
                Edit
              </button>
              <button onClick={this.OnDuplicateButtonClick}>Duplicate</button>
              <button onClick={this.OnDeleteButtonClick}>Delete</button>
            </>
          )}
        </div>
      </div>
    );

    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    /// RETURN
    return (
      <ClickAwayListener onClickAway={this.OnClickAway}>
        {isExpanded ? VIEW_EXPANDED : VIEW_COLLAPSED}
      </ClickAwayListener>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default EVLink;
