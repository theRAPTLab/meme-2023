/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

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
      isExpanded: false
    };
    this.handleEditButtonClick = this.handleEditButtonClick.bind(this);
    this.handleEvidenceLinkOpen = this.handleEvidenceLinkOpen.bind(this);
    this.handleNoteChange = this.handleNoteChange.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.toggleExpanded = this.toggleExpanded.bind(this);
    UR.Sub('SHOW_EVIDENCE_LINK_SECONDARY', data => {
      if (DBG) console.log('received SHOW_EVIDENCE_LINK_SECONDARY', data);
      this.handleEvidenceLinkOpen(data);
    });
    UR.Sub('SELECTION_CHANGED', this.handleSelectionChange);
  }

  componentDidMount() { }

  handleEditButtonClick() {
    this.setState({
      isBeingEdited: true
    });
  }

  handleEvidenceLinkOpen(data) {
    if (DBG) console.log('comparing', data.evId, 'to', this.props.evidenceLinks[0].evId);
    if (
      this.props.evidenceLinks[0].evId === data.evId
    ) {
      console.log('EvidenceLink: Expanding', data.evId);
      this.setState({
        isExpanded: true,
// results in react object error       selectedSource: {}
      });
    }
  }

  handleNoteChange(e) {
    if (DBG) console.log(PKG + 'Note Change:', e.target.value);
    DATA.SetEvidenceLinkNote(this.props.evidenceLinks[0].evId, e.target.value);
//    this.props.evidenceLinks[0].note = e.target.value;
  }

  handleSelectionChange() {
    let selected = DATA.VM_SelectedProps();
    if (DBG) console.log(PKG, 'selection changed', selected);
    let source = 'source';
    if (selected.length > 0) {
      source = selected[selected.length-1];
    }
    this.setState({
      selectedSource: source
    });
  }
  
  handleSourceSelectClick(evId, rsrcId) {
    UR.Publish('SELECT_EVLINK_SOURCE', { evId: evId, rsrcId: rsrcId });
  }

  toggleExpanded() {
    if (DBG) console.log('evidence link clicked');
    this.setState({
      isExpanded: !this.state.isExpanded
    });
  }

  render() {
    // evidenceLinks is an array of arrays because there might be more than one?!?
    const { evidenceLinks, classes } = this.props;
    let evidenceLink;
    if (Array.isArray(evidenceLinks) && evidenceLinks.length > 0) {
      // Only allow one evidence link for now
      evidenceLink = evidenceLinks[0];
    } else {
      return '';
    }
    return (
      <Paper className={ClassNames(
          classes.evidenceLinkPaper,
          this.state.isExpanded ? classes.evidenceLinkPaperExpanded : ''
        )}
        key={`${evidenceLink.rsrcId}`}
      >
        <div className={classes.evidencePrompt} hidden={!this.state.isExpanded}>
          How does this resource support this component / property / mechanism?
        </div>
        <div className={classes.evidenceTitle}>
          {!this.state.isBeingDisplayedInInformationList ? (
            <Avatar className={classes.evidenceAvatar}>{evidenceLink.rsrcId}</Avatar>
          ) : (
            ''
          )}
          {evidenceLink.propId !== undefined ? (
            <div className={classes.evidenceLinkPropAvatar}>
              {DATA.Prop(evidenceLink.propId).name}
            </div>
          ) : (
            <Button
              onClick={() => {
                  this.handleSourceSelectClick(evidenceLink.evId, evidenceLink.rsrcId);
              }}
              className={classes.evidenceLinkPropAvatar}
            >
              select
            </Button>
          )}
          &nbsp;
          {this.state.isBeingEdited ? (
            <TextField
              className={classes.evidenceLabelField}
              value={evidenceLink.note}
              onChange={this.handleNoteChange}
            />
          ) :
            <div className={classes.evidenceLabelField}>{evidenceLink.note}</div>
          }
          <IconButton onClick={this.toggleExpanded}><ExpandMoreIcon/></IconButton>
        </div>
        <img src="../static/screenshot_sim.png" className={classes.evidenceScreenshot} hidden={!this.state.isExpanded} />
        <a href="" hidden={!this.state.isExpanded || this.state.isBeingEdited}>delete</a>&nbsp;
        <Button variant="contained" onClick={this.handleEditButtonClick} hidden={!this.state.isExpanded || this.state.isBeingEdited}>Edit</Button>
      </Paper>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(EvidenceLink);
