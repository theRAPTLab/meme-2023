/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Models List View

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import '../../../components/MEMEStyles.css';
import './WAdmModelsList.css';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../../../system/ursys';
import ADM from '../../../modules/data';
import WModelsListTable from '../../../components/WModelsListTable';
import WGroupSelector from './WAdmGroupSelector';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class WModelsList extends React.Component {
  constructor(props) {
    super();
    this.DoClassroomSelect = this.DoClassroomSelect.bind(this);
    this.DoADMDataUpdate = this.DoADMDataUpdate.bind(this);
    this.OnModelView = this.OnModelView.bind(this);
    this.OnModelClone = this.OnModelClone.bind(this);
    this.OnCloneTargetSelect = this.OnCloneTargetSelect.bind(this);
    this.OnTargetSelectClose = this.OnTargetSelectClose.bind(this);
    this.OnModelMove = this.OnModelMove.bind(this);
    this.OnMoveTargetSelect = this.OnMoveTargetSelect.bind(this);
    this.OnModelDelete = this.OnModelDelete.bind(this);

    this.state = {
      classroomId: '',
      models: [],
      modelId: undefined,
      targetSelectDialogOpen: false,
      targetSelectionType: ''
    };

    UR.Subscribe('CLASSROOM_SELECT', this.DoClassroomSelect);
    UR.Subscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate); // Broadcast when a group is added.
    UR.Subscribe('MODEL_TITLE_UPDATED', this.DoADMDataUpdate);
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubscribe('CLASSROOM_SELECT', this.DoClassroomSelect);
    UR.Unsubscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate);
    UR.Unsubscribe('MODEL_TITLE_UPDATED', this.DoADMDataUpdate);
  }

  DoClassroomSelect(data) {
    this.setState({
      classroomId: data.classroomId,
      models: ADM.GetModelsByClassroom(data.classroomId)
    });
  }

  DoADMDataUpdate() {
    this.setState(state => {
      return { models: ADM.GetModelsByClassroom(state.classroomId) };
    });
  }

  OnModelView(modelId) {
    ADM.LoadModel(modelId);
  }

  OnModelClone(modelId) {
    // set select a different groupID
    this.setState({
      modelId,
      targetSelectDialogOpen: true,
      targetSelectionType: 'clone',
      targetSelectCallback: this.OnCloneTargetSelect
    });
  }

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

  render() {
    const {
      models,
      targetSelectDialogOpen,
      targetSelectionType,
      targetSelectCallback
    } = this.state;

    const activeModels = models.filter(m => !m.deleted);
    const deletedModels = models.filter(m => m.deleted);

    return (
      <div className="WAdmModelsList dialog">
        <h3>MODELS</h3>
        <WModelsListTable
          models={activeModels}
          isAdmin
          OnModelSelect={this.OnModelView}
          OnModelClone={this.OnModelClone}
          OnModelMove={this.OnModelMove}
          OnModelDelete={this.OnModelDelete}
        />
        <br />
        <h3>DELETED MODELS</h3>
        <WModelsListTable
          models={deletedModels}
          isAdmin
          OnModelSelect={this.OnModelView}
          OnModelClone={this.OnModelClone}
          OnModelMove={this.OnModelMove}
          OnModelDelete={this.OnModelDelete}
        />
        <WGroupSelector
          open={targetSelectDialogOpen}
          type={targetSelectionType}
          OnClose={this.OnTargetSelectClose}
          OnSelect={targetSelectCallback}
        />
      </div>
    );
  }
}

WModelsList.propTypes = {};

WModelsList.defaultProps = {};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WModelsList;
