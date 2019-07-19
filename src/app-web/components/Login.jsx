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
    this.OnLoginIdChange = this.OnLoginIdChange.bind(this);
    this.OnLoginDialogClose = this.OnLoginDialogClose.bind(this);
    this.OnLogin = this.OnLogin.bind(this);

    UR.Sub('ADM_DATA_UPDATED', this.DoADMDataUpdate);

    this.state = {
      loginId: '',
      loginDialogOpen: true,
      isValidLogin: true
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
        loginId: ADM.GetSelectedStudentId(),
        loginDialogOpen: false
      })
    }
  }

  OnLoginIdChange(e) {
    const loginId = e.target.value;
    let isValidLogin = ADM.IsValidLogin(loginId);
    this.setState({
      loginId,
      isValidLogin
    });
  }

  OnLogin() {
    if (ADM.IsValidLogin(this.state.loginId)) {
      this.setState({ isValidLogin: true });
      ADM.Login(this.state.loginId);
      this.OnLoginDialogClose();
    } else {
      // invalid login
      this.setState({
        isValidLogin: false
      });
    }
  }

  OnLoginDialogClose() {
    this.setState({ loginDialogOpen: false });
  }

  render() {
    const { classes } = this.props;
    const { loginId, loginDialogOpen, isValidLogin } = this.state;
    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        open={loginDialogOpen}
        onClose={this.OnLoginDialogClose}
      >
        <DialogTitle>MEME Login</DialogTitle>
        <DialogContent>
          <DialogContentText>Please enter your login token:</DialogContentText>
          <TextField
            autoFocus
            error={!isValidLogin}
            id="loginId"
            label="Token"
            placeholder="XXX-XXXX-XX"
            fullWidth
            value={loginId}
            onChange={this.OnLoginIdChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.OnLogin} color="primary" disabled={!isValidLogin}>
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
