/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

WDisclosure is a generic component used to expand and collapse a list of items
with a disclosure triangle.

  <WDisclosure title="Entities" items={items} />

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import './MEMEStyles.css';
import './WDisclosure.css';

import ICNExpandSingleArrow from './ICNExpandSingleArrow';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class WDisclosure extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: true
    };
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  evt_ToggleExpand = () => {
    const { isExpanded } = this.state;
    this.setState({ isExpanded: !isExpanded });
  };
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  render() {
    const { title, items } = this.props;
    const { isExpanded } = this.state;
    return (
      <div className="WDisclosure">
        <div className="triangle" onClick={this.evt_ToggleExpand}>
          <ICNExpandSingleArrow expanded={isExpanded} />
          &nbsp;&nbsp;
          {title}
        </div>
        <div className="items">{isExpanded && items}</div>
      </div>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WDisclosure;
