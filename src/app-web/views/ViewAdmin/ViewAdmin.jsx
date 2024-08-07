/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  ViewAdmin - Classroom Management Layout

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import '../../components/MEMEStyles.css';
import './ViewAdmin.css';

import { withTheme } from 'styled-components';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../../system/ursys';
import WTeacherSelector from './components/WAdmTeacherSelector';
import WClassroomsSelector from './components/WAdmClassroomsSelector';
import WCriteriaView from './components/WAdmCriteriaView';
import SentenceStarters from './components/AdmSentenceStarters';
import WGroupsList from './components/WAdmGroupsList';
import WModelsList from './components/WAdmModelsList';
import ResourcesList from './components/AdmResourcesList';
import WRatingsView from './components/WAdmRatingsView';
import WInfoDialog from '../../components/WInfoDialog';
/// MODULES ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import ADM from '../../modules/data';

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
    padding: theme.spacing(2),
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
    UR.ReactPreflight(ViewAdmin, module);
    this.cstrName = this.constructor.name;

    // FIXME: This will go away when UR.DB_Susbscribe('ADMIN:UPDATED') is implemented
    //        in adm-data.js.
    // Initialize Admin Data, but for now still need this
    // NOTE: this is now handled by adm-data automatically
    // ADM.Load();
  }

  componentDidMount() {
    if (DBG) console.log(`<${this.cstrName}> mounted`);
  }

  render() {
    const { theme: classes } = this.props;

    if (!UR.IsAdminLoggedIn())
      return (
        <div className="dialog">
          <p>The admin panel is accessible on the server machine at</p>
          <pre>http://localhost:3000/#/admin</pre>
          <p>If you are unable to use localhost, use ADMIN_QSTRING override</p>
        </div>
      );

    return (
      <div className="ViewAdmin dialog-container">
        <div>
          <WTeacherSelector />
          <WClassroomsSelector />
        </div>
        <WGroupsList />
        <WModelsList />
        <div>
          <WRatingsView />
          <WCriteriaView />
        </div>
        {/* General Information Dialog */}
        <WInfoDialog />
      </div>
    );
    return (
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TeacherSelector />
          </Grid>
          <Grid item xs={6}>
            <ClassroomsSelector />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <WGroupsList />
          </Grid>
          <Grid item xs={6}>
            <ModelsList />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <WRatingsView />
          </Grid>
          <Grid item xs={5}>
            <WCriteriaView />
          </Grid>
          <Grid item xs={3}>
            <SentenceStarters />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ResourcesList />
          </Grid>
          <Grid item xs={3} />
        </Grid>

        {/* General Information Dialog */}
        <WInfoDialog />
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
/// disallowed by eslint, so use shape({prop:ProtType })
/// to describe them in more detail
ViewAdmin.propTypes = {
  classes: PropTypes.shape({})
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// required for UR EXEC phase filtering by view path
ViewAdmin.MOD_ID = __dirname;

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withTheme(ViewAdmin);
