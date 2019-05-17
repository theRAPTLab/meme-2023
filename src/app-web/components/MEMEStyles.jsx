import { indigo, orange, red, teal, yellow } from "@material-ui/core/colors";
import { registerMorphableType } from "@svgdotjs/svg.js/src/main";
import { Hidden } from "@material-ui/core";

const m_drawerWidth = 100;
const m_edgeDialogWidth = 750;
const m_systemTextColor = '#999';
const styles = theme => {
  return {
    root: {
      display: 'flex'
    },
    appBar: {
      width: `calc(100% - ${m_drawerWidth}px)`,
      marginLeft: m_drawerWidth
    },
    drawer: {
      width: m_drawerWidth,
      flexShrink: 0,
      height: '100vh'
    },
    drawerPaper: {
      width: m_drawerWidth
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
    fab: {
      margin: theme.spacing.unit * 2
    },
    projectTitle: {
      color: '#fff'
    },
    edgeButton: {
      backgroundColor: orange[500],
      '&:hover': { backgroundColor: orange[700] }
    },
    edgeDialog: {
      width: m_edgeDialogWidth
    },
    edgeDialogWindowLabel: {
      fontSize: '0.6em',
      color: m_systemTextColor,
      marginBottom: '-10px',
      marginTop: '-1em'
    },
    edgeDialogTextField: {
      color: orange[500]
    },
    edgeDialogPaper: {
      margin: `1em 10em 1em ${m_drawerWidth}px`,
      padding: '1em',
      width: m_edgeDialogWidth,
      position: 'absolute',
      bottom: 0
    },
    edgeDialogInput: {
      display: 'flex',
      height: '3em',
      alignItems: 'baseline'
    },
    informationList: {
      width: 300,
      backgroundColor: teal[50],
      zIndex: 1250  // above drawer, below modal
    },
    resourceListLabel: {
      fontSize: '0.8em',
      color: m_systemTextColor,
      marginBottom: '5px',
      padding: '3px 5px'
    },
    resourceView: {
      marginTop: '1em',
      width: '100%',
      height: '100%'
    },
    resourceViewPaper: {
      width: '95%',
      height: '95%',
      margin: '0 auto',
      padding: '1em',
      backgroundColor: teal[50]
    },
    resourceViewWindowLabel: {
      fontSize: '0.8em',
      color: m_systemTextColor,
      marginBottom: '5px',
      marginRight: theme.spacing.unit * 2,
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
      marginRight: theme.spacing.unit
    },
    resourceViewLabel: {
      paddingLeft: '0',
      maxWidth: '170px',
      maxHeight: '4em',
      overflow: 'hidden'
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
      width: '265px',
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
      width: '40px',
      minWidth: '40px',
      height: '50px',
      padding: '0',
    },
    resourceViewNote: {
      width: '100%',
      marginTop: '0.35em',
      backgroundColor: yellow[50]
    },
    resourceViewCreatebutton: {
      marginBottom: theme.spacing.unit,
      width: '100%'
    },
    evidenceTitle: {
      fontSize: '1em',
      fontWeight: 'normal',
      display: 'flex'
    },
    evidenceWindowLabel: {
      fontSize: '0.6em',
      color: m_systemTextColor,
      marginBottom: '5px'
    },
    evidenceLabelField: {
      flexGrow: '1',
      fontSize: '0.9em',
      lineHeight: '1em',
      height: '30px',
      margin: '0 0 15px 10px',
      overflowY: 'auto'
    },
    evidenceLabelFieldExpanded: {
      height: 'auto'
    },
    evidenceExpandButton: {
      width: '40px',
      minWidth: '40px',
      height: '50px',
      padding: '0',
      float: 'right'
    },
    evidencePrompt: {
      fontSize: '0.8em',
      lineHeight: '1.1em',
      fontStyle: 'italic',
      margin: '15px 0',
      color: '#999'
    },
    evidenceScreenshot: {
      width: '50px',
      margin: '10px 0'
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
      width: '230px',
      height: '70px',
      margin: '0 auto',
      padding: '10px 0 10px 10px',
      backgroundColor: yellow[50]
    },
    evidenceLinkPaperExpanded: {
      height: 'auto',
      backgroundColor: yellow[200]
    },
    iconExpanded: {
      transform: 'rotate(180deg)'
    },
    evidenceLinkAvatar: {
      maxWidth: '50px',
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
      padding: '0 7px',
      color: red['A700'],
      backgroundColor: red['100']
    },
    evidenceLinkSelectButton: {
      height: '25px',
      minWidth: '25px', // override material default min-width 60
      fontSize: '0.8em',
      color: '#fff',
      backgroundColor: red['A700']
    },
    evidenceLinkSourcePropAvatarSelected: {
      color: indigo[900],
      backgroundColor: indigo[100],
      padding: '0 7px'
    },
    evidenceLinkSourceMechAvatarSelected: {
      color: orange[900],
      backgroundColor: orange[100],
      padding: '0 7px'      
    },
    badge: {
      margin: '8px'
    }
  };
};
styles.DRAWER_WIDTH = m_drawerWidth;

export default styles;
