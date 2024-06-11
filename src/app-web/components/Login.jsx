/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Login

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
// Material UI Theming
import { withTheme } from 'styled-components';
/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from './MEMEStyles';
import UR from '../../system/ursys';
import ADM from '../modules/data';

/// DEBUG /////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const AUTOBOB = false;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.DoADMDataUpdate = this.DoADMDataUpdate.bind(this);
    this.OnLoginIdChange = this.OnLoginIdChange.bind(this);
    this.OnLoginDialogClose = this.OnLoginDialogClose.bind(this);
    this.OnLogin = this.OnLogin.bind(this);

    // wedge-in an indicator in case we need one
    if (props.memo) {
      this.memo = <p style={{ color: 'maroon' }}>{props.memo}</p>;
    }

    UR.Subscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate);

    this.state = {
      loginId: '',
      loginDialogOpen: true,
      isValidLogin: true
    };
  }

  componentDidMount() {
    this.DoADMDataUpdate();
    if (AUTOBOB) {
      this.setState({ loginId: 'bob-z4in' }, () => {
        this.OnLogin({ preventDefault: function() {} });
      });
    }
  }

  componentWillUnmount() {}

  DoADMDataUpdate() {
    if (ADM.IsLoggedOut()) {
      this.setState({
        loginId: '',
        loginDialogOpen: true
      });
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

  OnLogin(e) {
    e.preventDefault();
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

  OnLoginDialogClose(event, reason) {
    // disableBackdropClick
    if (reason === 'backdropClick') return;
    this.setState({ loginDialogOpen: false });
  }

  render() {
    const { theme: classes } = this.props;
    const { loginId, loginDialogOpen, isValidLogin } = this.state;
    const loginTitle = ADM.IsDBReadOnly() ? 'MEME Login (READ ONLY)' : 'MEME Login';

    return (
      <Dialog
        disableEscapeKeyDown
        open={loginDialogOpen}
        onClose={this.OnLoginDialogClose}
        BackdropProps={{
          classes: {
            root: classes.loginBackdrop
          }
        }}
      >
        <form onSubmit={this.OnLogin}>
          <DialogTitle>{loginTitle}</DialogTitle>
          <DialogContent>
            {this.memo}
            <DialogContentText>Please enter your login token:</DialogContentText>
            <TextField
              autoFocus
              error={!isValidLogin}
              id="loginId"
              label="Token"
              placeholder="NAME-XXXX"
              fullWidth
              value={loginId}
              onChange={this.OnLoginIdChange}
            />
          </DialogContent>
          <DialogActions>
            <Button color="primary" disabled={!isValidLogin} type="submit">
              Login
            </Button>
          </DialogActions>
        </form>
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
export default withTheme(Login);
