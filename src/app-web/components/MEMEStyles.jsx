const m_drawerWidth = 150;
import { orange } from "@material-ui/core/colors";

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
    edgeDrawerContainer: {
      width: `600px`,
      margin: '1em 10em 1em 10em'
    },
    edgeDrawerInput: {
      display: 'flex'
    }
  };
};
styles.DRAWER_WIDTH = m_drawerWidth;

export default styles;
