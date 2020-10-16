/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Models List View

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

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
    this.OnModelMove = this.OnModelMove.bind(this);
    this.OnCloneTargetSelect = this.OnCloneTargetSelect.bind(this);
    this.OnCloneTargetClose = this.OnCloneTargetClose.bind(this);

    this.state = {
      classroomId: '',
      models: [],
      modelId: undefined,
      cloneTargetSelectDialogOpen: false
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
      cloneTargetSelectDialogOpen: true
    });
  }

  OnModelMove(e) {
    alert('Model Move is not implmented yet!');
  }

  OnCloneTargetSelect(selections) {
    console.log('OnCloneTargetSElect', selections);
    ADM.CloneModelBulk(this.state.modelId, selections);
    this.setState({ cloneTargetSelectDialogOpen: false });
  }

  OnCloneTargetClose() {
    this.setState({ cloneTargetSelectDialogOpen: false });
  }

  render() {
    const { classes } = this.props;
    const { models, cloneTargetSelectDialogOpen } = this.state;

    return (
      <>
        <Paper className={classes.admPaper}>
          <InputLabel>MODELS</InputLabel>
          <ModelsListTable
            models={models}
            OnModelSelect={this.OnModelView}
            OnModelClone={this.OnModelClone}
            OnModelMove={this.OnModelMove}
          />
        </Paper>
        <GroupSelector
          open={cloneTargetSelectDialogOpen}
          OnClose={this.OnCloneTargetClose}
          OnSelect={this.OnCloneTargetSelect}
        />
      </>
    );
  }
}

ModelsList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object
};

ModelsList.defaultProps = {
  classes: {}
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(ModelsList);
