import {
  blue,
  green,
  grey,
  indigo,
  orange,
  purple,
  red,
  teal,
  yellow
} from '@material-ui/core/colors';
import { registerMorphableType } from '@svgdotjs/svg.js/src/main';
import { Hidden } from '@material-ui/core';
import DEFAULTS from '../modules/defaults';

const { COLOR } = DEFAULTS;

const m_drawerWidth = 110;
const m_navbarHeight = 40;
const m_primary = indigo[500];
const m_selectedColor = indigo[800];
const m_evidenceColor = teal[100];
const m_stickynoteColor = yellow[400]; //`#ffe25a`;
const m_stickynoteIconColor = COLOR.STICKY_BUTTON; // '#ffd700'; // yellow[800]; // `#ffc904`;
const m_systemTextColor = 'rgba(0,0,0,0.35)';
const m_systemLabelFontSize = '0.6em';
const m_systemLabelTextColor = 'rgba(0,0,0,0.25)';
const m_resourceListWidth = 300;
const m_evlinkButtonExpandedWidth = 170;
const m_zResourceList = 1250;
const m_zSticky = 1500;
const m_zHelp = 1600;

const styles = theme => {
  return {
    btnSuperSmall: {
      fontSize: '0.6rem',
      color: 'rgba(0,0,255,0.5)'
    },
    oneEmBefore: {
      marginTop: '1em'
    },
    root: {
      display: 'flex'
    },
    loginBackdrop: {
      backgroundColor: m_primary
    },
    appBar: {
      height: `${m_navbarHeight}px`,
      width: `calc(100% - ${m_drawerWidth}px)`,
      left: m_drawerWidth
    },
    appBarToolsPanelClosedShift: {
      width: '100%'
    },
    appBarToolbar: {
      minHeight: `${m_navbarHeight}px`,
      paddingLeft: '0',
      paddingRight: '0'
    },
    appBarRight: {
      display: 'inline-flex',
      flexGrow: 1,
      justifyContent: 'flex-end',
      marginRight: m_resourceListWidth
    },
    appBarRightExpanded: {
      display: 'inline-flex',
      flexGrow: 1,
      justifyContent: 'flex-end',
      marginRight: 0
    },
    drawer: {
      width: m_drawerWidth,
      flexShrink: 0,
      height: '100vh'
    },
    drawerPaper: {
      width: m_drawerWidth,
      overflow: 'hidden',
      alignItems: 'center'
    },
    drawerAppBar: {
      position: 'fixed',
      height: `${m_navbarHeight}px`,
      paddingTop: '3px',
      fontSize: '0.8em',
      color: m_systemTextColor,
      zIndex: m_zResourceList + 1
    },
    toolsPanelClosedShift: {
      marginLeft: -m_drawerWidth
    },
    toolbar: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
      padding: 0
    },
    view: {
      flex: 1,
      backgroundColor: '#f0f0ff'
    },
    projectTitle: {
      backgroundColor: 'transparent'
    },
    primaryProjectTitle: {
      color: '#fff',
      backgroundColor: 'transparent'
    },
    toolsPanelAppBar: {
      width: m_drawerWidth,
      backgroundColor: 'white'
    },
    toolsPanelList: {
      width: m_drawerWidth,
      marginTop: `${m_navbarHeight}px`,
      overflowY: 'auto'
    },
    toolsPanelGroup: {
      width: '100%',
      padding: '5px 0 10px 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    treeView: {
      width: '100%'
    },
    treeItem: {
      margin: '0 0 2px -24px',
      padding: '2px 0',
      fontSize: '10px',
      borderRadius: '2px',
      overflow: 'hidden',
      wordBreak: 'break-all',
      cursor: 'pointer'
    },
    treeItemSelected: {},
    treePropItemColor: {
      color: COLOR.PROP,
      backgroundColor: COLOR.PROP_TOOLSPANEL_BG // necessary to trigger hover brightness filter
    },
    treeOutcomeItemColor: {
      color: COLOR.OUTCOME,
      backgroundColor: COLOR.OUTCOME_TOOLSPANEL_BG // necessary to trigger hover brightness filter
    },
    treeSubPropItem: {
      margin: '0 0 0 0.5em',
      fontSize: '10px',
      fontStyle: 'italic',
      backgroundColor: 'inherit' // necessary to trigger hover brightness filter
    },
    treeMechItem: {
      color: COLOR.MECH,
      backgroundColor: COLOR.MECH_TOOLSPANEL_BG
    },
    treeItemHovered: {
      filter: 'brightness(90%) saturate(200%)'
    },
    edgeDialogWindowLabel: {
      fontSize: '1em',
      color: m_systemTextColor
    },
    edgeDialogTextField: {
      color: orange[500],
      width: '150px',
      margin: '0'
    },
    edgeDialogDescriptionField: {
      color: orange[500],
      width: '65%',
      margin: '0'
    },
    edgeDialogPaper: {
      margin: `1em 10em 1em ${m_drawerWidth}px`,
      padding: '1em',
      position: 'absolute',
      bottom: 0,
      left: '10px',
      right: '180px'
    },
    edgeDialogInput: {
      display: 'flex',
      height: '3em',
      marginTop: '1em',
      alignItems: 'center'
    },
    resourceList: {
      height: '100%',
      width: m_resourceListWidth,
      overflowX: 'hidden',
      overflowY: 'visible',
      backgroundColor: teal[50],
      zIndex: m_zResourceList // above drawer, below modal
    },
    resourceListAppBar: {
      width: m_resourceListWidth,
      backgroundColor: teal[100]
    },
    resourceListList: {
      height: '100%',
      overflowY: 'visible',
      backgroundColor: teal[50],
      marginTop: `${m_navbarHeight}px`,
      paddingTop: '0'
    },
    resourceView: {
      marginTop: '1em',
      width: '100%',
      height: '100%'
    },
    resourceViewPaper: {
      position: 'absolute',
      width: '99%',
      height: '95%',
      zIndex: '1300',
      top: '5px',
      left: '5px',
      margin: '0 auto',
      padding: '1em',
      backgroundColor: teal[50]
    },
    resourceViewWindowLabel: {
      fontSize: '0.8em',
      color: m_systemTextColor,
      marginBottom: '5px',
      marginRight: theme.spacing(2),
      alignSelf: 'flex-start'
    },
    resourceViewTitle: {
      fontSize: '1em',
      fontWeight: 'normal',
      display: 'flex',
      height: '60px',
      paddingBottom: '10px',
      alignItems: 'center'
    },
    resourceViewAvatar: {
      color: '#366',
      backgroundColor: teal[100],
      marginRight: theme.spacing(1)
    },
    resourceViewLabel: {
      paddingLeft: '0',
      maxWidth: '170px',
      maxHeight: '4em',
      overflow: 'hidden'
    },
    resourceViewEvList: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      backgroundColor: teal[300]
    },
    resourceViewCard: {
      height: '50px',
      minWidth: '150px'
    },
    resourceViewCardContent: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'baseline',
      padding: '10px 16px'
    },
    resourceViewLinksBadge: {
      width: '18px',
      height: '18px'
    },
    resourceViewSidebar: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '320px',
      height: '90%',
      paddingLeft: '10px',
      verticalAlign: 'top',
      overflow: 'hidden'
    },
    resourceViewSidebarEvidenceList: {
      display: 'inline-flex',
      backgroundColor: '#c7d7d6',
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '5px',
      verticalAlign: 'top',
      overflowY: 'scroll',
      overflowX: 'hidden'
    },
    resourceExpandButton: {
      width: '25px',
      minWidth: '25px',
      height: '50px',
      padding: '0'
    },
    resourceViewNote: {
      width: '100%',
      marginTop: '0.35em',
      backgroundColor: yellow[50]
    },
    resourceViewCreatebutton: {
      marginBottom: theme.spacing(1),
      width: '100%'
    },
    resourceItem: {
      borderTop: '1px solid rgba(0,0,0,0.25)'
    },
    evidenceBody: {
      fontSize: '1em',
      fontWeight: 'normal',
      display: 'flex'
    },
    evidenceBodyRow: {
      marginTop: '0.25em',
      alignItems: 'center'
    },
    evidenceBodyRowCollapsed: {
      height: '31px',
      marginTop: '0px',
      marginBottom: '2px',
      alignItems: 'baseline'
    },
    evidenceBodyRatingCollapsed: {
      position: 'relative',
      top: '-45px',
      left: '200px'
    },
    evidenceBodyRowCentered: {
      marginTop: '0.25em',
      alignItems: 'center'
    },
    evidenceBodyRowTop: {
      marginTop: '0.25em',
      alignItems: 'top'
    },
    evidenceBodyNumber: {
      backgroundColor: teal[300],
      width: '25px',
      height: '25px',
      fontSize: '12px',
      marginTop: '10px'
    },
    evidenceWindowLabelGrid: {
      alignSelf: 'flex-start'
    },
    evidenceWindowLabel: {
      fontSize: m_systemLabelFontSize,
      color: m_systemTextColor,
      marginBottom: '5px'
    },
    evidenceLabelField: {
      flexGrow: '1',
      fontSize: '0.9em',
      lineHeight: '1em',
      marginTop: '3px',
      maxHeight: '2em',
      maxWidth: '195px',
      overflow: 'hidden'
    },
    evidenceLabelFieldExpanded: {
      height: 'auto',
      maxHeight: 'max-content',
      width: `${m_evlinkButtonExpandedWidth}px`,
      overflowY: 'auto',
      margin: '0'
    },
    evidenceExpandButton: {
      width: '40px',
      minWidth: '40px',
      height: '20px',
      marginTop: '-5px',
      padding: '0',
      float: 'right'
    },
    evidencePrompt: {
      fontSize: '0.8em',
      lineHeight: '1.1em',
      fontStyle: 'italic',
      margin: '15px 0 5px 0',
      color: m_systemTextColor
    },
    evidenceScreenshotButton: {
      padding: 0,
      justifyContent: 'left'
    },
    evidenceScreenshot: {
      width: '90%',
      margin: '0'
    },
    evidenceScreenshotStatus: {
      paddingTop: '3px',
      fontSize: '0.7em',
      lineHeight: '1.1em',
      fontStyle: 'italic',
      color: m_systemTextColor
    },
    evidenceBadge: {
      height: '16px',
      width: '16px',
      fontSize: '0.8em',
      fontWeight: 'bold'
    },
    evidenceCloseBtn: {
      flexPosition: ''
    },
    evidenceLink: {
      width: 400,
      margin: '50% auto'
    },
    evidenceLinkPaper: {
      width: '290px',
      margin: '1px auto 1px 0',
      padding: '1px 0 10px 10px',
      backgroundColor: m_evidenceColor,
      cursor: 'pointer'
    },
    evidenceLinkPaperHover: {
      backgroundColor: teal[200]
    },
    evidenceLinkPaperExpanded: {
      height: 'auto',
      padding: '10px 0 10px 10px',
      backgroundColor: '#bce8e4'
    },
    evidenceLinkPaperEditting: {
      backgroundColor: '#dbfaf7'
    },
    lessIconCollapsed: {
      transition: 'transform 0.25s ease-in-out',
      transform: 'rotate(0deg)'
    },
    lessIconExpanded: {
      transition: 'transform 0.25s ease-in-out',
      transform: 'rotate(180deg)'
    },
    evidenceLinkAvatar: {
      minWidth: '50px',
      height: '25px',
      fontSize: '0.8em',
      justifyContent: 'left',
      overflow: 'hidden',
      textOverflow: 'clip',
      whiteSpace: 'nowrap',
      lineHeight: '1.8em',
      boxSizing: 'content-box'
    },
    evidenceLinkSourceAvatarWaiting: {
      color: red.A700,
      backgroundColor: red[100]
    },
    evidenceLinkSelectButton: {
      color: '#fff',
      backgroundColor: red[700]
    },
    evidenceLinkSelectButtonExpanded: {
      width: `${m_evlinkButtonExpandedWidth}px`
    },
    evidenceLinkSelectButtonLabel: {
      maxWidth: '140px',
      textOverflow: 'ellipsis',
      overflow: 'hidden'
    },
    evidenceLinkSourcePropAvatarSelected: {
      color: '#fff',
      backgroundColor: COLOR.PROP
    },
    evidenceLinkSourcePropAvatarDisabled: {
      backgroundColor: COLOR.PROP_LINK
    },
    evidenceLinkSourceOutcomeAvatarSelected: {
      color: '#fff',
      backgroundColor: COLOR.OUTCOME
    },
    evidenceLinkSourceOutcomeAvatarDisabled: {
      backgroundColor: COLOR.OUTCOME_LINK
    },
    evidenceLinkSourceMechAvatarSelected: {
      color: '#fff',
      backgroundColor: COLOR.MECH
    },
    evidenceLinkSourceMechAvatarDisabled: {
      backgroundColor: COLOR.MECH_LINK
    },
    ratingIconSelected: {
      color: yellow[800]
    },
    ratingIconUnselected: {
      color: 'rgba(0,0,0,0.1)'
    },
    ratingButtonLarge: {
      minWidth: '50px',
      padding: '0'
    },
    ratingButtonSmall: {
      minWidth: '24px',
      padding: '0'
    },
    ratingIconNegative: {
      color: red[600]
    },
    ratingIconNeutral: {
      color: grey[600]
    },
    ratingIconPositive: {
      color: green[600]
    },
    badge: {
      margin: '8px'
    },
    admPaper: {
      margin: '0 auto',
      padding: '1em'
    },
    admTeacherSelector: {
      minWidth: '100%'
    },
    admResourceListPaper: {
      margin: '0 auto',
      padding: '1em',
      backgroundColor: teal[50]
    },
    stickynotePaper: {
      backgroundColor: m_stickynoteColor,
      position: 'absolute',
      top: '200px',
      left: '300px',
      zIndex: m_zSticky
    },
    stickynoteCard: {
      backgroundColor: 'rgba(255,255,0,0.5)',
      margin: '5px',
      padding: '5px 10px',
      width: '425px'
    },
    stickynoteCardRead: {
      color: m_systemTextColor,
      backgroundColor: m_stickynoteColor,
      margin: '5px',
      padding: '5px 10px',
      width: '425px'
    },
    stickynoteIcon: {
      color: m_stickynoteIconColor
    },
    stickynoteIconOpen: {
      color: m_selectedColor
    },
    stickynoteCardAuthor: {
      alignItems: 'baseline',
      flexGrow: '1',
      color: m_systemTextColor,
      lineHeight: '1.1em',
      marginRight: '1em'
    },
    stickynoteCardEditBtn: {
      padding: 0
    },
    stickynoteCardInput: {
      // See boilerplate/src/app-web/components/StickyNoteCard.jsx for local style overrides
      width: '100%',
      overflow: 'hidden' // hide scrollbar
    },
    criteriaSelectorMenu: {
      fontSize: '0.9em',
      padding: '2px 4px'
    },
    stickynoteCardLabel: {
      fontSize: '14px', // match Typograophy subitlte2
      color: m_systemLabelTextColor,
      display: 'inline-flex',
      lineHeight: '1.1em'
    },
    stickynoteCardCriteria: {
      fontSize: '14px', // match Typograophy subitlte2
      display: 'inline-flex',
      cursor: 'default'
    },
    stickynoteCardCriteriaDescription: {
      color: '#000',
      marginBottom: '0.66em'
    },
    helpViewPaper: {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      width: '300px',
      height: '90%',
      top: '5%',
      right: m_resourceListWidth,
      zIndex: m_zHelp,
      padding: '10px 0 0 10px',
      backgroundColor: 'rgba(255,243,211,0.9)'
    },
    helpViewText: {
      display: 'block', // override default MDReactComponent <span>
      padding: '10px 0 5px 0',
      fontSize: '11px'
    },
    screenshotViewPaper: {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      top: '5%',
      left: '5%',
      bottom: '5%',
      right: '5%',
      zIndex: m_zHelp,
      padding: '10px',
      backgroundColor: m_evidenceColor
    },
    screenshotViewScreenshot: {
      objectFit: 'contain',
      width: '100%',
      height: '100%',
      margin: '0'
    },
    descriptionLabel: {
      fontSize: m_systemLabelFontSize,
      marginBottom: '0.5em',
      textTransform: 'uppercase'
    },
    descriptionViewPaper: {
      position: 'absolute',
      bottom: '10px',
      right: '10px',
      width: '305px',
      zIndex: m_zResourceList,
      padding: '15px 15px 0 15px',
      color: 'white'
    },
    descriptionViewPaperPropColor: {
      backgroundColor: COLOR.PROP
    },
    descriptionViewPaperOutcomeColor: {
      backgroundColor: COLOR.OUTCOME
    },
    descriptionViewPaperMechColor: {
      backgroundColor: COLOR.MECH
    },
    descriptionViewText: {
      display: 'block', // override default MDReactComponent <span>
      padding: '0'
    }
  };
};
styles.DRAWER_WIDTH = m_drawerWidth;

export default styles;
