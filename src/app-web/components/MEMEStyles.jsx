import { orange, teal, yellow } from "@material-ui/core/colors";

const m_drawerWidth = 150;
const m_edgeDialogWidth = 600;
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
      zIndex: 1250  // above drawer, below modal
    },
    informationView: {
      marginTop: '1em',
      width: '100%',
      height: '100%'
    },
    informationNote: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit
    },
    informationViewPaper: {
      width: '95%',
      height: '95%',
      margin: '0 auto',
      padding: '1em'
    },
    evidenceTitle: {
      fontSize: '1.4em',
      fontWeight: 'bold',
      display: 'flex'
    },
    evidenceAvatar: {
      backgroundColor: teal[100]
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
      padding: '1em',
      backgroundColor: yellow[100]
    },
    badge: {
      margin: '8px'
    }
  };
};
styles.DRAWER_WIDTH = m_drawerWidth;

export default styles;
