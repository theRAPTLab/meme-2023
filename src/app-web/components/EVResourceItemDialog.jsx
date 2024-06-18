/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Resource Item Dialog

View the full resource and the list of saved evidence links.

This replaces ResourceView.jsx.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import './MEMEStyles.css';
import './EVResourceItemDialog.css';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../system/ursys';
import DATA from '../modules/data';
import ADM from '../modules/data';
import ASET from '../modules/adm-settings';
import PMCObj from '../modules/pmc-objects';
import UTILS from '../modules/utils';
import EVList from './EVList';
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
  other: <DescriptionIcon />
};

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'EVResourceItemDialog:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class EVResourceItemDialog extends React.Component {
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
      commentId: -1 // id of the comment object used to hold the note data
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
          author: ADM.GetAuthorId()
        });
        DATA.DB_CommentAdd(noteRefId, comment, () =>
          this.ContinueOpen(resource, noteRefId)
        );
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
    UR.DBTryLock('pmcData.comments', [pmcDataId, intCommentId]).then(rdata => {
      const { success, semaphore, uaddr, lockedBy } = rdata;
      status += success
        ? `${semaphore} lock acquired by ${uaddr} `
        : `failed to acquired ${semaphore} lock `;
      if (rdata.success) {
        this.setState({ noteIsDisabled: false });
      } else {
        alert(
          `Sorry, someone else (${rdata.lockedBy}) is editing this Resource Note right now.  Please try again later. (You can still ${DEFAULTS.TEXT.ADD_EVIDENCE}.)`
        );
      }
    });

    this.setState({
      isOpen: true,
      resource,
      noteRefId,
      note,
      commentId
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
      UR.PromiseCaptureScreen(opt).then(rdata => {
        const { href, error } = rdata;
        if (error) console.log('PromiseCaptureScreen:', error);
        // Always create evidence link even if href is undefined
        DATA.PMC_AddEvidenceLink({ rsrcId, imageURL: href }, id =>
          UR.Publish('SHOW_EVIDENCE_LINK', { evId: id, rsrcId })
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
      author: ADM.GetAuthorId()
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
      noteIsDisabled: true
    });
  }

  render() {
    const { isOpen, resource, note, noteIsDisabled } = this.state;
    const { theme: classes } = this.props;

    // don't render if resource hasn't been defined yet
    if (resource === undefined || resource.id === undefined) return '';
    const links = resource.links || 0;

    const TitleBar = (
      <div className="titlebar">
        <h1>Resource View</h1>
        <div></div> {/* spacer */}
        <div className="box-group">
          <div className="box">
            <div>Notes:&nbsp;</div>
            <div>{resource.notes}</div>
          </div>
          <div className="box">
            <div>Type:</div>
            <div>
              {resource.type}&nbsp;
              {RESOURCE_TYPES[resource.type]
                ? RESOURCE_TYPES[resource.type]
                : RESOURCE_TYPES.other}
            </div>
          </div>
          <div className="box">
            <div>Links:</div>
            <div className="dot small">{links}</div>
          </div>
        </div>
        <button className="transparent" onClick={this.OnClose}>
          Close
        </button>
      </div>
    );

    const Content = (
      <div className="content">
        <iframe
          id="resourceFrame"
          src={
            resource.url && !resource.url.startsWith('http')
              ? `/resources/${resource.url}`
              : resource.url
          }
          title="resource"
        />
        <div className="sidebar">
          <div className="ev-title">
            <div className="dot">{resource.referenceLabel}</div>
            <div className="label">{resource.label}</div>
          </div>
          <button
            className="primary"
            onClick={() => this.OnCreateEvidence(resource.id)}
            hidden={ADM.IsViewOnly()}
          >
            + {DEFAULTS.TEXT.ADD_EVIDENCE}
          </button>
          <div className="ev-list">
            <EVList rsrcId={resource.id} />
          </div>
        </div>
      </div>
    );

    return (
      <div className="EVResourceItemDialog" hidden={!isOpen}>
        {TitleBar}
        {Content}
      </div>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default EVResourceItemDialog;
