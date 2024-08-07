/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  ViewAdmin - Classroom Management Layout

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import '../../components/MEMEStyles.css';
import './ViewAdmin.css';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../../system/ursys';
import WTeacherSelector from './components/WAdmTeacherSelector';
import WClassroomsSelector from './components/WAdmClassroomsSelector';
import WCriteriaView from './components/WAdmCriteriaView';
import WSentenceStarters from './components/WAdmSentenceStarters';
import WGroupsList from './components/WAdmGroupsList';
import WModelsList from './components/WAdmModelsList';
import WResourcesList from './components/WAdmResourcesList';
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
          <WRatingsView />
          <WCriteriaView />
          <WSentenceStarters />
        </div>
        <div>
          <WGroupsList />
          <WModelsList />
        </div>
        <WResourcesList />
        {/* General Information Dialog */}
        <WInfoDialog />
      </div>
    );
  }
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// default props are expect properties that we expect
/// and are declared for validation
ViewAdmin.defaultProps = {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// propTypes are declared. Note "vague" propstypes are
/// disallowed by eslint, so use shape({prop:ProtType })
/// to describe them in more detail
ViewAdmin.propTypes = {};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// required for UR EXEC phase filtering by view path
ViewAdmin.MOD_ID = __dirname;

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default ViewAdmin;
