/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Resource View

Instead of creating yet another database table to hold Resource Notes, we just
the Comment system.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';


/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../system/ursys';
import DATA from '../modules/data';
import ADM from '../modules/data';
import ASET from '../modules/adm-settings';
import PMCObj from '../modules/pmc-objects';
import UTILS from '../modules/utils';
import EvidenceList from './EvidenceList';
import DEFAULTS from '../modules/defaults';

/// RESOURCE TYPES /////////////////////////////////////////////////////////////////
// Material UI Icons
// I want to move this somewhere centralized but wasn't sure the best way, so this is a teemporary shifting
// in how it is referenced to make it easier later
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';

const RESOURCE_TYPES = {
  simulation: <ImageIcon />,
  assumption: <EmojiObjectsIcon />,
  idea: <EmojiObjectsIcon />,
  report: <DescriptionIcon />,
  question: <ContactSupportIcon />,
  other: <DescriptionIcon />,
};

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'ResourceView:';
const ResourceViewPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const ResourceViewTitle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const ResourceViewWindowLabel = styled('div')(({ theme }) => ({
  fontWeight: 'bold',
  marginRight: theme.spacing(2),
}));

const ResourceViewAvatar = styled(Avatar)(({ theme }) => ({
  marginRight: theme.spacing(2),
}));

const ResourceViewCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const ResourceViewCardContent = styled(CardContent)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

const ResourceViewLinksBadge = styled(Chip)(({ theme }) => ({
  marginLeft: theme.spacing(1),
}));

const EvidenceCloseBtn = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
}));

const ResourceViewSidebar = styled('div')(({ theme }) => ({
  marginLeft: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
}));

const ResourceViewSidebarEvidenceList = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  marginTop: theme.spacing(2),
}));

const ResourceViewCreateButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

class ResourceView extends React.Component {
  constructor(props) {
    super(props);
    this.OnOpen = this.OnOpen.bind(this);
    this.OnDataUpdate = this.OnDataUpdate.bind(this);
    this.ContinueOpen = this.ContinueOpen.bind(this);
    this.OnCreateEvidence = this.OnCreateEvidence.bind(this);
    this.OnNoteChange = this.OnNoteChange.bind(this);
    this.OnNoteSave = this.OnNoteSave.bind(this);
    this.OnClose = this.OnClose.bind(this);

    this.state = {
      isOpen: false,
      resource: {},
      noteRefId: '', // points comment to this resource
      note: 'blank',
      noteIsDisabled: true,
      commentId: -1, // id of the comment object used to hold the note data
    };

    UR.Subscribe('RESOURCEVIEW:OPEN', this.OnOpen);
    UR.Subscribe('RESOURCEVIEW:CLOSE', this.OnClose);
    UR.Subscribe('DATA_UPDATED', this.OnDataUpdate);
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubscribe('RESOURCEVIEW:OPEN', this.OnOpen);
    UR.Unsubscribe('RESOURCEVIEW:CLOSE', this.OnClose);
    UR.Unsubscribe('DATA_UPDATED', this.OnDataUpdate);
  }

  OnOpen(data) {
    if (DBG) console.log('ViewMain: clicked on ', data.rsrcId);
    // Look up resource
    const resource = ADM.Resource(data.rsrcId);
    const noteRefId = `res${data.rsrcId}`;
    if (resource) {
      const comments = DATA.GetComments(noteRefId);
      if (comments.length < 1) {
        // no comment defined yet, so create a new comment
        const comment = PMCObj.Comment({
          refId: noteRefId,
          author: ADM.GetAuthorId(),
        });
        DATA.DB_CommentAdd(noteRefId, comment, () => this.ContinueOpen(resource, noteRefId));
      } else {
        // just open it
        this.ContinueOpen(resource, noteRefId);
      }
    } else {
      console.error('ViewMain: Could not find selected resource id', data.rsrcId);
    }
  }

  OnDataUpdate() {
    const comments = DATA.GetComments(this.state.noteRefId);
    if (comments.length > 0) {
      const comment = comments[0];
      if (this.state.note !== comment.text) {
        this.setState({ note: comment.text });
      }
    }
  }

  ContinueOpen(resource, noteRefId) {
    const comments = DATA.GetComments(noteRefId);
    if (comments.length < 1)
      throw Error('There should be at least one comment saved as a Resource note!');
    const note = comments[0].text;
    const commentId = comments[0].id;

    const pmcDataId = ASET.selectedPMCDataId;
    const intCommentId = Number(commentId);
    UR.DBTryLock('pmcData.comments', [pmcDataId, intCommentId]).then((rdata) => {
      const { success, semaphore, uaddr, lockedBy } = rdata;
      status += success
        ? `${semaphore} lock acquired by ${uaddr} `
        : `failed to acquired ${semaphore} lock `;
      if (rdata.success) {
        this.setState({ noteIsDisabled: false });
      } else {
        alert(
          `Sorry, someone else (${rdata.lockedBy}) is editing this Resource Note right now.  Please try again later. (You can still ${DEFAULTS.TEXT.ADD_EVIDENCE}.)`,
        );
      }
    });

    this.setState({
      isOpen: true,
      resource,
      noteRefId,
      note,
      commentId,
    });
    UTILS.RLog('ResourceOpen', resource.label);
  }

