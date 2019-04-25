/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
// Material UI Elements
import Avatar from '@material-ui/core/Avatar';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from '../components/MEMEStyles';
import DATA from '../modules/pmc-data';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class EvidenceList extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() { }

  render() {
    const { classes, rid } = this.props;
    const evidenceLinkIds = DATA.EvidenceProps(rid);
    if (evidenceLinkIds === undefined) return '';

    let evidenceLinkList = [];
    evidenceLinkIds.forEach(propId => {
      let evidenceLinks = DATA.PropEvidence(propId);
      let relatedEvidenceLinks = evidenceLinks.filter(evlink => evlink.rid === rid);
      evidenceLinkList.push(relatedEvidenceLinks);
    });

    // evidenceLinkList is an array of arrays because there might be more than one?!?
    console.log('evidenceLinkList is', evidenceLinkList);
    return (
      <div key={this.props.rid}>
        {evidenceLinkList.map((evidenceLink, index) => (
          <Paper className={classes.evidenceLinkPaper} key={`${evidenceLink[0].rid}${index}`}>
            <div className={classes.evidenceTitle}>
              <TextField
                value={evidenceLink[0].note}
                InputProps={{
                  readOnly: true
                }}
              />
              <Avatar className={classes.evidenceLinkPropAvatar}>{evidenceLink[0].pid}</Avatar>&nbsp;
            </div>
          </Paper>
        ))}
      </div>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(EvidenceList);
