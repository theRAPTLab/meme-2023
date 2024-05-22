/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
// Material UI Elements
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Collapse from '@material-ui/core/Collapse';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// RESOURCE TYPES /////////////////////////////////////////////////////////////////
// Material UI Icons
// I want to move this somewhere centralized but wasn't sure the best way, so this is a teemporary shifting
// in how it is referenced to make it easier later
import ImageIcon from '@material-ui/icons/Image';
import DescriptionIcon from '@material-ui/icons/Description';
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';

const RESOURCE_TYPES = {
  simulation: <ImageIcon />,
  assumption: <EmojiObjectsIcon />,
  idea: <EmojiObjectsIcon />,
  report: <DescriptionIcon />,
  question: <ContactSupportIcon />,
  other: <DescriptionIcon />
};

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from './MEMEStyles';
import UR from '../../system/ursys';
import DATA from '../modules/data';
import DEFAULTS from '../modules/defaults';
import EvidenceList from './EvidenceList';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'ResourceItem:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class ResourceItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: true,
      hideAddButton: false
    };

    this.DoToggleExpanded = this.DoToggleExpanded.bind(this);
    this.DoEvidenceLinkOpen = this.DoEvidenceLinkOpen.bind(this);
    this.DoEvidenceEditStateUpdate = this.DoEvidenceEditStateUpdate.bind(this);
    this.DoDataUpdate = this.DoDataUpdate.bind(this);
    this.OnResourceClick = this.OnResourceClick.bind(this);
    this.OnCreateEvidence = this.OnCreateEvidence.bind(this);
    this.DoCollapseAll = this.DoCollapseAll.bind(this);

    UR.Subscribe('SHOW_EVIDENCE_LINK', this.DoEvidenceLinkOpen);
    UR.Subscribe('EVIDENCE_EDIT_STATE', this.DoEvidenceEditStateUpdate);
    UR.Subscribe('DATA_UPDATED', this.DoDataUpdate);
    UR.Subscribe('RESOURCES:COLLAPSE_ALL', this.DoCollapseAll);
    // FIXME: Resource is getting closed before selection, force it open again
    UR.Subscribe('SET_EVIDENCE_LINK_WAIT_FOR_SOURCE_SELECT', this.DoEvidenceLinkOpen);
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubscribe('SHOW_EVIDENCE_LINK', this.DoEvidenceLinkOpen);
    UR.Unsubscribe('EVIDENCE_EDIT_STATE', this.DoEvidenceEditStateUpdate);
    UR.Unsubscribe('DATA_UPDATED', this.DoDataUpdate);
    UR.Unsubscribe('RESOURCES:COLLAPSE_ALL', this.DoCollapseAll);
    UR.Unsubscribe('SET_EVIDENCE_LINK_WAIT_FOR_SOURCE_SELECT', this.DoEvidenceLinkOpen);
  }

  DoToggleExpanded() {
    if (DBG) console.log(PKG, 'expansion clicked');
    this.setState(prevState => {
      return {
        isExpanded: !prevState.isExpanded
      };
    });
  }

  DoDataUpdate() {}

  DoEvidenceLinkOpen(data) {
    if (this.props.resource.id === data.rsrcId) {
      if (DBG) console.log(PKG, 'OPENING Resource', data.rsrcId, ' data.evId is', data);
      this.setState(
        {
          isExpanded: true
        },
        () => {
          // First open resource list, then open evidence Link
          UR.Publish('SHOW_EVIDENCE_LINK_SECONDARY', data);
        }
      );
    }
  }

  DoEvidenceEditStateUpdate(data) {
    this.setState({ hideAddButton: data.isBeingEdited });
  }

  OnResourceClick(rsrcId) {
    if (DBG) console.log(PKG, 'Resource clicked', rsrcId);
    UR.Publish('RESOURCEVIEW:OPEN', { rsrcId });
  }

  OnCreateEvidence(rsrcId) {
    if (DBG) console.log(PKG, 'create new evidence:', rsrcId);
    DATA.PMC_AddEvidenceLink({ rsrcId }, id =>
      UR.Publish('SHOW_EVIDENCE_LINK', { evId: id, rsrcId })
    );
  }

  DoCollapseAll() {
    // FIXME: Why is `this` undefined?!?
    if (this) {
      this.setState({ isExpanded: false });
    }
  }

  render() {
    const { resource, classes } = this.props;
    const { isExpanded, hideAddButton } = this.state;
    let evBadge = {};
    if (!isExpanded) {
      let links = DATA.GetEvLinksCountByResourceId(resource.id);
      evBadge = <Chip className={classes.evidenceBadge} label={links} color="primary" />;
    } else {
      evBadge = '';
    }
    return (
      <div className={classes.resourceItem}>
        <ListItem
          button
          key={resource.id}
          onClick={() => this.OnResourceClick(resource.id)}
          style={{ paddingLeft: '8px' }}
        >
          <ListItemAvatar>
            <Avatar className={classes.resourceViewAvatar}>{resource.referenceLabel}</Avatar>
          </ListItemAvatar>
          <ListItemText
            className={ClassNames(
              classes.resourceViewLabel,
              isExpanded ? classes.resourceViewLabelExpanded : ''
            )}
            primary={`${resource.label}`}
            secondary={`${resource.notes}`}
          />
          <ListItemSecondaryAction style={{ right: '0px' }}>
            {RESOURCE_TYPES[resource.type] ? RESOURCE_TYPES[resource.type] : RESOURCE_TYPES.other}
            {evBadge}
            <Button className={classes.resourceExpandButton} onClick={this.DoToggleExpanded}>
              <ExpandMoreIcon
                className={isExpanded ? classes.lessIconExpanded : classes.lessIconCollapsed}
              />
            </Button>
          </ListItemSecondaryAction>
        </ListItem>
        <Collapse in={isExpanded}>
          <div className={classes.resourceViewEvList}>
            <EvidenceList rsrcId={resource.id} key={`${resource.id}ev`} />
            <Button
              size="small"
              color="primary"
              onClick={() => this.OnCreateEvidence(resource.id)}
              hidden={DATA.IsViewOnly() || hideAddButton}
            >
              {DEFAULTS.TEXT.ADD_EVIDENCE}
            </Button>
          </div>
        </Collapse>
      </div>
    );
  }
}

ResourceItem.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  resource: PropTypes.object
};

ResourceItem.defaultProps = {
  classes: {},
  resource: {
    rsrcId: '',
    referenceLabel: '',
    label: '',
    notes: '',
    type: '',
    url: '',
    links: 0
  }
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(ResourceItem);
