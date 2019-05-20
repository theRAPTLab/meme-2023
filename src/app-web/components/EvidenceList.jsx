/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from './MEMEStyles';
import DATA from '../modules/pmc-data';
import UR from '../../system/ursys';
import EvidenceLink from './EvidenceLink';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class EvidenceList extends React.Component {
  constructor(props) {
    super(props);
    this.HandleDataUpdate = this.HandleDataUpdate.bind(this);
    UR.Sub('DATA_UPDATED', this.HandleDataUpdate);
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsub('DATA_UPDATED', this.HandleDataUpdate);
  }

  HandleDataUpdate() {
    // If an EvidenceLink is added we need to update the list.
    this.forceUpdate();
  }

  render() {
    const { classes, rsrcId } = this.props;
    const evLinks = DATA.GetEvLinkByResourceId(rsrcId);
    /*/ evLinks
          is an array of evidence Link objects related to the resource, e.g.
          [
            {evId: "ev1", propId: "food", mechId: "fish:ammonia", rsrcId: "rs1", note: "fish need food"},
            {evId: "ev3", propId: "rotting-food", mechId: "fish:ammonia", rsrcId: "rs1", note: "fish food rots"},
            {evId: "ev4", propId: "ammonia", mechId: "fish:ammonia", rsrcId: "rs1", note: "ammonia causes fish to die"}
          ]
    /*/
    if (evLinks === undefined) return '';

    return (
      <div key={this.props.rsrcId}>
        {evLinks.map((evlink) => (
          <EvidenceLink
            evId={evlink.evId}
            rsrcId={evlink.rsrcId}
            propId={evlink.propId}
            mechId={evlink.mechId}
            note={evlink.note}
            rating={evlink.rating}
            key={evlink.evId}
          />
        ))}
      </div>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(EvidenceList);
