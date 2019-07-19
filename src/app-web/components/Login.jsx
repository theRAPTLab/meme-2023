/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Login

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from './MEMEStyles';
import UR from '../../system/ursys';
import ADM from '../modules/adm-data';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.DoADMDataUpdate = this.DoADMDataUpdate.bind(this);
    this.OnLoginDialogClose = this.OnLoginDialogClose.bind(this);
    this.OnLogin = this.OnLogin.bind(this);

    UR.Sub('ADM_DATA_UPDATED', this.DoADMDataUpdate);

    this.state = {
      loginId: '',
      loginDialogOpen: true,
      isInvalidLogin: false
    };
  }

  componentDidMount() {
    this.DoADMDataUpdate();
  }

  componentWillUnmount() { }

  DoADMDataUpdate() {
    if (ADM.IsLoggedOut()) {
      this.setState({
        loginId: '',
        loginDialogOpen: true
      });
    } else {
      this.setState({
        loginId: ADM.GetStudentId(),
        loginDialogOpen: false
      })
    }
  }

  OnLogin() {
    if (ADM.IsValidLogin(this.state.loginId)) {
      this.setState({ isInvalidLogin: false });
      ADM.Login(this.state.loginId);
      this.OnLoginDialogClose();
    } else {
      // invalid login
      this.setState({ isInvalidLogin: true });
    }
  }

  OnLoginDialogClose() {
    this.setState({ loginDialogOpen: false });
  }

  render() {
    const { classes } = this.props;
    const { loginId, loginDialogOpen, isInvalidLogin } = this.state;
    return (
      <Dialog open={loginDialogOpen} onClose={this.OnLoginDialogClose}>
        <DialogTitle>MEME Login</DialogTitle>
        <DialogContent>
          <DialogContentText>Please enter your login token:</DialogContentText>
          <TextField
            autoFocus
            error={isInvalidLogin}
            id="loginId"
            label="Token"
            placeholder="XXX-XXXX-XX"
            fullWidth
            onChange={e => this.setState({ loginId: e.target.value })}
          />
          <DialogContentText hidden={!isInvalidLogin} style={{ color: 'red' }}>
            Bad token. Please try again...
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.OnLogin} color="primary">
            Login
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

Login.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object
};

Login.defaultProps = {
  classes: {}
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(Login);
