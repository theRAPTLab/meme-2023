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

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class ResourceItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false
    };

    this.toggleExpanded = this.toggleExpanded.bind(this);
  }

  componentDidMount() { }

  toggleExpanded() {
    console.log('expansion clicked');
    this.setState({
      isExpanded: !this.state.isExpanded
    })
  };
  
  handleResourceClick(rid) {
    console.log('Resource clicked', rid);
    UR.Publish('SHOW_RESOURCE', {rid: rid});
  }

  render() {
    const { resource, classes } = this.props;
    return (
      <div>
        <ListItem button key={resource.id} onClick={() => this.handleResourceClick(resource.rid)}>
          <ListItemAvatar>
            <Avatar className={classes.evidenceAvatar}>{resource.rid}</Avatar>
          </ListItemAvatar>
          <ListItemText primary={`${resource.label}`} secondary={`${resource.keyvars}`} />
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
        {this.state.isExpanded ? <EvidenceList rid={resource.rid} key={`${resource.rid}ev`} /> : ''}
      </div>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(ResourceItem);
