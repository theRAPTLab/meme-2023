/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  TestRoot

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import UR from '../../../system/ursys';
import NETTEST from './network-tests';

/// CSS IMPORTS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

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
class ViewTest extends React.Component {
  // constructor
  constructor(props) {
    super(props);
    UR.ReloadOnViewChange();
    this.cstrName = this.constructor.name;
    this.feature = undefined;
    this.AddTestResult = this.AddTestResult.bind(this);
    this.state = {
      tests: []
    }
    this._mounted = false;
    this.queuedResults = [];
    // test
    this.AddTestResult("root constructed");
    this.Test(props.match.params.feature || '<no test selected>');
  }

  componentDidMount() {
    console.log(`<${this.cstrName}> mounted`);
    this._mounted = true;
    this.AddTestResult("componentDidMount");
    this.Test();
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  Test(feature) {
    // construction time
    if (!this.feature) {
      if (!feature) {
        alert(`ERROR: test requires 'match.params.feature' passed to it on construct`);
        return;
      }
      this.feature = feature;
      switch (this.feature) {
        case 'ur':
          NETTEST.DoConstructionTests(this);
          break;
        default:
      }
      return;
    }
    // after construction, this.feature is set
    switch (this.feature) {
      case 'ur':
        NETTEST.DoMountTests(this);
        break;
      default:
        console.log('no matching test run for', this.feature);
    }
  }

  AddTestResult(name, error) {
    const status = error === undefined ? 'OK' : error;
    this.queuedResults.push({ name, status });
    if (this._mounted) this.setState({ tests: this.queuedResults });
  }

  render() {
    const { classes } = this.props;
    NETTEST.DoRenderTests();
    return (
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>test: {this.feature}</Paper>
          </Grid>
          {this.state.tests.map((test, i) => {
            const bgcolor = (test.status === 'OK') ? 'limegreen' : 'red';
            return (
              <Grid item xs={4} key={i}>
                <Paper className={classes.paper} style={{ backgroundColor: bgcolor }}>{test.name} = {test.status}</Paper>
              </Grid>
            )
          })}
        </Grid>
      </div>
    );
  }
} // ViewTest component

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// default props are expect properties that we expect
/// and are declared for validation
ViewTest.defaultProps = {
  classes: { isDefaultProps: true }
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// propTypes are declared. Note "vague" propstypes are
/// disallowed by eslint, so use shape({prop: ProtType })
/// to describe them in more detail
ViewTest.propTypes = {
  classes: PropTypes.shape({})
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// required for UR EXEC phase filtering by view path
ViewTest.URMOD = __dirname;
UR.EXEC.Hook(
  'INITIALIZE',
  () => {
    console.log('TestRoot Init');
  },
  __dirname
);

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(styles)(ViewTest);
