/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Animated icon that shows:
- ">>" when "right"
- "<<" when "left"

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import './ICNExpandDoubleArrow.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons';
const IcnRights = <FontAwesomeIcon icon={faAnglesRight} />;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class ICNExpandDoubleArrow extends React.Component {
  render() {
    const { direction } = this.props;
    return (
      <div
        className={`ICNExpandDoubleArrow ${direction === 'right' ? `right` : 'left'}`}
      >
        {IcnRights}
      </div>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default ICNExpandDoubleArrow;
