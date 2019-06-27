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
import TeacherSelector from '../components/AdmTeacherSelector';
import ClassroomsList from '../components/AdmClassroomsList';
import CriteriaList from '../components/AdmCriteriaList';
import GroupsList from '../components/AdmGroupsList';
import ModelsList from '../components/AdmModelsList';
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

    this.HandleTeacherSelect = this.HandleTeacherSelect.bind(this);
    this.HandleClassroomSelect = this.HandleClassroomSelect.bind(this);

    this.state = {
      // FIXME: This should be replaced with a data call
      teachers: [{ id: 'brown', name: 'Ms Brown' }, { id: 'smith', name: 'Mr Smith' }],
      selectedTeacherId: '',
      classrooms: [
        { id: 'cl01', name: 'Period 1', teacherId: 'brown'},
        { id: 'cl02', name: 'Period 3', teacherId: 'brown'},
        { id: 'cl03', name: 'Period 2', teacherId: 'smith'},
        { id: 'cl04', name: 'Period 3', teacherId: 'smith'}
      ],
      selectedClassroomId: '',
      criteria: [
        {
          id: 'cr01',
          label: 'Clarity',
          description: 'How clear is the explanation?',
          classroomId: 'cl01'
        },
        {
          id: 'cr02',
          label: 'Visuals',
          description: 'Does the layout make sense?',
          classroomId: 'cl01'
        },
        {
          id: 'cr03',
          label: 'Clarity',
          description: 'How clear is the evidence link?',
          classroomId: 'cl02'
        },
        {
          id: 'cr04',
          label: 'Layout',
          description: 'Does the layout make sense?',
          classroomId: 'cl02'
        }
      ],
      groups: [
        { id: 'gr01', name: 'Blue', students: 'Bob, Bessie, Bill', classroomId: 'cl01' },
        { id: 'gr02', name: 'Green', students: 'Ginger, Gail, Greg', classroomId: 'cl01' },
        { id: 'gr03', name: 'Red', students: 'Rob, Reese, Randy', classroomId: 'cl01' },
        { id: 'gr04', name: 'Purple', students: 'Peter, Paul, Penelope', classroomId: 'cl02' },
      ],
      models: [
        { id: 'mo01', title: 'Fish Sim', groupId: 'gr01', dateCreated:'', dateModified:'', data:''},
        { id: 'mo02', title: 'Tank Sim', groupId: 'gr01', dateCreated:'', dateModified:'', data:''},
        { id: 'mo03', title: 'Ammonia Sim', groupId: 'gr01', dateCreated: '', dateModified: '', data: '' },
        { id: 'mo04', title: 'Fish Sim', groupId: 'gr02', dateCreated: '', dateModified: '', data: '' },
        { id: 'mo05', title: 'Tank Sim', groupId: 'gr02', dateCreated: '', dateModified: '', data: '' },
        { id: 'mo06', title: 'Fish Sim', groupId: 'gr04', dateCreated: '', dateModified: '', data: '' },
        { id: 'mo07', title: 'No Sim', groupId: 'gr04', dateCreated: '', dateModified: '', data: '' }
      ]
    }
  }

  componentDidMount() {
    console.log(`<${this.cstrName}> mounted`);
  }

  HandleTeacherSelect(teacherId) {
    console.log('Teacher selected', teacherId);
    this.setState({ selectedTeacherId: teacherId });
  }

  HandleClassroomSelect(classroomId) {
    console.log('Classroom selected', classroomId);
    this.setState({ selectedClassroomId: classroomId });
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={2}>
            <TeacherSelector
              teachers={this.state.teachers}
              selectedTeacherId={this.state.selectedTeacherId}
              UpdateTeacher={this.HandleTeacherSelect}
            />
          </Grid>
          <Grid item xs={2}>
            <ClassroomsList
              classrooms={this.state.classrooms}
              selectedTeacherId={this.state.selectedTeacherId}
              selectedClassroomId={this.state.selectedClassroomId}
              UpdateClassroom={this.HandleClassroomSelect}
            />
          </Grid>
        </Grid>
        <Grid container spacing={24}>
          <Grid item xs={6}>
            <CriteriaList
              selectedClassroomId={this.state.selectedClassroomId}
              criteria={this.state.criteria}
            />
          </Grid>
          <Grid item xs={6}>
            <GroupsList
              selectedClassroomId={this.state.selectedClassroomId}
              groups={this.state.groups}
            />
          </Grid>
          <Grid item xs={6}>
            <ModelsList
              selectedClassroomId={this.state.selectedClassroomId}
              models={this.state.models}
              groups={this.state.groups}
            />
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>xs=3</Paper>
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
