/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  TestLockSync - example of synchronizing via clients

  URSYS doesn't currently have a built-in NETSYNC feature, but we
  can simulate it with NetSubscribe and NetCall. NetCalls will
  AGGREGATE all the returning data of message subscribers, using a
  shallow assign. While this feature has been part of UNISYS and URSYS
  for a long time, this is the first time we're actually using it.

  (1) this.editingCommentId is the "currently edited" id. It's not stored
  as state because we want an IMMEDIATE LOCK, which isn't guaranteed
  with React's setState()

  (2) the NetSync is faked with NetSubscribe('NET:SYNC_EDIT_COMMENT')
  which passes control to SUB_IsEditingComment(id), where id tested.
  It sets a key in the return object that is mapped Network Address.

  (3) To try to lock, use NetCall('NET:SYNC_EDIT_COMMENT',{id})
  .then(rdata=>{}) pattern. See the function to see what it's doing.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// REACT STUFF ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

/// MODULES ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../../system/ursys';

/// CSS IMPORTS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import { cssinfo, cssalert } from '../../modules/console-styles';

/// DEBUG CONTROL /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const SEC = 10;

/// COMPUTED STYLES ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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

/// MODULE HOOKS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
UR.Hook(__dirname, 'INITIALIZE', function () {
  console.log('Initialized');
});

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class TestLockSync extends React.Component {
  // constructor
  constructor(props) {
    super(props);
    UR.ReactPreflight(TestLockSync, module);
    this.cstrName = this.constructor.name;
    this._mounted = false;
    this.state = {
      status: 'loading'
    };
    //
    this.editingCommentId = undefined; // for comment lock
    //
    this.ULINK = UR.NewConnection('TestLockSync');
    this.SUB_IsEditingComment = this.SUB_IsEditingComment.bind(this);

    // return 'lockedby' if we're editing this comment
    this.ULINK.NetSubscribe('NET:SYNC_EDIT_COMMENT', (data) => this.SUB_IsEditingComment(data));
  }

  componentDidMount() {
    console.log(`<${this.cstrName}> mounted`);
    this._mounted = true;
    // immediately-executed asynchronous function
    (async () => {
      const status = await this.PUB_TryEditComment(12);
      this.setState({ status });
    })();
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  // return state of editing to network
  SUB_IsEditingComment(data) {
    const retval = {};
    // save key based on netsocket address w/ current edited item
    // if it's undefined, then it doesn't get encoded
    if (data.id == this.editingCommentId) {
      retval[UR.MyNetAddress()] = this.editingCommentId;
      this.setState({
        status: `DENYING request for ${data.id}`
      });
    } else {
      this.setState({
        status: `approving request for ${data.id}`
      });
    }
    return retval;
  }

  PUB_TryEditComment(id) {
    // NetCall returns a Promise
    return this.ULINK.NetCall('NET:SYNC_EDIT_COMMENT', { id })
      .then(rdata => {
        // hack around lack of NetSync command
        if (rdata.error) {
          if (rdata.error !== 'message NET:SYNC_EDIT_COMMENT not found') return;
          rdata = {};
        }
        // search keys for matching id
        const responses = Object.entries(rdata);
        const inUse = responses.find(kvp => kvp[1] == id);
        let status = '';
        // lock it
        if (!inUse) {
          this.editingCommentId = id;
          status += `${UR.MyNetAddress()} grabs control of '${id} for ${SEC} secs`;
          console.log(status);
          setTimeout(() => {
            const status = `${UR.MyNetAddress()} releases control of ${id}!`;
            this.setState({ status });
            console.log(status);
            this.editingCommentId = undefined;
          }, SEC * 1000);
          // return implicitly resolved value promise
          return status;
        } else {
          status += `${inUse[0]} already has the lock on ${id}`;
          console.log(status);
        }
      });
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>Module:{this.cstrName}</Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <p>
                OPEN TWO or MORE instance of /#/test-locksync and observe console
                Try refreshing different instances
              </p>
              <p>{this.state.status}</p>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
} // TestLockSync component

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// default props are expect properties that we expect
/// and are declared for validation
TestLockSync.defaultProps = {
  classes: { isDefaultProps: true }
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// propTypes are declared. Note "vague" propstypes are
/// disallowed by eslint, so use shape({prop: ProtType })
/// to describe them in more detail
TestLockSync.propTypes = {
  classes: PropTypes.shape({})
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// required for UR EXEC phase filtering by view path
TestLockSync.MOD_ID = __dirname;

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(styles)(TestLockSync);
