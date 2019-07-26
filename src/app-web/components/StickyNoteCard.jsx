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
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputBase from '@material-ui/core/InputBase';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
// Material UI Icons
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from './MEMEStyles';
import UR from '../../system/ursys';
import ADM from '../modules/adm-data';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class StickyNoteCard extends React.Component {
  constructor(props) {
    super(props);

    this.DoOpenSticky = this.DoOpenSticky.bind(this);
    this.OnEditClick = this.OnEditClick.bind(this);
    this.OnEditFinished = this.OnEditFinished.bind(this);
    this.OnCriteriaSelect = this.OnCriteriaSelect.bind(this);
    this.OnCommentTextChange = this.OnCommentTextChange.bind(this);
    this.OnShowEditButtons = this.OnShowEditButtons.bind(this);
    this.OnHideEditButtons = this.OnHideEditButtons.bind(this);

    this.state = {
      hasBeenRead: false,
      isBeingEdited: false,
      allowedToEdit: false,
      allowedToDelete: false,
      showEditButtons: false,
      criteria: [],
      selectedCriteriaId: '',
      comment: this.props.comment
    };
  }

  componentDidMount() {
    this.DoOpenSticky();
  }

  componentWillUnmount() { }

  DoOpenSticky() {
    const criteria = ADM.GetCriteriaByClassroom();
    const currentGroup = ADM.GetGroupByStudent();
    const authorGroup = ADM.GetGroupByStudent(this.props.comment.author);
    const isAuthor = currentGroup === authorGroup;
    const hasBeenRead = this.props.comment.readBy
      ? this.props.comment.readBy.includes(ADM.GetSelectedStudentId())
      : false;
    this.setState({
      criteria,
      hasBeenRead,
      selectedCriteriaId: this.props.comment.criteriaId,
      allowedToEdit: isAuthor,
      allowedToDelete: isAuthor,
    });
  }

  OnEditClick() {
    this.setState({ isBeingEdited: true });
  }

  OnEditFinished() {
    this.setState({ isBeingEdited: false });
  }

  OnCriteriaSelect(e) {
    this.setState({ selectedCriteriaId: e.target.value });
  }

  OnCommentTextChange(e) {
    const text = e.target.value;
    this.setState(state => {
      let comment = state.comment;
      comment.text = text;
      return { comment };
    });
  }

  OnShowEditButtons() {
    this.setState({
      showEditButtons: true
    });
  }

  OnHideEditButtons() {
    this.setState({
      showEditButtons: false
    });
  }

  render() {
    const {
      hasBeenRead,
      isBeingEdited,
      allowedToEdit,
      allowedToDelete,
      showEditButtons,
      criteria,
      selectedCriteriaId,
      comment
    } = this.state;
    const { classes } = this.props;
    const date = new Date(comment.date);
    const timestring = date.toLocaleTimeString('en-Us', {
      hour: '2-digit', minute: '2-digit'
    });
    const datestring = date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });

    let criteriaDisplay = ADM.GetCriteriaLabel(selectedCriteriaId);
    if (isBeingEdited) {
      criteriaDisplay = (
        <select value={comment.criteriaId} onChange={this.OnCriteriaSelect}>
          <option value="" key="empty">
            Select one...
          </option>
          {criteria.map(crit => (
            <option value={crit.id} key={crit.id} className={classes.criteriaSelectorMenu}>
              {crit.label}
            </option>
          ))}
        </select>
      );
      // Material UI Select is too large and clunky!
      // criteriaDisplay = (
      //   <FormControl variant="outlined">
      //     <Select
      //       value={comment.criteriaId}
      //       onChange={this.OnCriteriaSelect}
      //       input={
      //         <OutlinedInput name="criteriaSelector" id="criteriaSelector-helper" labelWidth={0} />
      //       }
      //       className={classes.criteriaSelectorMenu}
      //       autoWidth
      //     >
      //       {criteria.map(crit => (
      //         <MenuItem value={crit.id} key={crit.id} className={classes.criteriaSelectorMenu}>
      //           {crit.label}
      //         </MenuItem>
      //       ))}
      //     </Select>
      //   </FormControl>
      // );
    }
    return (
      <ClickAwayListener onClickAway={this.OnEditFinished}>
        <Paper
          className={ hasBeenRead ? classes.stickynoteCardRead : classes.stickynoteCard }
          onMouseEnter={this.OnShowEditButtons}
          onMouseLeave={this.OnHideEditButtons}
        >
          <Grid container>
            <Grid item style={{ flexGrow: 1 }}>
              <InputLabel className={classes.stickynoteCardLabel}>CRITERIA:&nbsp;</InputLabel>
              <div className={classes.stickynoteCardCriteria}>{criteriaDisplay}</div>
            </Grid>
            <Grid item>
              <Typography variant="caption" className={classes.stickynoteCardLabel}>
                {`${timestring} ${datestring}`}
              </Typography>
            </Grid>
          </Grid>
          <Grid container>
            <TextField
              className={classes.stickynoteCardInput}
              value={comment.text}
              onChange={this.OnCommentTextChange}
              margin="dense"
              hiddenLabel
              variant="filled"
              rowsMax="4"
              multiline
              inputProps={{
                readOnly: allowedToEdit && !isBeingEdited
              }}
            />
          </Grid>
          <Grid container style={{ alignItems: 'flex-end' }}>
            <Grid item xs>
              <Typography variant="subtitle2" className={classes.stickynoteCardAuthor}>
                {`by ${comment.author} ${ADM.GetGroupByStudent(comment.author).name}`}
              </Typography>
            </Grid>
            <Grid item style={{ flexGrow: '1', alignItems: 'center', textAlign: 'center' }}>
              <IconButton
                size="small"
                hidden={!showEditButtons || !allowedToDelete}
                onClick={this.OnDeleteCard}
                className={classes.stickynoteCardEditBtn}
              >
                <DeleteIcon fontSize="small" className={classes.stickynoteCardAuthor}/>
              </IconButton>
            </Grid>
            <Grid item xs={1}>
              <IconButton
                size="small"
                hidden={!showEditButtons || (!allowedToEdit || isBeingEdited)}
                onClick={this.OnEditClick}
                className={classes.stickynoteCardEditBtn}
              >
                <EditIcon fontSize="small" className={classes.stickynoteCardAuthor}/>
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      </ClickAwayListener>
    );
  }
}

StickyNoteCard.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  comment: PropTypes.object
};

StickyNoteCard.defaultProps = {
  classes: {},
  comment: {
    id: -1,
    author: '',
    date: new Date(),
    text: '',
    criteriaId: ''
  }
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(StickyNoteCard);
