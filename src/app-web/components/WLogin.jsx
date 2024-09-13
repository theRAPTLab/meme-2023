/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Login

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import './MEMEStyles.css';
import './WLogin.css';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../system/ursys';
import ADM from '../modules/data';

/// DEBUG /////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const AUTOBOB = false;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class WLogin extends React.Component {
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
      isValidLogin: false
    };
  }

  componentDidMount() {
    this.DoADMDataUpdate();
    if (AUTOBOB) {
      this.setState({ loginId: 'bob-z4in' }, () => {
        this.OnLogin({ preventDefault: function () {} });
      });
    }
  }

  componentWillUnmount() {}

  DoADMDataUpdate() {
    const { loginId } = this.state;
    if (ADM.IsLoggedOut()) {
      this.setState({
        loginId, // keep the loginId in case another user is updating data
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
      this.setState({ isValidLogin: true }, () => {
        ADM.Login(this.state.loginId).then(() => {
          this.OnLoginDialogClose();
        });
      });
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
    const { loginId, loginDialogOpen, isValidLogin } = this.state;
    const loginTitle = ADM.IsDBReadOnly() ? 'MEME Login (READ ONLY)' : 'MEME Login';

    if (!loginDialogOpen) {
      return '';
    } else {
      return (
        <div className="screen">
          <form onSubmit={this.OnLogin}>
            <div className="WLogin dialog">
              <h1>{loginTitle}</h1>
              {this.memo && <div className="dialog-text">{this.memo}</div>}
              <div className="help">Please enter your login token:</div>
              <input
                autoFocus
                id="loginId"
                className={isValidLogin ? 'valid' : 'invalid'}
                placeholder="NAME-XXXX"
                value={loginId}
                onChange={this.OnLoginIdChange}
              />
              <button
                className="primary"
                disabled={!isValidLogin}
                type="submit"
                onClick={this.OnLogin}
              >
                Login
              </button>
            </div>
          </form>
        </div>
      );
    }
  }
}

WLogin.propTypes = {};

WLogin.defaultProps = {};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WLogin;
