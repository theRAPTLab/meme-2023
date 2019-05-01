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
import UR from '../../system/ursys';
import EvidenceLink from '../components/EvidenceLink';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class EvidenceList extends React.Component {
  constructor(props) {
    super(props);
    this.handleDataUpdate = this.handleDataUpdate.bind(this);
    UR.Sub('DATA_UPDATED', this.handleDataUpdate);
  }

  componentDidMount() { }

  handleDataUpdate() {
    // Reload -- This is necessary to handle evlink.note updates as a controlled component.
    this.forceUpdate();
  }

  componentWillUnmount() {
    UR.Unsub('DATA_UPDATED', this.handleDataUpdate);
  };
  
  render() {
    const { classes, rsrcId } = this.props;
    const evLinks = DATA.GetEvLinkByResourceId(rsrcId);
    /*/ evLinks
          is an array of evidence Link objects related to the resource
          [
            {evId: "1", propId: "food", rsrcId: "1", note: "fish need food"},
            {evId: "3", propId: "rotting-food", rsrcId: "1", note: "fish food rots"},
            {evId: "4", propId: "ammonia", rsrcId: "1", note: "ammonia causes fish to die"}
          ]
    /*/
    if (evLinks === undefined) return '';

    return (
      <div key={this.props.rsrcId}>
        {evLinks.map((evlink, index) => (
          <EvidenceLink evId={evlink.evId} rsrcId={evlink.rsrcId} propId={evlink.propId} mechId={evlink.mechId} note={evlink.note} key={index}/>
        ))}
      </div>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(EvidenceList);
