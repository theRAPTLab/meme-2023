/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Models List View

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
// Material UI Theming
import { styled } from "@mui/system";

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from '../../../components/MEMEStyles';
import UR from '../../../../system/ursys';
import ADM from '../../../modules/data';
import ModelsListTable from '../../../components/ModelsListTable';
import GroupSelector from './AdmGroupSelector';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class ModelsList extends React.Component {
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
      targetSelectionType: '',
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
      models: ADM.GetModelsByClassroom(data.classroomId),
    });
  }

  DoADMDataUpdate() {
    this.setState((state) => {
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
      targetSelectCallback: this.OnCloneTargetSelect,
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
      targetSelectCallback: this.OnMoveTargetSelect,
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
    const { classes } = this.props;
    const { models, targetSelectDialogOpen, targetSelectionType, targetSelectCallback } =
      this.state;

    const activeModels = models.filter((m) => !m.deleted);
    const deletedModels = models.filter((m) => m.deleted);

    return (
      <>
        <Paper className={classes.admPaper} style={{ maxHeight: '75%', overflowY: 'scroll' }}>
          <InputLabel>MODELS</InputLabel>
          <ModelsListTable
            models={activeModels}
            isAdmin
            OnModelSelect={this.OnModelView}
            OnModelClone={this.OnModelClone}
            OnModelMove={this.OnModelMove}
            OnModelDelete={this.OnModelDelete}
          />
          <br />
          <InputLabel>DELETED MODELS</InputLabel>
          <ModelsListTable
            models={deletedModels}
            isAdmin
            OnModelSelect={this.OnModelView}
            OnModelClone={this.OnModelClone}
            OnModelMove={this.OnModelMove}
            OnModelDelete={this.OnModelDelete}
          />
        </Paper>
        <GroupSelector
          open={targetSelectDialogOpen}
          type={targetSelectionType}
          OnClose={this.OnTargetSelectClose}
          OnSelect={targetSelectCallback}
        />
      </>
    );
  }
}

ModelsList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
};

ModelsList.defaultProps = {
  classes: {},
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default styled(MEMEStyles)(ModelsList);
