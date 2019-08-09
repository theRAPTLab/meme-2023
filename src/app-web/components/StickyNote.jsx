/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

STickey Note

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
// Material UI system utilities
import { positions } from '@material-ui/system';
// Material UI components
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
// Material UI Icons
import CloseIcon from '@material-ui/icons/Close';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from './MEMEStyles';
import UR from '../../system/ursys';
import ADM from '../modules/adm-data';
import StickyNoteCard from './StickyNoteCard';


/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class StickyNote extends React.Component {
  constructor(props) {
    super(props);

    this.DoADMDataUpdate = this.DoADMDataUpdate.bind(this);
    this.DoOpenSticky = this.DoOpenSticky.bind(this);
    this.DoAddComment = this.DoAddComment.bind(this);
    this.DoCloseSticky = this.DoCloseSticky.bind(this);
    this.OnReplyClick = this.OnReplyClick.bind(this);
    this.OnStartEdit = this.OnStartEdit.bind(this);
    this.OnUpdateComment = this.OnUpdateComment.bind(this);
    this.OnCloseClick = this.OnCloseClick.bind(this);

    this.state = {
      isHidden: true,
      isBeingEdited: false,
      comments: [],
      top: 0,
      left: 0,
      parent: {}
    };

    UR.Sub('ADM_DATA_UPDATED', this.DoADMDataUpdate); // Broadcast when a group is added.
    UR.Sub('STICKY:OPEN', this.DoOpenSticky);
  }

  componentDidMount() { }

  componentWillUnmount() { }

  DoADMDataUpdate() {

  }

  DoOpenSticky(data) {
    let { comments, x, y, parent } = data;
    let isBeingEdited = false;
    if (comments === undefined || comments.length === 0) {
      // no comments yet, so add an empty comment
      comments = [ADM.NewComment()];
      isBeingEdited = true;
    }
    this.setState({
      isHidden: false,
      isBeingEdited,
      comments,
      top: y,
      left: x - 325, // width of stickyonotecard HACK!!!
      parent
    });
  }

  DoAddComment() {
    let comment = ADM.NewComment();
    this.setState(state => {
      return { comments: state.comments.concat([comment]) };
    });
  }

  DoCloseSticky() {
    this.setState({ isHidden: true });
  }

  DoMarkCommentsRead() {
    // Mark all comments read
    this.setState(state => {
      const author = ADM.GetSelectedStudentId();
      let comments = state.comments;
      comments.forEach(comment => {
        if (comment.readBy.includes(author)) return;
        comment.readBy.push(author);
      })
      return { comments };
    });
  }

  OnReplyClick() {
    this.DoAddComment();
    this.setState({
      isBeingEdited: true
    });
  }

  OnStartEdit() {
    console.error('edit started')
    this.setState({
      isBeingEdited: true
    });
  }

  OnUpdateComment() {
    // Comments were passed byRef from us to StickyNoteCard component.
    // So when StickyNoteCard is finished editing, our state.comments should
    // point to the updated text.
    // However, our parent object (e.g. property, mechanism, evidence link) is
    // passed via the URSYS call, so we have to update that explicitly.
    this.state.parent.comments = this.state.comments;
    this.setState({
      isBeingEdited: false
    });
  }

  OnCloseClick() {
    this.DoMarkCommentsRead();
    this.DoCloseSticky();
  }

  render() {
    const { classes } = this.props;
    const { comments, isHidden, isBeingEdited, top, left } = this.state;

    return (
      <Paper className={classes.stickynotePaper} hidden={isHidden} style={{ top: top, left: left }}>
        {comments.map(comment => {
          return (
            <StickyNoteCard
              comment={comment}
              key={comment.id}
              onStartEdit={this.OnStartEdit}
              onUpdateComment={this.OnUpdateComment}
            />
          );
        })}
        <Button
          size="small"
          style={{ margin: '5px' }}
          variant="outlined"
          hidden={isBeingEdited}
          onClick={this.OnReplyClick}
        >
          Reply
        </Button>
        <Button size="small" style={{ float: 'right', margin: '5px' }} variant="outlined"
          onClick={this.OnAddClick}
        >
          Add Comment
        </Button>
      </Paper>
    );
  }
}

StickyNote.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object
};

StickyNote.defaultProps = {
  classes: {}
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(StickyNote);
