/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

WInfo Dialog

Display a general information dialog with a "Close" button.
You can use markdown in the dialog text.

Use a "DIALOG_OPEN" UR call to open the dialog and set the text:

    UR.Publish('DIALOG_OPEN', {
      text: `Hellow World`
    });

Currently only used with adm-data.js.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import './MEMEStyles.css';
import './WInfoDialog.css';

import MDReactComponent from 'react-markdown';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../system/ursys';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'WInfoDialog:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class WInfoDialog extends React.Component {
  constructor(props) {
    super();
    this.DoOpen = this.DoOpen.bind(this);
    this.DoClose = this.DoClose.bind(this);

    this.state = {
      isOpen: false,
      infoText: ``
    };

    UR.Subscribe('DIALOG_OPEN', this.DoOpen);
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubscribe('DIALOG_OPEN', this.DoOpen);
  }

  DoOpen(data) {
    this.setState({
      isOpen: true,
      infoText: data.text
    });
  }

  DoClose() {
    this.setState({ isOpen: false });
  }

  render() {
    const { isOpen, infoText } = this.state;
    return (
      isOpen && (
        <div className="dialog-container">
          <div className="WInfoDialog">
            <MDReactComponent>{infoText}</MDReactComponent>
            <button className="primary" onClick={this.DoClose}>
              Close
            </button>
          </div>
        </div>
      )
    );
  }
}

WInfoDialog.propTypes = {};

WInfoDialog.defaultProps = {};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WInfoDialog;
