/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

STickey Note Icon Button

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
// Material UI components
import Button from '@material-ui/core/Button';
// Material UI Icons
import ChatIcon from '@material-ui/icons/Chat';
import ChatBubbleIcon from '@material-ui/icons/ChatBubble';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from './MEMEStyles';
import UR from '../../system/ursys';
import ADM from '../modules/adm-data';
import PMC from '../modules/pmc-data';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'StickyNoteButton:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class StickyNoteButton extends React.Component {
  constructor(props) {
    super(props);
    this.OnCommentClick = this.OnCommentClick.bind(this);
  }

  componentDidMount() { }

  componentWillUnmount() { }

  OnCommentClick(e) {
    e.preventDefault();
    this.props.OnClick(e);
  }

  render() {
    const { classes, comments } = this.props;

    const hasNoComments = comments.length < 1;
    const author = ADM.GetSelectedStudentId();
    let hasUnreadComments = comments.find(comment => {
      return comment.readBy ? !comment.readBy.includes(author) : false;
    });

    // Figure out which icon to show
    // Has comments, all read
    let icon = <ChatBubbleIcon className={classes.stickynoteIcon} />;
    if (hasNoComments) {
      icon = <ChatBubbleOutlineIcon className={classes.stickynoteIcon} />;
    } else if (hasUnreadComments) {
      icon = <ChatIcon className={classes.stickynoteIcon} />;
    }

    return <Button onClick={this.OnCommentClick}>{icon}</Button>;
  }
}

StickyNoteButton.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  comments: PropTypes.array,
  OnClick: PropTypes.func
};

StickyNoteButton.defaultProps = {
  classes: {},
  comments: [],
  OnClick: () => {
    console.error('StickyNoteButton.onClick props method has not been defined!');
  }
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(StickyNoteButton);
