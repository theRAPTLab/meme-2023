/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Animated icon that shows:
- "v" when expanded
- "^" when collapsed

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import './ICNExpandSingleArrow.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
const IcnDown = <FontAwesomeIcon icon={faAngleDown} />;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class ICNExpandSingleArrow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { expanded } = this.props;
    return (
      <div className={`ICNExpandSingleArrow ${expanded ? `expanded` : 'collapsed'}`}>
        {IcnDown}
      </div>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default ICNExpandSingleArrow;
