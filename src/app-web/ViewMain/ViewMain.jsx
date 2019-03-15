/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  ViewMain - Main Application View

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';

import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import debounce from 'debounce';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import RoutedView from './RoutedView';
import MEMEStyles from '../components/MEMEStyles';
import { cssblue, cssreact } from '../modules/console-styles';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const DBG = false;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class ViewMain extends React.Component {
  // constructor
  constructor(props) {
    super(props);
    this.displayName = this.constructor.name;
    this.refMain = React.createRef();
    this.refToolbar = React.createRef();
    this.refView = React.createRef();
    this.refDrawer = React.createRef();
    this.state = { viewHeight: 0, viewWidth: 0 };
    this.updateDimensions = this.updateDimensions.bind(this);
  }

  componentDidMount() {
    console.log(`%ccomponentDidMount()`, cssreact);
    //
    this.updateDimensions();
    //
    window.addEventListener('resize', debounce(this.updateDimensions, 500));
    // debug
    window.xmain = this.refMain.current;
    window.xtool = this.refToolbar.current;
    window.xview = this.refView.current;
    window.xdrawer = this.refDrawer.current;
  }

  updateDimensions() {
    /*/
    Material UI uses FlexBox, and our content
    /*/
    setTimeout(() => {
      this.viewRect = this.refMain.current.getBoundingClientRect();
      this.toolRect = this.refToolbar.current.getBoundingClientRect();
      // NOTE: viewWidth/viewHeigg
      const viewWidth = this.viewRect.width;
      const viewHeight = this.viewRect.height - this.toolRect.height;
      const innerWidth = window.innerWidth - MEMEStyles.DRAWER_WIDTH;
      const innerHeight = window.innerHeight - this.toolRect.height;

      this.setState({
        viewWidth: Math.min(viewWidth, innerWidth),
        viewHeight: Math.min(viewHeight, innerHeight)
      });
    }, 150);
  }

  render() {
    const { classes } = this.props;
    if (DBG)
      console.log(`%crender() size ${this.state.viewWidth}x${this.state.viewHeight}`, cssreact);
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" color="inherit" noWrap>
              MEME PROTO
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper
          }}
          anchor="left"
        >
          <div className={classes.toolbar} />
          <Divider />
          <List>
            {['CmdA', 'CmdB', 'CmdC', 'CmdD'].map((text, index) => (
              <ListItem button key={text}>
                <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {['CmdE', 'CmdF', 'CmdG'].map((text, index) => (
              <ListItem button key={text}>
                <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Drawer>
        <main className={classes.content} ref={this.refMain}>
          <div className={classes.toolbar} ref={this.refToolbar} />
          <div
            className={classes.view}
            ref={this.refView}
            style={{ height: this.state.viewHeight }}
          >
            <Switch>
              <Route
                path="/:mode"
                render={props => (
                  <RoutedView
                    {...props}
                    viewHeight={this.state.viewHeight}
                    viewWidth={this.state.viewWidth}
                  />
                )}
              />
              <Route
                path="/"
                render={props => (
                  <RoutedView
                    {...props}
                    viewHeight={this.state.viewHeight}
                    viewWidth={this.state.viewWidth}
                  />
                )}
              />
            </Switch>
          </div>
        </main>
      </div>
    );
  }
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// default props are expect properties that we expect
/// and are declared for validation
ViewMain.defaultProps = {
  classes: {}
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// propTypes are declared. Note "vague" propstypes are
/// disallowed by eslint, so use shape({ prop:ProtType })
/// to describe them in more detail
ViewMain.propTypes = {
  classes: PropTypes.shape({})
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// include MaterialUI styles
export default withStyles(MEMEStyles)(ViewMain);