  OnCreateEvidence(rsrcId) {
    if (DBG) console.log(PKG, 'create new evidence:', rsrcId);
    const resourceFrame = document.getElementById('resourceFrame');
    if (resourceFrame !== null) {
      const px = window.devicePixelRatio;
      const sx = resourceFrame.offsetLeft * px;
      const sy = resourceFrame.offsetTop * px;
      const sw = resourceFrame.clientWidth * px;
      const sh = resourceFrame.clientHeight * px;
      let opt = { sx, sy, sw, sh };
      UR.PromiseCaptureScreen(opt).then((rdata) => {
        const { href, error } = rdata;
        if (error) console.log('PromiseCaptureScreen:', error);
        // Always create evidence link even if href is undefined
        DATA.PMC_AddEvidenceLink({ rsrcId, imageURL: href }, (id) =>
          UR.Publish('SHOW_EVIDENCE_LINK', { evId: id, rsrcId }),
        );
      });
    }
  }

  // User has edited the note by typing
  OnNoteChange(e) {
    this.setState({ note: e.target.value });
  }

  OnNoteSave() {
    const note = PMCObj.Comment({
      id: this.state.commentId,
      text: this.state.note,
      refId: this.state.noteRefId,
      author: ADM.GetAuthorId(),
    });
    DATA.DB_CommentUpdate(this.state.noteRefId, note);
  }

  OnClose() {
    const pmcDataId = ASET.selectedPMCDataId;
    const intCommentId = Number(this.state.commentId);
    if (intCommentId >= 0) {
      // If intCommentId is -1 then the ResourceView was never opened
      // so don't bother to release.  Otherwise this will generate a ur-link error
      // due to an invalid ID (-1 is invalid).
      UR.DBTryRelease('pmcData.comments', [pmcDataId, intCommentId]);
    }
    this.setState({
      isOpen: false,
      noteIsDisabled: true,
    });
  }

  render() {
    const { isOpen, resource, note, noteIsDisabled } = this.state;

    // don't render if resource hasn't been defined yet
    if (resource === undefined || resource.id === undefined) return '';
    const links = resource.links || 0;

    return (
      <ResourceViewPaper hidden={!isOpen}>
        <ResourceViewTitle>
          <ResourceViewWindowLabel>RESOURCE VIEW</ResourceViewWindowLabel>
          <ResourceViewAvatar>{resource.referenceLabel}</ResourceViewAvatar>
          <div style={{ flexGrow: 1 }}>{resource.label}</div>
          <ResourceViewCard>
            <ResourceViewCardContent>
              <Typography variant="overline">Notes:&nbsp;</Typography>
              <Typography variant="body2">{resource.notes}</Typography>
            </ResourceViewCardContent>
          </ResourceViewCard>
          <ResourceViewCard>
            <ResourceViewCardContent>
              <Typography variant="overline">Type:&nbsp;</Typography>
              <Typography variant="body2">
                {resource.type}{' '}
                {RESOURCE_TYPES[resource.type]
                  ? RESOURCE_TYPES[resource.type]
                  : RESOURCE_TYPES.other}
              </Typography>
            </ResourceViewCardContent>
          </ResourceViewCard>
          <ResourceViewCard>
            <ResourceViewCardContent>
              <Typography variant="overline">Links:&nbsp;</Typography>
              <ResourceViewLinksBadge label={links} color="primary" />
            </ResourceViewCardContent>
          </ResourceViewCard>
          <EvidenceCloseBtn onClick={this.OnClose} color="primary">
            Close
          </EvidenceCloseBtn>
        </ResourceViewTitle>
        <div style={{ display: 'flex', height: 'inherit' }}>
          <iframe
            id="resourceFrame"
            src={
              resource.url && !resource.url.startsWith('http')
                ? `/resources/${resource.url}`
                : resource.url
            }
            style={{ height: '90%', flexGrow: '1' }}
            title="resource"
          />
          <ResourceViewSidebar>
            {/* Hide Note Field per #141
            <TextField
              id="informationNote"
              label="Our Notes"
              placeholder="We noticed..."
              multiline
              rows="10"
              margin="normal"
              variant="outlined"
              value={note}
              disabled={noteIsDisabled}
              onChange={this.OnNoteChange}
              onBlur={this.OnNoteSave}
            /> */}
            <Typography variant="caption">OUR EVIDENCE LINKS</Typography>
            <ResourceViewSidebarEvidenceList>
              <EvidenceList rsrcId={resource.id} />
            </ResourceViewSidebarEvidenceList>
            <ResourceViewCreateButton
              variant="contained"
              onClick={() => this.OnCreateEvidence(resource.id)}
              color="primary"
              hidden={ADM.IsViewOnly()}
            >
              {DEFAULTS.TEXT.ADD_EVIDENCE}
            </ResourceViewCreateButton>
          </ResourceViewSidebar>
        </div>
      </ResourceViewPaper>
    );
  }
}

ResourceView.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
};

ResourceView.defaultProps = {
  classes: {},
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default ResourceView;
