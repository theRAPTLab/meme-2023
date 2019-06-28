/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  ViewAdmin - Classroom Management Layout

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../system/ursys';
import TeacherSelector from './components/AdmTeacherSelector';
import ClassroomsSelector from './components/AdmClassroomsSelector';
import CriteriaList from './components/AdmCriteriaList';
import GroupsList from './components/AdmGroupsList';
import ModelsList from './components/AdmModelsList';
import ResourcesList from './components/AdmResourcesList';
/// MODULES ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import ADM from '../modules/adm-data';

/// CSS IMPORTS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import 'bootstrap/dist/css/bootstrap.css';

/// DEBUG CONTROL /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const styles = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary
  }
});
/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class ViewAdmin extends React.Component {
  // constructor
  constructor(props) {
    super(props);
    this.cstrName = this.constructor.name;

    this.DoTeacherSelect = this.DoTeacherSelect.bind(this);
    this.DoClassroomSelect = this.DoClassroomSelect.bind(this);

    // Initialize Admin Data
    ADM.Load();

    UR.Sub('TEACHER_SELECT', this.DoTeacherSelect);
    UR.Sub('CLASSROOM_SELECT', this.DoClassroomSelect);

    this.state = {
      selectedTeacherId: '',
      selectedClassroomId: '',
      classroomResources: [
        { classroomId: 'cl01', resources: ['rs1', 'rs2'] },
        { classroomId: 'cl02', resources: ['rs2', 'rs3'] },
        { classroomId: 'cl03', resources: ['rs4', 'rs5'] },
        { classroomId: 'cl04', resources: ['rs6', 'rs7'] }
      ]
    }
  }

  componentDidMount() {
    if (DBG) console.log(`<${this.cstrName}> mounted`);
  }

  DoTeacherSelect(data) {
    if (DBG) console.log('Teacher selected', data.teacherId);
    this.setState({ selectedTeacherId: data.teacherId });
  }

  DoClassroomSelect(data) {
    if (DBG) console.log('Classroom selected', data.classroomId);
    this.setState({ selectedClassroomId: data.classroomId });
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={2}>
            <TeacherSelector />
          </Grid>
          <Grid item xs={2}>
            <ClassroomsSelector />
          </Grid>
        </Grid>
        <Grid container spacing={24}>
          <Grid item xs={6}>
            <GroupsList />
          </Grid>
          <Grid item xs={6}>
            <ModelsList />
          </Grid>
        </Grid>
        <Grid container spacing={24}>
          <Grid item xs={6}>
            <CriteriaList />
          </Grid>
          <Grid item xs={12}>
            <ResourcesList
              selectedClassroomId={this.state.selectedClassroomId}
              classroomResources={this.state.classroomResources}
            />
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>xs=3</Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// default props are expect properties that we expect
/// and are declared for validation
ViewAdmin.defaultProps = {
  classes: { isDefaultProps: true }
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// propTypes are declared. Note "vague" propstypes are
/// disallowed by eslint, so use shape({ prop:ProtType })
/// to describe them in more detail
ViewAdmin.propTypes = {
  classes: PropTypes.shape({})
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(styles)(ViewAdmin);
