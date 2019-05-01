import { indigo, orange, red, teal, yellow } from "@material-ui/core/colors";
import { registerMorphableType } from "@svgdotjs/svg.js/src/main";
import { Hidden } from "@material-ui/core";

const m_drawerWidth = 150;
const m_edgeDialogWidth = 600;
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
    edgeButton: {
      backgroundColor: orange[500],
      '&:hover': { backgroundColor: orange[700] }
    },
    edgeDialog: {
      width: m_edgeDialogWidth
    },
    edgePaper: {
      margin: `1em 10em 1em ${m_drawerWidth}px`,
      padding: '1em',
      width: m_edgeDialogWidth,
      position: 'absolute',
      bottom: 0
    },
    edgeDrawerInput: {
      display: 'flex'
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
    informationView: {
      marginTop: '1em',
      width: '100%',
      height: '100%'
    },
    informationViewPaper: {
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
    resourceViewCard: {
      height: '50px'
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
      verticalAlign: 'top',
      overflowY: 'scroll',
      overflowX: 'hidden'
    },
    resourceViewNote: {
      width: '237px',
      marginTop: '0.5em',
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
      backgroundColor: yellow[50]
    },
    resourceViewCreatebutton: {
      marginBottom: theme.spacing.unit,
      width: 'fit-content'
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
      flexGrow: '1'
    },
    evidenceExpandButton: {
      width: '20px',
      height: '20px'
    },
    evidencePrompt: {
      fontSize: '0.8em',
      color: '#999'
    },
    evidenceScreenshot: {
      width: '30%'
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
      width: '95%',
      margin: '0 auto',
      padding: '10px 0 10px 10px',
      backgroundColor: yellow[50]
    },
    evidenceLinkPaperExpanded: {
      backgroundColor: yellow[200]
    },
    evidenceLinkPropAvatar: {
      maxWidth: '50px',
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
      color: '#fff',
      backgroundColor: red['A700']
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
