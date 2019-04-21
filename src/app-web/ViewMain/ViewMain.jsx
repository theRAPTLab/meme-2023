/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  ViewMain - Main Application View

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { Switch, Route } from 'react-router-dom';
// Material UI Elements
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
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import AddIcon from '@material-ui/icons/Add';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import RoutedView from './RoutedView';
import MEMEStyles from '../components/MEMEStyles';
import UR from '../../system/ursys';
import DATA from '../modules/pmc-data';
import { cssblue, cssreact, cssdraw } from '../modules/console-styles';

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
    this.UpdateDimensions = this.UpdateDimensions.bind(this);
    this.handleAddProp = this.handleAddProp.bind(this);
    this.handleAddPropCreate = this.handleAddPropCreate.bind(this);
    this.handleAddPropClose = this.handleAddPropClose.bind(this);
    this.handleAddEdge = this.handleAddEdge.bind(this);
    this.handleAddEdgeCreate = this.handleAddEdgeCreate.bind(this);
    this.handleAddEdgeClose = this.handleAddEdgeClose.bind(this);
    UR.Sub('WINDOW:SIZE', this.UpdateDimensions);
    this.state = {
      addPropOpen: false,
      addEdgeOpen: false,
      edgeSource: 'Source',
      edgeTarget: 'Target',
    }
  }

  componentDidMount() {
    console.log(`%ccomponentDidMount()`, cssreact);
    //
    // child components need to know the dimensions
    // of this component, but they are invalid until
    // the root component renders in SystemInit.
    // SystemInit fires `WINDOW:SIZE` to force the
    // relayout
  }

  UpdateDimensions() {
    /*/
    NOTE: Material UI uses FlexBox
    we can insert a CSSGRID into here eventually
    /*/
    if (DBG) {
      console.clear();
      console.info('WINDOW RESIZE');
    }
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
  }

  handleAddProp() {
    console.log('Add!');
    this.setState({ addPropOpen: true });
  }

  handleAddPropCreate() {
    console.log('create');
    let label = document.getElementById('propLabel').value;
    DATA.PMC_add(label);
    this.handleAddPropClose();
  }

  handleAddPropClose() {
    console.log('close');
    this.setState({ addPropOpen: false });
  }

  handleAddEdge() {
    console.log('Add!');
    this.setState({ addEdgeOpen: true });
  }

  handleAddEdgeCreate() {
    console.log('create');
    let label = document.getElementById('propLabel').value;
    DATA.PMC_add(label);
    this.handleAddPropClose();
  }

  handleAddEdgeClose() {
    console.log('close');
    this.setState({ addEdgeOpen: false });
  }

  handleSetEdgeSource() {
    console.log('handleSetEdgeSource');
    UR.Sub('WINDOW:SIZE', this.UpdateDimensions);

  }

  handleSetEdgeTarget() {
    console.log('handleSetEdgeTarget');
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
          <Fab color="primary" aria-label="Add" className={classes.fab} onClick={this.handleAddProp}><AddIcon /></Fab>
          <Dialog
            open={this.state.addPropOpen}
            onClose={this.handleAddPropClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">Add Component/Property</DialogTitle>
            <DialogContent>
              <DialogContentText>Type a name for your component or property.</DialogContentText>
              <TextField autoFocus margin="dense" id="propLabel" label="Label" fullWidth />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleAddPropClose} color="primary">Cancel</Button>
              <Button onClick={this.handleAddPropCreate} color="primary">Create</Button>
            </DialogActions>
          </Dialog>
          <Divider />
          <List>
            {['CmdA', 'CmdB', 'CmdC', 'CmdD'].map((text, index) => (
              <ListItem button key={text}>
                <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
          <Fab color="primary" aria-label="Add" className={ClassNames(classes.fab, classes.edgeButton)} onClick={this.handleAddEdge}><AddIcon /></Fab>
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
          <Drawer
            variant='persistent'
            anchor='bottom'
            open={this.state.addEdgeOpen}
            onClose={this.handleAddEdgeClose}
          >
            <div className={classes.edgeDrawerContainer}>
              <div className="classes.drawerHeader">Add Links</div>
              <ol>
                <li>Click on 'Source' button then select your source node.</li>
                <li>Click on 'Target' button then select your target node.</li>
                <li>Type in a label for your edge (optional).</li>
                <li>Then click 'Create'.</li>
              </ol>
              <div className={classes.edgeDrawerInput}>
                <Fab color="primary" aria-label="Add Source" className={ClassNames(classes.fab, classes.edgeButton)} onClick={this.handleSetEdgeSource}>{this.state.edgeSource}</Fab>
                <TextField autoFocus margin="dense" id="edgeLabel" label="Label" className={classes.textField} />
                <Fab color="primary" aria-label="Add Target" className={ClassNames(classes.fab, classes.edgeButton)} onClick={this.handleSetEdgeTarget}>{this.state.edgeTarget}</Fab>
              </div>
              <DialogActions>
                <Button onClick={this.handleAddEdgeClose} color="primary">Cancel</Button>
                <Button onClick={this.handleAddEdgeCreate} color="primary">Create</Button>
              </DialogActions>
            </div>
          </Drawer>
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
