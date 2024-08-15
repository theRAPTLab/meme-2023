/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

EVList displays a list of EVLinks items.
It is used in EVResourceItem and EVResourceItemDialog

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import './MEMEStyles.css';
import './EVList.css';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import DATA from '../modules/data';
import UR from '../../system/ursys';
import EVLink from './EVLink';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class EVList extends React.Component {
  constructor(props) {
    super(props);
    this.HandleDataUpdate = this.HandleDataUpdate.bind(this);
    UR.Subscribe('DATA_UPDATED', this.HandleDataUpdate);
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubscribe('DATA_UPDATED', this.HandleDataUpdate);
  }

  HandleDataUpdate() {
    // If an EvidenceLink is added we need to update the list.
    this.forceUpdate();
  }

  render() {
    const { rsrcId } = this.props;
    const evLinks = DATA.GetEvLinksByResourceId(rsrcId);
    if (evLinks === undefined) return '';
    // evLinks [ { id: <pmcid> propId: mechId: rsrcId: note: }, ... ]
    return (
      <div key={rsrcId} className="EVList">
        {evLinks.map((evlink, index) => (
          <EVLink evlink={evlink} key={index} />
        ))}
      </div>
    );
  }
}

EVList.propTypes = {
  rsrcId: PropTypes.number
};

EVList.defaultProps = {
  rsrcId: ''
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default EVList;
