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
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
// Material UI Icons
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

    this.DoClassroomSelect = this.DoClassroomSelect.bind(this);
    this.OnEditClick = this.OnEditClick.bind(this);
    this.OnEditFinished = this.OnEditFinished.bind(this);
    this.OnCriteriaSelect = this.OnCriteriaSelect.bind(this);
    this.OnCommentTextChange = this.OnCommentTextChange.bind(this);

    this.state = {
      isBeingEdited: true,
      allowedToEdit: true,
      allowedToDelete: true,
      criteria: [],
      selectedCriteriaId: '',
      comment: this.props.comment
    };

    UR.Sub('CLASSROOM_SELECT', this.DoClassroomSelect); // Broadcast when a group is added.
  }

  componentDidMount() { }

  componentWillUnmount() { }

  DoClassroomSelect() {
    const criteria = ADM.GetCriteriaByClassroom();
    const currentGroup = ADM.GetGroupByStudent();
    const authorGroup = ADM.GetGroupByStudent(this.props.comment.author);
    const isAuthor = currentGroup === authorGroup;
    this.setState({
      criteria,
      selectedCriteriaId: this.props.comment.criteriaId,
      allowedToEdit: isAuthor,
      allowedToDelete: isAuthor
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
      return ({ comment });
    })
  }

  render() {
    const {
      isBeingEdited,
      allowedToEdit,
      allowedToDelete,
      criteria,
      selectedCriteriaId,
      comment
    } = this.state;
    const { classes } = this.props;
    const date = new Date(comment.time);
    const time = date.toLocaleTimeString();

    let criteriaDisplay = ADM.GetCriteriaLabel(selectedCriteriaId);
    if (isBeingEdited) {
      criteriaDisplay = (
        <FormControl>
          <Select
            value={comment.criteriaId}
            onChange={this.OnCriteriaSelect}
            input={<Input name="criteriaSelector" id="criteriaSelector-helper" />}
            className={classes.criteriaSelectorMenu}
            autoWidth
          >
            {criteria.map(crit => (
              <MenuItem value={crit.id} key={crit.id} className={classes.criteriaSelectorMenu}>
                {crit.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    return (
      <ClickAwayListener onClickAway={this.OnEditFinished}>
        <Card className={classes.stickynoteCard}>
          <CardContent>
            <Grid container>
              <Grid item xs className={classes.stickynoteCardAuthor}>
                <Typography variant="subtitle2">
                  {`${comment.author} ${ADM.GetGroupByStudent(comment.author).name}`}
                </Typography>
              </Grid>
              <Grid item>
                <InputLabel className={classes.stickynoteCardLabel}>CRITERIA:&nbsp;</InputLabel>
                <div className={classes.stickynoteCardCriteria}>{criteriaDisplay}</div>
              </Grid>
            </Grid>
            <Grid container>
              <Typography variant="caption" className={classes.stickynoteCardLabel}>
                {`${time} ${date.toDateString()}`}
              </Typography>
            </Grid>
            <Grid container>
              <TextField
                className={classes.stickynoteCardInput}
                value={comment.text}
                onChange={this.OnCommentTextChange}
                multiline
                InputProps={{
                  readOnly: !allowedToEdit && isBeingEdited
                }}
              />
            </Grid>
          </CardContent>
          <CardActions>
            <Grid container>
              <Grid item style={{ flexGrow: '1', alignItems: 'center' }}>
                <Button
                  onClick={this.OnDeleteCard}
                  size="small"
                  hidden={!allowedToDelete}
                  color="primary"
                >
                  Delete Card
                </Button>
              </Grid>
              <Grid item xs={1}>
                <IconButton
                  size="small"
                  hidden={!allowedToEdit}
                  onClick={this.OnEditClick}
                  className={classes.stickynoteCardEditBtn}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      </ClickAwayListener>
    );
  }
}

StickyNoteCard.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object
};

StickyNoteCard.defaultProps = {
  classes: {}
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(StickyNoteCard);
