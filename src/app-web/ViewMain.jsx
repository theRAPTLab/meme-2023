// react
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
// material ui
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Menu from '@material-ui/core/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
// our components
import Canvas from './components/Canvas';
import SVG from './components/SVG';

// material ui theming
const styles = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    height: 140,
    width: 100
  },
  control: {
    padding: theme.spacing.unit * 2
  }
});

class ViewMain extends React.Component {
  // constructor
  constructor(props) {
    super(props);
    this.cstrName = this.constructor.name;
    this.state = Object.assign(
      {},
      // local logic
      { isOpen: true, hasError: false },
      // theminng
      {
        spacing: '16'
      }
    );
  }

  static getDerivedStateFromError(error) {
    console.error(`${this.constructor.name} error`, error);
    return { hasError: true };
  }

  componentDidMount() {
    console.log(`<${this.cstrName}> mounted`);
  }

  render() {
    return (
      <div
        style={{
          display: 'flex',
          flexFlow: 'row nowrap',
          width: '100%',
          height: '100%'
        }}
      >
        <div id="left" style={{ flex: '1 0 auto' }} />
        <div id="middle" style={{ flex: '3 0 auto' }}>
          <h2>&lt;{this.cstrName}&gt;</h2>
        </div>
        <div id="right" style={{ flex: '1 0 auto' }} />
      </div>
    );
  }
}

// default props are expect properties that we expect
// and are declared for validation
ViewMain.defaultProps = {
  classes: {}
};
// propTypeds are declared. Note "vague" propstypes are
// disallowed by eslint, so use shape({ prop:ProtType })
// to describe them in more detail
ViewMain.propTypes = {
  classes: PropTypes.shape({})
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default ViewMain;
