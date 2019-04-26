/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import ClassNames from 'classnames';
// Material UI Elements
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from '../components/MEMEStyles';
import DATA from '../modules/pmc-data';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class EvidenceLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      canBeEdited: false,
      isBeingEdited: false,
      isDisplayedInInformationList: true,
      isExpanded: false
    };

    this.toggleExpanded = this.toggleExpanded.bind(this);
  }

  componentDidMount() { }

  toggleExpanded() {
    console.log('paper clicked');
    this.setState({
      isExpanded: !this.state.isExpanded
    })
  };

  render() {
    const { evidenceLink, classes } = this.props;
    return (
      <Paper className={ClassNames(
          classes.evidenceLinkPaper,
          this.state.isExpanded ? classes.evidenceLinkPaperExpanded : ''
        )}
        key={`${evidenceLink[0].rid}`}
      >
        <div className={classes.evidencePrompt} hidden={!this.state.isExpanded}>How does this resource support this component / property / mechanism?</div>
        <div className={classes.evidenceTitle}>
          {!this.state.isDisplayedInInformationList ?
            <Avatar className={classes.evidenceAvatar}>{evidenceLink[0].rid}</Avatar> :
            ''
          }
          <div className={classes.evidenceLinkPropAvatar}>{DATA.Prop(evidenceLink[0].pid).name}</div>&nbsp;
          <TextField
            className={classes.evidenceLabelField}
            value={evidenceLink[0].note}
            InputProps={{
              readOnly: true
            }}
          />
          <IconButton onClick={this.toggleExpanded}><ExpandMoreIcon /></IconButton>
        </div>
        <img src="../static/screenshot_sim.png" className={classes.evidenceScreenshot} hidden={!this.state.isExpanded} />
      </Paper>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(EvidenceLink);
