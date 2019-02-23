/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  ViewBasic - Basic Starter Layout

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';

/// CSS IMPORTS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import 'bootstrap/dist/css/bootstrap.css';

/// DEBUG CONTROL /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class ViewBasic extends React.Component {
  // constructor
  constructor(props) {
    super(props);
    this.cstrName = this.constructor.name;
  }

  static getDerivedStateFromError(error) {
    console.error(`${this.constructor.name} error`, error);
    return { hasError: true };
  }

  componentDidMount() {
    console.log(`<${this.cstrName}> mounted`);
  }

  render() {
    return (
      <div
        style={{
          display: 'flex',
          flexFlow: 'row nowrap',
          width: '100%',
          height: '100%'
        }}
      >
        <div id="left" style={{ flex: '1 0 auto' }} />
        <div id="middle" style={{ flex: '3 0 auto' }}>
          <h2>&lt;{this.cstrName}&gt;</h2>
          <ul>
            <li>basic flex layout</li>
            <li>left:1, middle:3, right:1</li>
          </ul>
        </div>
        <div id="right" style={{ flex: '1 0 auto' }} />
      </div>
    );
  }
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// default props are expect properties that we expect
/// and are declared for validation
ViewBasic.defaultProps = {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// propTypes are declared. Note "vague" propstypes are
/// disallowed by eslint, so use shape({ prop:ProtType })
/// to describe them in more detail
ViewBasic.propTypes = {};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default ViewBasic;
