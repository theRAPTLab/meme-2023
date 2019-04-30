/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import ClassNames from 'classnames';
// Material UI Elements
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import DescriptionIcon from '@material-ui/icons/Description';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ImageIcon from '@material-ui/icons/Image';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from '../components/MEMEStyles';
import UR from '../../system/ursys';
import DATA from '../modules/pmc-data';
import EvidenceList from '../components/EvidenceList';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const PKG = 'ResourceItem:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class ResourceItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false
    };
    
    this.handleEvidenceLinkOpen = this.handleEvidenceLinkOpen.bind(this);
    this.handleDataUpdate = this.handleDataUpdate.bind(this);
    this.handleResourceClick = this.handleResourceClick.bind(this);
    this.handleUnexpandAll = this.handleUnexpandAll.bind(this);
    this.toggleExpanded = this.toggleExpanded.bind(this);

    UR.Sub('SHOW_EVIDENCE_LINK', this.handleEvidenceLinkOpen);
    UR.Sub('DATA_UPDATED', this.handleDataUpdate);
    UR.Sub('UNEXPAND_ALL_RESOURCES', this.handleUnexpandAll);
    // FIXME: Resource is getting closed before selection, force it open again
    UR.Sub('SET_EVIDENCE_LINK_WAIT_FOR_SOURCE_SELECT', this.handleEvidenceLinkOpen);
  }

  componentDidMount() { }

  toggleExpanded() {
    if (DBG) console.log(PKG +'expansion clicked');
    this.setState({
      isExpanded: !this.state.isExpanded
    });
  };
  
  handleDataUpdate() {
    // Reload
  }
  
  handleEvidenceLinkOpen(data) {
    if (DBG) console.log(PKG + 'comparing', data.rsrcId, 'to', this.props.resource.rsrcId);
    if (this.props.resource.rsrcId === data.rsrcId) {
      this.setState({
        isExpanded: true
      }, () => {
          // First open resource list, then open evidence Link
          UR.Publish('SHOW_EVIDENCE_LINK_SECONDARY', data );
      });
    }
  }

  handleResourceClick(rsrcId) {
    if (DBG) console.log(PKG +'Resource clicked', rsrcId);
    UR.Publish('SHOW_RESOURCE', {rsrcId: rsrcId});
  }

  handleUnexpandAll() {
    // FIXME: Why is `this` undefined?!?
    if (this) {
      this.setState({ isExpanded: false });      
    }
  }

  componentWillUnmount() {
    UR.Unsub('SHOW_EVIDENCE_LINK', this.handleEvidenceLinkOpen);
    UR.Unsub('DATA_UPDATED', this.handleDataUpdate);
    UR.Unsub('UNEXPAND_ALL_RESOURCES', this.handleUnexpandAll);
    UR.Unsub('SET_EVIDENCE_LINK_WAIT_FOR_SOURCE_SELECT', this.handleEvidenceLinkOpen);
  }

  render() {
    const { resource, classes } = this.props;
    return (
      <div>
        <ListItem button key={resource.id} onClick={() => this.handleResourceClick(resource.rsrcId)}>
          <ListItemAvatar>
            <Avatar className={classes.evidenceAvatar}>{resource.referenceLabel}</Avatar>
          </ListItemAvatar>
          <ListItemText primary={`${resource.label}`} secondary={`${resource.notes}`} />
          <ListItemSecondaryAction>
            {resource.type === 'simulation' ? <ImageIcon /> : <DescriptionIcon />}
            {!this.state.isExpanded ?
              (
                resource.links > 0 ?
                  <Chip className={classes.evidenceBadge} label={resource.links} color="primary" /> :
                  <Chip className={classes.evidenceBadge} label="" />
               ) : ''
            }
            <IconButton onClick={this.toggleExpanded}><ExpandMoreIcon /></IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        {this.state.isExpanded ? <EvidenceList rsrcId={resource.rsrcId} key={`${resource.rsrcId}ev`} /> : ''}
      </div>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(ResourceItem);
