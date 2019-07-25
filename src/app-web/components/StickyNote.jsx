/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

STickey Note

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
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
import DeleteIcon from '@material-ui/icons/Delete';
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
    this.DoCloseSticky = this.DoCloseSticky.bind(this);
    this.OnCloseClick = this.OnCloseClick.bind(this);

    this.state = {
      isHidden: true,
      targetType: 'component',
      targetId: 'tank',
      comments: [],
    };

    UR.Sub('ADM_DATA_UPDATED', this.DoADMDataUpdate); // Broadcast when a group is added.
    UR.Sub('STICKY:OPEN', this.DoOpenSticky);
  }

  componentDidMount() { }

  componentWillUnmount() { }

  DoADMDataUpdate() {

  }

  DoOpenSticky(data) {
    let { targetType, targetId, comments } = data;
    this.setState({
      isHidden: false,
      targetType,
      targetId,
      comments
    });
  }

  DoCloseSticky() {
    this.setState({ isHidden: true });
  }

  OnCloseClick() {
    // Mark all comments read
    this.setState(state => {
      const author = ADM.GetSelectedStudentId();
      let comments = state.comments;
      comments.forEach(comment => {
        if (comment.readBy.includes(author)) return;
        comment.readBy.push(author);
      })
      return { comments }
    });
    this.DoCloseSticky();
  }

  render() {
    const { classes } = this.props;
    const { comments, isHidden } = this.state;

    return (
      <Paper className={classes.stickynotePaper} hidden={isHidden}>
        {comments.map(comment => {
          return <StickyNoteCard comment={comment} key={comment.id} />;
        })}
        <Button
          size="small"
          style={{ float: 'right', margin: '5px' }}
          variant="outlined"
          onClick={this.OnCloseClick}
        >
          Close
        </Button>
        <Button size="small" style={{ float: 'right', margin: '5px' }} variant="outlined">
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
