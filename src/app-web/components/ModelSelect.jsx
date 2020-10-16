/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Model Select

Dialog for students to select a model.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from './MEMEStyles';
import UR from '../../system/ursys';
import SESSION from '../../system/common-session';
import ADM from '../modules/data';
import ModelsListTable from './ModelsListTable';
import GroupSelector from '../views/ViewAdmin/components/AdmGroupSelector';
import UTILS from '../modules/utils';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class ModelSelect extends React.Component {
  constructor(props) {
    super();
    this.DoADMDataUpdate = this.DoADMDataUpdate.bind(this);
    this.DoModelDialogOpen = this.DoModelDialogOpen.bind(this);
    this.OnModelDialogClose = this.OnModelDialogClose.bind(this);
    this.OnNewModel = this.OnNewModel.bind(this);
    this.OnModelEdit = this.OnModelEdit.bind(this);
    this.OnModelView = this.OnModelView.bind(this);
    this.OnModelClone = this.OnModelClone.bind(this);
    this.OnCloneTargetSelect = this.OnCloneTargetSelect.bind(this);
    this.OnCloneTargetClose = this.OnCloneTargetClose.bind(this);
    this.OnModelMove = this.OnModelMove.bind(this);
    this.OnLogout = this.OnLogout.bind(this);

    UR.Subscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate);
    UR.Subscribe('MODEL_SELECT_OPEN', this.DoModelDialogOpen);

    this.state = {
      modelId: '',
      modelSelectDialogOpen: false,
      canViewOthers: false,
      studentId: '',
      groupName: '',
      classroomName: '',
      teacherName: '',
      cloneTargetSelectDialogOpen: false
    };
  }

  componentDidMount() {
    this.DoADMDataUpdate();
  }

  componentWillUnmount() {
    UR.Unsubscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate);
    UR.Unsubscribe('MODEL_SELECT_OPEN', this.DoModelDialogOpen);
  }

  DoADMDataUpdate() {
    this.setState({
      canViewOthers: ADM.CanViewOthers()
    });
  }

  DoModelDialogOpen() {
    if (ADM.GetSelectedModelId() !== undefined) {
      const studentId = ADM.GetAuthorId();
      const groupName = ADM.GetGroupNameByStudent(studentId);
      const classroomName = ADM.GetClassroomNameByStudent(studentId);
      const teacherName = ADM.GetTeacherNameByStudent(studentId);
      this.setState({
        modelId: ADM.GetSelectedModelId(),
        modelSelectDialogOpen: true,
        canViewOthers: ADM.CanViewOthers(),
        studentId,
        groupName,
        classroomName,
        teacherName,
        cloneTargetSelectDialogOpen: false
      });
    }
  }

  OnModelDialogClose() {
    this.setState({ modelSelectDialogOpen: false });
  }

  OnNewModel() {
    ADM.NewModel(() => this.OnModelDialogClose());
  }

  OnModelEdit(modelId) {
    ADM.LoadModel(modelId);
    UR.Publish('MODEL:ALLOW_EDIT');
    UTILS.RLog('ModelOpenEdit');
    this.OnModelDialogClose();
  }

  OnModelView(modelId) {
    ADM.LoadModel(modelId);
    UTILS.RLog('ModelOpenView');
    this.OnModelDialogClose();
  }

  OnModelClone(modelId) {
    // If we're a teacher, we have to select a target group
    const isTeacher = SESSION.IsTeacher();
    if (isTeacher) {
      // set select a different groupID
      this.setState({
        modelId,
        cloneTargetSelectDialogOpen: true
      });
    } else {
      const groupId = ADM.GetSelectedGroupId();
      ADM.CloneModel(modelId, groupId);
    }
  }

  OnCloneTargetSelect(selections) {
    ADM.CloneModelBulk(this.state.modelId, selections);
    this.setState({ cloneTargetSelectDialogOpen: false });
  }

  OnCloneTargetClose() {
    this.setState({ cloneTargetSelectDialogOpen: false });
  }

  OnModelMove(modelId) {
    console.log('move');
  }

  OnLogout() {
    ADM.Logout();
  }

  render() {
    const { classes } = this.props;
    const {
      modelSelectDialogOpen,
      cloneTargetSelectDialogOpen,
      canViewOthers,
      studentId,
      groupName,
      classroomName,
      teacherName
    } = this.state;
    const isTeacher = SESSION.IsTeacher();
    const myModels = isTeacher ? ADM.GetModelsByTeacher() : ADM.GetModelsByStudent();
    const ourModels = ADM.GetMyClassmatesModels(ADM.GetSelectedClassroomId(), studentId);
    const readOnlyStatus = ADM.IsDBReadOnly() ? (
      <Typography variant="caption">READ ONLY MODE</Typography>
    ) : (
      undefined
    );
    const createNewModelButton = ADM.IsDBReadOnly() ? (
      undefined
    ) : (
      <Button onClick={this.OnNewModel} color="primary" variant="contained">
        Create New Model
      </Button>
    );
    return (
      <>
        <Dialog
          disableBackdropClick
          disableEscapeKeyDown
          open={modelSelectDialogOpen}
          onClose={this.OnLoginDialogClose}
          fullScreen
        >
          <DialogActions>
            {readOnlyStatus}
            <Typography variant="caption">MY GROUP: {groupName} | </Typography>
            <Typography variant="caption">MY CLASS: {classroomName} | </Typography>
            <Typography variant="caption">MY TEACHER: {teacherName}</Typography>
            <div style={{ flexGrow: 1 }} />
            <Button onClick={this.OnLogout} color="primary">
              Logout
            </Button>
          </DialogActions>
          <DialogTitle>Hi {ADM.GetStudentName()}!</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item>{createNewModelButton}</Grid>
            </Grid>
            <Divider style={{ margin: '2em' }} />
            <Grid container spacing={2}>
              <Grid item>
                <Typography variant="h4">
                  {ADM.GetStudentGroupName()} Group&rsquo;s Models
                </Typography>
                <ModelsListTable
                  models={myModels}
                  OnModelSelect={this.OnModelEdit}
                  OnModelClone={this.OnModelClone}
                  OnModelMove={this.OnModelMove}
                />
              </Grid>
              <Grid item hidden={!canViewOthers}>
                <Typography variant="h4">My Class&rsquo; Models</Typography>
                <ModelsListTable
                  models={ourModels}
                  OnModelSelect={this.OnModelView}
                  OnModelClone={this.OnModelClone}
                  OnModelMove={this.OnModelMove}
                />
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
        <GroupSelector
          open={cloneTargetSelectDialogOpen}
          OnClose={this.OnCloneTargetClose}
          OnSelect={this.OnCloneTargetSelect}
        />
      </>
    );
  }
}

ModelSelect.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object
};

ModelSelect.defaultProps = {
  classes: {}
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(ModelSelect);
