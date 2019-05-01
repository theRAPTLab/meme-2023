/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

EvidenceLinks are used to display individual pieces of evidence created by
students to link an information resource item (e.g. simulation, report) to
a component, property, or mechanism.

They are controlled components.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import ClassNames from 'classnames';
// Material UI Elements
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
// Material UI Icons
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from '../components/MEMEStyles';
import DATA from '../modules/pmc-data';
import UR from '../../system/ursys';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const PKG = 'EvidenceLink:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class EvidenceLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      canBeEdited: false,
      isBeingEdited: false,
      isBeingDisplayedInInformationList: true,
      isExpanded: false,
      isWaitingForSourceSelect: false
    };
    this.handleEditButtonClick = this.handleEditButtonClick.bind(this);
    this.handleEvidenceLinkOpen = this.handleEvidenceLinkOpen.bind(this);
    this.handleNoteChange = this.handleNoteChange.bind(this);
    this.handleSourceSelectClick = this.handleSourceSelectClick.bind(this);
    this.handleActivateWaitForSourceSelect = this.handleActivateWaitForSourceSelect.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.toggleExpanded = this.toggleExpanded.bind(this);
    UR.Sub('SHOW_EVIDENCE_LINK_SECONDARY', this.handleEvidenceLinkOpen);
    UR.Sub('SELECTION_CHANGED', this.handleSelectionChange);
    UR.Sub('SET_EVIDENCE_LINK_WAIT_FOR_SOURCE_SELECT', this.handleActivateWaitForSourceSelect);
  }

  componentDidMount() { }
  
  componentWillUnmount() {
    UR.Unsub('SHOW_EVIDENCE_LINK_SECONDARY', this.handleEvidenceLinkOpen);
    UR.Unsub('SELECTION_CHANGED', this.handleSelectionChange);
    UR.Unsub('SET_EVIDENCE_LINK_WAIT_FOR_SOURCE_SELECT', this.handleActivateWaitForSourceSelect);
  }

  handleEditButtonClick() {
    this.setState({
      isBeingEdited: true
    });
  }

  handleEvidenceLinkOpen(data) {
    if (DBG) console.log('comparing', data.evId, 'to', this.props.evId);
    if (this.props.evId === data.evId) {
      console.log('EvidenceLink: Expanding', data.evId);
      this.setState({
        isExpanded: true,
// results in react object error       selectedSource: {}
      });
    }
  }

  handleNoteChange(e) {
    if (DBG) console.log(PKG, 'Note Change:', e.target.value);
    DATA.SetEvidenceLinkNote(this.props.evId, e.target.value);
  }

  handleSourceSelectClick(evId, rsrcId) {
    this.setState({ isWaitingForSourceSelect: true });
    UR.Publish('REQUEST_SELECT_EVLINK_SOURCE', { evId, rsrcId });
  }

  handleActivateWaitForSourceSelect(data) {
    if (data.evId === this.props.evId) {
      if (DBG) console.warn(PKG, 'Wait for source select!')
      this.setState({
        isExpanded: true,
        isBeingEdited: true,
        isWaitingForSourceSelect: true
      });
    }
  }

  handleSelectionChange() {
    if (this.state.isWaitingForSourceSelect) {
      let sourceId;

      // Assume mechs are harder to select so check for them first.
      // REVIEW: Does this work well?
      let selectedMechIds = DATA.VM_SelectedMechs();
      if (DBG) console.log(PKG, 'selection changed mechsIds:', selectedMechIds);
      if (selectedMechIds.length > 0) {
        // Get the last selection
        sourceId = selectedMechIds[selectedMechIds.length - 1];
        console.error(PKG, 'setting mechid', sourceId);
        DATA.SetEvidenceLinkMechId(this.props.evId, sourceId);
        return;
      }

      let selectedPropIds = DATA.VM_SelectedProps();
      if (DBG) console.log(PKG, 'selection changed propIds:', selectedPropIds);
      if (selectedPropIds.length > 0) {
        // Get the last selection
        sourceId = selectedPropIds[selectedPropIds.length - 1];
        DATA.SetEvidenceLinkPropId(this.props.evId, sourceId);
      }
      // leave it in a waiting state?  This allows you to change your mind?
      // this.setState({ isWaitingForSourceSelect: false });
    }
  }

  toggleExpanded() {
    if (DBG) console.log('evidence link clicked');
    let isExpanded = this.state.isExpanded;
    if (isExpanded) {
      this.setState({
        isExpanded: false,
        isBeingEdited: false,
        isWaitingForSourceSelect: false
      });
    } else {
      this.setState({
        isExpanded: true
      });
    }
  }

  render() {
    // evidenceLinks is an array of arrays because there might be more than one?!?
    const { evId, rsrcId, propId, mechId, note, classes } = this.props;
    const { isBeingEdited, isExpanded, isBeingDisplayedInInformationList, isWaitingForSourceSelect } = this.state;
    if (evId === '') return '';
    let sourceLabel;
    if (propId !== undefined) {
      sourceLabel = (
        <div className={classes.evidenceLinkSourcePropAvatarSelected}>{DATA.Prop(propId).name}</div>
      );
    } else if (mechId !== undefined) {
      sourceLabel = (
        <div className={classes.evidenceLinkSourceMechAvatarSelected}>{DATA.Mech(mechId).name}</div>
      );
    } else if (isWaitingForSourceSelect) {
      sourceLabel = (
        <div className={classes.evidenceLinkSourceAvatarWaiting}>waiting...</div>
      );
    } else {
      sourceLabel = (
        <Button
          onClick={() => {
            this.handleSourceSelectClick(evId, rsrcId);
          }}
          className={classes.evidenceLinkSelectButton}
        >
          Link
        </Button>
      );
    }
    return (
      <Paper
        className={ClassNames(
          classes.evidenceLinkPaper,
          isExpanded ? classes.evidenceLinkPaperExpanded : ''
        )}
        key={`${rsrcId}`}
      >
        <div className={classes.evidenceWindowLabel}>EVIDENCE LINK</div>
        <div className={classes.evidencePrompt} hidden={!isExpanded}>
          How does this resource support this component / property / mechanism?
        </div>
        <div className={classes.evidenceTitle}>
          {!isBeingDisplayedInInformationList ? (
            <Avatar className={classes.evidenceAvatar}>{rsrcId}</Avatar>
          ) : (
            ''
          )}
          <div className={classes.evidenceLinkPropAvatar}>{sourceLabel}</div>
          &nbsp;
          {isBeingEdited ? (
            <TextField
              className={classes.evidenceLabelField}
              value={note}
              multiline
              onChange={this.handleNoteChange}
            />
          ) :
            <div className={classes.evidenceLabelField}>{note}</div>
          }
          <IconButton className={classes.evidenceExpandButton} onClick={this.toggleExpanded}><ExpandMoreIcon/></IconButton>
        </div>
        <img src="../static/screenshot_sim.png" className={classes.evidenceScreenshot} hidden={!isExpanded} />
        &nbsp;
        <a href="" hidden={!isExpanded || isBeingEdited}>delete</a>
        &nbsp;
        <Button variant="contained" onClick={this.handleEditButtonClick} hidden={!isExpanded || isBeingEdited}>Edit</Button>
      </Paper>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(EvidenceLink);
