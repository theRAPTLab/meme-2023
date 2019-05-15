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
import Avatar from '@material-ui/core/Avatar';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import Modal from '@material-ui/core/Modal';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
// Material UI Icons
import AddIcon from '@material-ui/icons/Add';
import DescriptionIcon from '@material-ui/icons/Description';
import ImageIcon from '@material-ui/icons/Image';
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
import EvidenceList from '../components/EvidenceList';
import ResourceItem from '../components/ResourceItem';
import { cssblue, cssreact, cssdraw } from '../modules/console-styles';
import { data } from '@svgdotjs/svg.js/src/modules/optional/data';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const PKG = 'ViewMain:';

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
    this.handleAddPropOpen = this.handleAddPropOpen.bind(this);
    this.handleAddPropClose = this.handleAddPropClose.bind(this);
    this.handleAddPropCreate = this.handleAddPropCreate.bind(this);
    this.handleAddEdge = this.handleAddEdge.bind(this);
    this.handleAddEdgeCreate = this.handleAddEdgeCreate.bind(this);
    this.handleAddEdgeClose = this.handleAddEdgeClose.bind(this);
    this.handleResourceClick = this.handleResourceClick.bind(this);
    this.handleInformationViewClose = this.handleInformationViewClose.bind(this);
    this.handleEvLinkSourceSelectRequest = this.handleEvLinkSourceSelectRequest.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleSnapshot = this.handleSnapshot.bind(this);
    UR.Sub('WINDOW:SIZE', this.UpdateDimensions);
    UR.Sub('SHOW_RESOURCE', this.handleResourceClick);
    UR.Sub('SELECTION_CHANGED', this.handleSelectionChange);
    UR.Sub('REQUEST_SELECT_EVLINK_SOURCE', this.handleEvLinkSourceSelectRequest);
    this.state = {
      viewHeight: 0, // need to init this to prevent error with first render of informationList
      addPropOpen: false,
      addEdgeOpen: false,
      resourceViewOpen: false,
      edgeSource: '',
      edgeTarget: '',
      selectedResource: {
        id: '',
        evid: '',
        label: 'Unselected',
        notes: [],
        type: '',
        url: '',
        links: -1
      }
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

  componentWillUnmount() {
    UR.Unsub('WINDOW:SIZE', this.UpdateDimensions);
    UR.Unsub('SHOW_RESOURCE', this.handleResourceClick);
    UR.Unsub('SELECTION_CHANGED', this.handleSelectionChange);
    UR.Unsub('REQUEST_SELECT_EVLINK_SOURCE', this.handleEvLinkSourceSelectRequest);
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

  handleAddPropOpen() {
    if (DBG) console.log('Add!');
    this.setState({ addPropOpen: true });
  }

  handleAddPropClose() {
    if (DBG) console.log('close');
    this.setState({ addPropOpen: false });
  }

  handleAddPropCreate() {
    if (DBG) console.log('create prop');
    let label = document.getElementById('propLabel').value;
    DATA.PMC_AddProp(label);
    this.handleAddPropClose();
  }


  handleAddEdge() {
    if (DBG) console.log('Add!');
    // clear the label first
    document.getElementById('edgeLabel').value = '';
    this.setState({ addEdgeOpen: true });
  }

  handleAddEdgeCreate() {
    if (DBG) console.log('create edge');
    let label = document.getElementById('edgeLabel').value;
    DATA.PMC_AddMech(this.state.edgeSource, this.state.edgeTarget, label);
    this.handleAddEdgeClose();
  }

  handleAddEdgeClose() {
    if (DBG) console.log('close');
    this.setState({ addEdgeOpen: false });
  }

  handleSetEdgeSource() {
    if (DBG) console.log('handleSetEdgeSource');
    UR.Sub('WINDOW:SIZE', this.UpdateDimensions);

  }

  handleSetEdgeTarget() {
    if (DBG) console.log('handleSetEdgeTarget');
  }

  handleResourceClick(urdata) {
    if (DBG) console.log('ViewMain: clicked on ', urdata.rsrcId);
    // Look up resource
    let selectedResource = DATA.Resource(urdata.rsrcId);
    if (selectedResource) {
      this.setState({
        resourceViewOpen: true,
        selectedResource
      });
    } else {
      console.error('ViewMain: Could not find selected resource id', urdata.rsrcId);
    }
  }

  handleInformationViewClose() {
    this.setState({ resourceViewOpen: false });
  }

  /*/
   *  User wants to set the source on an EvidenceLink
   *  So close the ResourceView if open,
   *  and then show and expand the evidence
  /*/
  handleEvLinkSourceSelectRequest(urdata) {
    this.setState({ resourceViewOpen: false }, () => {
      UR.Publish('UNEXPAND_ALL_RESOURCES');
      UR.Publish('SHOW_EVIDENCE_LINK', { evId: urdata.evId, rsrcId: urdata.rsrcId });
      UR.Publish('SET_EVIDENCE_LINK_WAIT_FOR_SOURCE_SELECT', {
        evId: urdata.evId,
        rsrcId: urdata.rsrcId
      });
    });
  }

  handleSelectionChange() {
    let selectedPropIds = DATA.VM_SelectedProps();
    if (DBG) console.log('selection changed', selectedPropIds);
    let sourceId = '';
    let targetId = '';
    if (selectedPropIds.length > 0) {
      sourceId = selectedPropIds[0];
    }
    if (selectedPropIds.length > 1) {
      targetId = selectedPropIds[1];
    }
    this.setState({
      edgeSource: sourceId,
      edgeTarget: targetId
    });
  }

  handleSnapshot(rsrcId) {
    if (DBG) console.log(PKG, 'create new evidence:', rsrcId);
    let evId = DATA.PMC_AddEvidenceLink(rsrcId);
    UR.Publish('SHOW_EVIDENCE_LINK', { evId, rsrcId });
  }

  render() {
    const { classes } = this.props;
    const resources = DATA.AllResources();
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
          <Tooltip title="Add Component or Property">
            <Fab
              color="primary"
              aria-label="Add"
              className={classes.fab}
              onClick={this.handleAddPropOpen}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
          <Typography align="center" variant="caption">Add Component / Property</Typography>
          <br />
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
              <Button onClick={this.handleAddPropClose} color="primary">
                Cancel
              </Button>
              <Button onClick={this.handleAddPropCreate} color="primary">
                Create
              </Button>
            </DialogActions>
          </Dialog>
          
          <Divider />
          {/*
            <List>
              {['CmdA', 'CmdB', 'CmdC', 'CmdD'].map((text, index) => (
                <ListItem button key={text}>
                  <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                  <ListItemText primary={text} />
                </ListItem>
              ))}
            </List>
          */}
          <Tooltip title="Add Link">
            <Fab
              color="primary"
              aria-label="Add"
              className={ClassNames(classes.fab, classes.edgeButton)}
              onClick={this.handleAddEdge}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
          <Typography align="center" variant="caption">Add Mechanism</Typography>
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

          {/* Add Edge Dialog */}
          <Card className={classes.edgeDialog} hidden={!this.state.addEdgeOpen}>
            <Paper className={classes.edgeDialogPaper}>
              <div className={classes.edgeDialogWindowLabel}>ADD LINKS</div>
              <div className={classes.edgeDialogInput}>
                {this.state.edgeSource !== '' ? (
                  <div className={classes.evidenceLinkSourcePropAvatarSelected}>
                    {this.state.edgeSource}
                  </div>
                ) : (
                  <div className={classes.evidenceLinkSourceAvatarWaiting}>1. Click on a source...</div>
                )}
                &nbsp;
                <TextField
                  autoFocus
                  placeholder="link label"
                  margin="dense"
                  id="edgeLabel"
                  label="Label"
                  className={classes.edgeDialogTextField}
                />
                &nbsp;
                {this.state.edgeTarget !== '' ? (
                  <div className={classes.evidenceLinkSourcePropAvatarSelected}>
                    {this.state.edgeTarget}
                  </div>
                ) : (
                  <div className={classes.evidenceLinkSourceAvatarWaiting}>
                    2. Click on a target...
                  </div>
                )}
                <div style={{ flexGrow: '1' }} />
                <Button onClick={this.handleAddEdgeClose} color="primary">
                  Cancel
                </Button>
                <Button onClick={this.handleAddEdgeCreate} color="primary" variant="contained">
                  Create
                </Button>
              </div>
            </Paper>
          </Card>

        </main>

        {/* Resource Library */}
        <div style={{ height: this.state.viewHeight + 64, overflowY: 'scroll', zIndex: 1250 }}>
          <Paper className={classes.informationList}>
            <div className={classes.resourceListLabel}>RESOURCE LIBRARY</div>
            <List dense>
              {resources.map(resource => (
                <ResourceItem key={resource.rsrcId} resource={resource} />
              ))}
            </List>
          </Paper>
        </div>

        {/* Resource View */}
        <Modal
          className={classes.resourceView}
          disableBackdropClick={false}
          hideBackdrop={false}
          open={this.state.resourceViewOpen}
          onClose={this.handleInformationViewClose}
        >
          <Paper className={classes.resourceViewPaper}>
            <div className={classes.resourceViewTitle}>
              <div className={classes.resourceViewWindowLabel}>RESOURCE VIEW</div>
              <Avatar className={classes.resourceViewAvatar}>
                {this.state.selectedResource.referenceLabel}
              </Avatar>
              &nbsp;
              <div style={{ flexGrow: 1 }}>{this.state.selectedResource.label}</div>
              <Card className={classes.resourceViewCard}>
                <CardContent className={classes.resourceViewCardContent}>
                  <Typography variant="overline">Notes:&nbsp;</Typography>
                  <Typography variant="body2">{this.state.selectedResource.notes}</Typography>
                </CardContent>
              </Card>
              <Card className={classes.resourceViewCard}>
                <CardContent className={classes.resourceViewCardContent}>
                  <Typography variant="overline">Type:&nbsp;</Typography>
                  <Typography variant="body2">
                    {this.state.selectedResource.type}{' '}
                    {this.state.selectedResource.type === 'simulation' ? (
                      <ImageIcon />
                    ) : (
                      <DescriptionIcon />
                    )}
                  </Typography>
                </CardContent>
              </Card>
              <Card className={classes.resourceViewCard}>
                <CardContent className={classes.resourceViewCardContent}>
                  <Typography variant="overline">Links:&nbsp;</Typography>
                  <Chip
                    className={classes.resourceViewLinksBadge}
                    label={this.state.selectedResource.links}
                    color="primary"
                  />
                </CardContent>
              </Card>
              <Button
                className={classes.evidenceCloseBtn}
                onClick={this.handleInformationViewClose}
                color="primary"
              >
                Close
              </Button>
            </div>
            <iframe
              src={this.state.selectedResource.url}
              width="1000"
              height="90%"
              title="resource"
            />
            <div className={classes.resourceViewSidebar}>
              <TextField
                id="informationNote"
                label="Our Notes"
                placeholder="We noticed..."
                multiline
                rows="5"
                className={classes.resourceViewNote}
                margin="normal"
                variant="outlined"
              />
              <Typography variant="caption">OUR EVIDENCE LIST</Typography>
              <div className={classes.resourceViewSidebarEvidenceList}>
                <EvidenceList rsrcId={this.state.selectedResource.rsrcId} />
              </div>
              <Button
                className={classes.resourceViewCreatebutton}
                variant="contained"
                onClick={() => this.handleSnapshot(this.state.selectedResource.rsrcId)}
                color="primary"
              >
                Create Evidence
                </Button>
            </div>
          </Paper>
        </Modal>
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
