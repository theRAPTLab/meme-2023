/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Model Select

Dialog for students to select a model.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import './MEMEStyles.css';
import './WModelSelect.css';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../system/ursys';
import SESSION from '../../system/common-session';
import ADM from '../modules/data';
import WModelsListTable from './WModelsListTable';
import WGroupSelector from '../views/ViewAdmin/components/WAdmGroupSelector';
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
    this.OnTargetSelectClose = this.OnTargetSelectClose.bind(this);
    this.OnModelMove = this.OnModelMove.bind(this);
    this.OnMoveTargetSelect = this.OnMoveTargetSelect.bind(this);
    this.OnModelDelete = this.OnModelDelete.bind(this);
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
      targetSelectDialogOpen: false,
      targetSelectionType: '',
      targetSelectCallback: undefined
    };
  }

  componentDidMount() {
    this.DoADMDataUpdate();
  }

  componentWillUnmount() {
    console.error('ModelSElect unmounted!!!');
    UR.Unsubscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate);
    UR.Unsubscribe('MODEL_SELECT_OPEN', this.DoModelDialogOpen);
  }

  DoADMDataUpdate(data) {
    console.warn(
      'ModelSelect ADM_DATA_UPDATED',
      ADM.IsLoggedOut(),
      'Why were we trying to re-open the dialog?',
      data
    );
    this.setState({
      // modelSelectDialogOpen: !ADM.IsLoggedOut(),
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
        targetSelectDialogOpen: false,
        targetSelectionType: '',
        targetSelectCallback: undefined
      });
    }
  }

  OnModelDialogClose(event, reason) {
    // disableBackdropClick
    if (reason === 'backdropClick') return;

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
        targetSelectDialogOpen: true,
        targetSelectionType: 'clone',
        targetSelectCallback: this.OnCloneTargetSelect
      });
    } else {
      const groupId = ADM.GetSelectedGroupId();
      ADM.CloneModel(modelId, groupId);
    }
  }

  /**
   *
   * @param {Object} selections { selectedTeacherId, selectedClassroomId, selectedGroupId }
   */
  OnCloneTargetSelect(selections) {
    ADM.CloneModelBulk(this.state.modelId, selections);
    this.setState({ targetSelectDialogOpen: false });
  }

  OnTargetSelectClose() {
    this.setState({ targetSelectDialogOpen: false });
  }

  OnModelMove(modelId) {
    console.log('move');
    // set select a different groupID
    this.setState({
      modelId,
      targetSelectDialogOpen: true,
      targetSelectionType: 'move',
      targetSelectCallback: this.OnMoveTargetSelect
    });
  }

  /**
   *
   * @param {Object} selections { selectedTeacherId, selectedClassroomId, selectedGroupId }
   */
  OnMoveTargetSelect(selections) {
    // only move one selection
    ADM.MoveModel(this.state.modelId, selections);
    this.setState({ targetSelectDialogOpen: false });
  }

  OnModelDelete(modelId) {
    console.log('delete');
    ADM.DeleteModel(modelId);
  }

  OnLogout() {
    ADM.Logout();
  }

  render() {
    const {
      modelSelectDialogOpen,
      targetSelectDialogOpen,
      targetSelectionType,
      targetSelectCallback,
      canViewOthers,
      studentId,
      groupName,
      classroomName,
      teacherName
    } = this.state;
    const isTeacher = SESSION.IsTeacher();
    let myModels = isTeacher ? ADM.GetModelsByTeacher() : ADM.GetModelsByStudent();
    myModels = myModels.filter(m => !m.deleted);
    let ourModels = ADM.GetMyClassmatesModels(
      ADM.GetSelectedClassroomId(),
      studentId
    );
    ourModels = ourModels.filter(m => !m.deleted);
    let deletedModels = isTeacher
      ? ADM.GetModelsByTeacher()
      : ADM.GetModelsByStudent();
    deletedModels = deletedModels.filter(m => m.deleted);

    const readOnlyStatus = ADM.IsDBReadOnly() ? (
      <span>READ ONLY MODE</span>
    ) : undefined;

    const CreateNewModelButton = ADM.IsDBReadOnly() ? undefined : (
      <button onClick={this.OnNewModel} className="primary">
        Create New Model
      </button>
    );

    const TITLEBAR = (
      <div className="titlebar">
        <div>
          <span>MY GROUP: {groupName} | </span>
          <span>MY CLASS: {classroomName} | </span>
          <span>MY TEACHER: {teacherName}</span>
        </div>
        <button className="transparent" onClick={this.OnLogout}>
          Logout
        </button>
      </div>
    );

    return (
      modelSelectDialogOpen && (
        <div className="WModelSelect dialog-container">
          <div className="dialog">
            {TITLEBAR}
            <h1>Hi {ADM.GetLoggedInUserName()}!</h1>
            <hr />
            <div>
              {CreateNewModelButton}
              <h2>{ADM.GetStudentGroupName()} Group&rsquo;s Models</h2>
              <WModelsListTable
                models={myModels}
                isAdmin={false}
                showGroup={false}
                OnModelSelect={this.OnModelEdit}
                OnModelClone={this.OnModelClone}
                OnModelMove={this.OnModelMove}
                OnModelDelete={this.OnModelDelete}
              />
              {canViewOthers && (
                <>
              <h2>My Class&rsquo; Models</h2>
              <WModelsListTable
                models={ourModels}
                isAdmin={false}
                showGroup
                OnModelSelect={this.OnModelView}
                OnModelClone={this.OnModelClone}
                OnModelMove={this.OnModelMove}
                OnModelDelete={this.OnModelDelete}
              />
                </>
              )}
              {isTeacher && (
                <>
                  <h2>Deleted Models</h2>
                  <WModelsListTable
                    models={deletedModels}
                    isAdmin
                    showGroup
                    OnModelSelect={this.OnModelView}
                    OnModelClone={this.OnModelClone}
                    OnModelMove={this.OnModelMove}
                    OnModelDelete={this.OnModelDelete}
                  />
                </>
              )}
              <WGroupSelector
                open={targetSelectDialogOpen}
                type={targetSelectionType}
                OnClose={this.OnTargetSelectClose}
                OnSelect={targetSelectCallback}
              />
            </div>
          </div>
        </div>
      )
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default ModelSelect;
