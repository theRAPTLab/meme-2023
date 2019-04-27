/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from '../components/MEMEStyles';
import DATA from '../modules/pmc-data';
import EvidenceLink from '../components/EvidenceLink';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class EvidenceList extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() { }

  render() {
    const { classes, rsrcId } = this.props;
    const evidenceLinkIds = DATA.EvidenceLinksByResourceId(rsrcId);
    if (evidenceLinkIds === undefined) return '';

    let evidenceLinkList = [];
    evidenceLinkIds.forEach(propId => {
      let evidenceLinks = DATA.PropEvidence(propId);
      let relatedEvidenceLinks = evidenceLinks.filter(evlink => evlink.rsrcId === rsrcId);
      evidenceLinkList.push(relatedEvidenceLinks);
    });

    // evidenceLinkList is an array of arrays because there might be more than one?!?
    console.log('evidenceLinkList is', evidenceLinkList);
    return (
      <div key={this.props.rsrcId}>
        {evidenceLinkList.map((evidenceLinks, index) => (
          <EvidenceLink evidenceLinks={evidenceLinks} key={index}/>
        ))}
      </div>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(EvidenceList);
