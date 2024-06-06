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
// Material UI Icons
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
// Material UI Theming
import { styled } from '@mui/system';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Material UI Elements
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import FilledInput from '@mui/material/FilledInput';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
// MEME
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import DATAMAP from '../../system/common-datamap';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from './MEMEStyles';
import ADM from '../modules/data';
import DATA from '../modules/data';
import ASET from '../modules/adm-settings';
import UR from '../../system/ursys';
import EXT from '../../system/ur-extension';
import StickyNoteButton from './StickyNoteButton';
import RatingButton from './RatingButton';
import LinkButton from './LinkButton';
import { Dropzone } from './Dropzone';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'EvidenceLink:';

/// STYLED COMPONENTS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const EvidenceBodyRow = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const EvidenceBodyRowCollapsed = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1),
  cursor: 'pointer',
  '&:hover': {
    // REVIEW: This is broken 'theme.palette.action' is undefined
    // backgroundColor: theme.palette.action.hover,
  },
}));

const EvidenceWindowLabelGrid = styled(Grid)({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});

const EvidenceWindowLabel = styled(Typography)(({ theme }) => ({
  // REVIEW: This is broken 'theme.palette.text' is undefined
  // color: theme.palette.text.secondary,
}));

const EvidenceLabelField = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  cursor: 'pointer',
  '&:hover': {
    // REVIEW: This is broken 'theme.palette.action' is undefined
    // backgroundColor: theme.palette.action.hover,
  },
}));

