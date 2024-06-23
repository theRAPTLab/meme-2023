/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  MEPanelResources -- Right sidebar in Main Application View

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import './MEMEStyles.css';
import './MEPanelResources.css';

import EVResourceItem from './EVResourceItem';

import ICNExpandDoubleArrow from './ICNExpandDoubleArrow';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class MEPanelResource extends React.Component {
  render() {
    const { toggleOpen, resources } = this.props;
    return (
      <div className="MEPanelResources">
        <div className="appbar">
          Evidence Library
          <button onClick={toggleOpen}>
            <ICNExpandDoubleArrow direction="right" />
          </button>
        </div>
        <div className="list">
          {resources.map(resource => (
            <EVResourceItem key={resource.id} resource={resource} />
          ))}
        </div>
      </div>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default MEPanelResource;