const EvidenceLabelFieldExpanded = styled(FilledInput)(({ theme }) => ({
  backgroundColor: 'rgba(255,255,255,0.25)',
  paddingTop: '3px',
  '&$disabled': {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  '&$focused': {
    backgroundColor: '#fff',
  },
}));

const EvidenceScreenshotStatus = styled(Typography)(({ theme }) => ({
  // REVIEW: This is broken 'theme.palette.text' is undefined
  // color: theme.palette.text.secondary,
}));

const EvidenceScreenshotButton = styled(Button)({
  display: 'block',
  width: '100%',
});

const EvidenceScreenshot = styled('img')({
  width: '100%',
  height: 'auto',
});

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @class
 */
class EvidenceLink extends React.Component {
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
      saveInProgress: false,
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
        why,
      });
    }
    // Don't throw an error here
    // If the EvidenceLink has been deleted, the deletion event triggers
    // DATA_UPDATED, so this EvidenceLink may receive the event before
    // it's been unmounted.  Just ignore missing EvidenceLink.
    // throw Error(`no evidence link with evId '${this.props.evId}' exists`);
  }

  DoScrollIntoView() {
    this.ref.current.scrollIntoView({ block: 'end' }); // alignToTop=true
  }

  DoEditStart() {
    const pmcDataId = ASET.selectedPMCDataId;
    const intEvId = Number(this.props.evlink.id);
    UR.DBTryLock('pmcData.entities', [pmcDataId, intEvId]).then((rdata) => {
      const { success, semaphore, uaddr, lockedBy } = rdata;
      status += success
        ? `${semaphore} lock acquired by ${uaddr} `
        : `failed to acquired ${semaphore} lock `;
      if (rdata.success) {
        this.setState(
          {
            isBeingEdited: true,
            isExpanded: true,
          },
          () => this.FocusTextInput(),
        );
        UR.Publish('EVIDENCE_EDIT_STATE', { isBeingEdited: true });
      } else {
        UR.Publish('EVIDENCE_EDIT_STATE', { isBeingEdited: false });
      }
    });
  }

  DoEditStop() {
    const pmcDataId = ASET.selectedPMCDataId;
    const intEvId = Number(this.props.evlink.id);
    UR.DBUnlock('pmcData.entities', [pmcDataId, intEvId]).then((rdata) => {
      const { success, semaphore, uaddr, lockedBy } = rdata;
      if (rdata.success) {
        this.setState({ isBeingEdited: false, needsSaving: false });
        UR.Publish('EVIDENCE_EDIT_STATE', { isBeingEdited: false });
      } else {
        UR.Publish('EVIDENCE_EDIT_STATE', { isBeingEdited: true });
      }
    });
  }

  DoSave() {
    const pmcDataId = ASET.selectedPMCDataId;
    const intEvId = Number(this.props.evlink.id);
    const model = ADM.GetModelById();
    const classroomId = ADM.GetClassroomIdByGroup(model.groupId);
    const { note, rating, why } = this.state;
    const evlink = DATA.PMC_GetEvLinkByEvId(intEvId);
    const cuser = UR.session.user();
    const timestamp = new Date().getTime();

    if (evlink) {
      const data = {
        evId: evlink.id,
        note,
        rating,
        why,
        changedBy: cuser.uaddr,
        changedByName: cuser.displayName,
        lastUpdate: timestamp,
      };
      UR.DBUpdate('pmcData.entities', pmcDataId, 'evlinks', data).then((rdata) => {
        if (rdata.success) {
          this.setState({ needsSaving: false, saveInProgress: false });
        } else {
          this.setState({ saveInProgress: false });
        }
      });
    }
  }

  FocusTextInput() {
    this.textInputRef.current.focus();
  }

  OnCancelButtonClick() {
    this.setState({ needsSaving: false });
    this.DoEditStop();
  }

  OnDeleteButtonClick() {
    if (confirm('Are you sure you want to delete this Evidence?')) {
      const pmcDataId = ASET.selectedPMCDataId;
      const intEvId = Number(this.props.evlink.id);
      UR.DBDelete('pmcData.entities', pmcDataId, 'evlinks', intEvId).then((rdata) => {
        if (rdata.success) {
          this.DoEditStop();
        } else {
          alert('Delete failed');
        }
      });
    }
  }

  OnDuplicateButtonClick() {
    this.setState({ saveInProgress: true }, () => this.DoSave());
    const evlink = this.props.evlink;
    UR.Publish('EVIDENCE_DUPLICATE', evlink);
  }

  OnEditButtonClick() {
    this.setState({ needsSaving: false });
    this.DoEditStart();
  }

  OnSaveButtonClick() {
    this.setState({ saveInProgress: true }, () => this.DoSave());
    this.DoEditStop();
  }

  OnClickAway() {
    if (this.state.isBeingEdited) {
      this.setState({ isBeingEdited: false, needsSaving: false });
      this.DoEditStop();
    }
  }

  OnBlur() {
    if (this.state.isBeingEdited) {
      this.setState({ isBeingEdited: false, needsSaving: false });
      this.DoEditStop();
    }
  }

  DoEvidenceLinkOpen(data) {
    if (data.evId !== this.props.evlink.id) return;
    if (data.autoSelect) {
      this.DoScrollIntoView();
    }
    if (data.autoEdit) {
      this.DoEditStart();
    }
  }

  OnScreenShotClick() {
    if (this.props.evlink.screenshotURL) {
      window.open(this.props.evlink.screenshotURL);
    }
  }

  OnCaptureScreenShotClick() {
    UR.Publish('EVLINK:SHOW_SCREENSHOT_MODAL', {
      evlink: this.props.evlink,
    });
  }

  OnNoteChange(event) {
    this.setState({ note: event.target.value, needsSaving: true });
  }

  OnWhyChange(event) {
    this.setState({ why: event.target.value, needsSaving: true });
  }

  OnLinkButtonClick() {
    UR.Publish('EVLINK:SHOW_LINK_MODAL', {
      evlink: this.props.evlink,
    });
  }

  DoEnableSourceSelect() {
    this.setState({ listenForSourceSelection: true });
  }

  DoSelectionChange() {
    if (this.state.listenForSourceSelection) {
      this.setState({
        listenForSourceSelection: false,
      });
      this.DoEditStart();
    }
  }

  DoToggleExpanded() {
    this.setState((prevState) => ({ isExpanded: !prevState.isExpanded }));
  }

  OnRatingButtonClick(rating) {
    this.setState({ rating, needsSaving: true });
  }

  OnDrop(files) {
    // accept drop
    if (files.length === 0) {
      // clear drop
      this.setState({
        note: '',
        rating: null,
        why: '',
        listenForSourceSelection: false,
        needsSaving: false,
      });
    } else {
      // accept drop
      const { note, rating, why } = this.state;
      const evlink = {
        note,
        rating,
        why,
        files,
      };
      UR.Publish('EVLINK:ADD', evlink);
    }
  }

  /// RENDER //////////////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  render() {
    const { evlink, isPrimary, settings, autoExpand } = this.props;
    const { note, rating, ratingDefs, why, isBeingEdited, isExpanded, isHovered, listenForSourceSelection, saveInProgress, needsSaving } = this.state;

    const primary = isPrimary ? 'primary' : 'secondary';
    const RatingButtonComponent = ratingDefs.map((ratingDef) => (
      <RatingButton key={ratingDef.id} ratingDef={ratingDef} selected={rating === ratingDef.value} onClick={this.OnRatingButtonClick} />
    ));

    return (
      <ClickAwayListener onClickAway={this.OnClickAway}>
        <div>
          <EvidenceBodyRow container ref={this.ref} onMouseEnter={() => this.setState({ isHovered: true })} onMouseLeave={() => this.setState({ isHovered: false })}>
            <Grid item xs={12} sm={6}>
              {isExpanded ? (
                <EvidenceLabelFieldExpanded
                  value={note}
                  onChange={this.OnNoteChange}
                  disabled={!isBeingEdited}
                  ref={this.textInputRef}
                  multiline
                  fullWidth
                />
              ) : (
                <EvidenceLabelField onClick={this.DoToggleExpanded}>
                  {note}
                </EvidenceLabelField>
              )}
            </Grid>
            <EvidenceWindowLabelGrid item xs={12} sm={6}>
              {isBeingEdited ? (
                <Button onClick={this.OnSaveButtonClick} disabled={!needsSaving || saveInProgress} color="primary">
                  Save
                </Button>
              ) : (
                <Button onClick={this.OnEditButtonClick} color="primary">
                  Edit
                </Button>
              )}
              {isBeingEdited && (
                <Button onClick={this.OnCancelButtonClick} color="secondary">
                  Cancel
                </Button>
              )}
              <Button onClick={this.OnDeleteButtonClick} color="secondary">
                Delete
              </Button>
              <Button onClick={this.OnDuplicateButtonClick} color="primary">
                Duplicate
              </Button>
              <StickyNoteButton onClick={this.OnLinkButtonClick} />
              {listenForSourceSelection && (
                <LinkButton />
              )}
            </EvidenceWindowLabelGrid>
          </EvidenceBodyRow>
          {isExpanded && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <EvidenceBodyRowCollapsed container>
                <Grid item xs={12} sm={6}>
                  <EvidenceScreenshotStatus>
                    {evlink.screenshotStatus}
                  </EvidenceScreenshotStatus>
                  <EvidenceScreenshotButton onClick={this.OnCaptureScreenShotClick}>
                    <EvidenceScreenshot src={evlink.screenshotURL} />
                  </EvidenceScreenshotButton>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Why this evidence is important"
                    value={why}
                    onChange={this.OnWhyChange}
                    disabled={!isBeingEdited}
                    multiline
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Divider />
                  {RatingButtonComponent}
                  <Dropzone onDrop={this.OnDrop} />
                </Grid>
              </EvidenceBodyRowCollapsed>
            </Collapse>
          )}
        </div>
      </ClickAwayListener>
    );
  }
}

/// PROP TYPES ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
EvidenceLink.propTypes = {
  evlink: PropTypes.object.isRequired,
  isPrimary: PropTypes.bool,
  settings: PropTypes.object,
  autoExpand: PropTypes.bool,
};

/// EXPORT /////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default EvidenceLink;
