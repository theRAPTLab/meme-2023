/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Screenshot Viewer

Display the screenshot and allow user to change it.

This uses react-draggable to make the help window draggable.
https://github.com/mzabriskie/react-draggable

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import './MEMEStyles.css';
import './WScreenshotView.css';
import Draggable from 'react-draggable';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../system/ursys';
import DATA from '../modules/data';
import { Dropzone } from './Dropzone';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'WScreenshotView:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class WScreenshotView extends React.Component {
  constructor(props) {
    super(props);
    this.DoOpen = this.DoOpen.bind(this);
    this.DoClearScreenshot = this.DoClearScreenshot.bind(this);
    this.OnDrop = this.OnDrop.bind(this);
    this.DoClose = this.DoClose.bind(this);

    this.state = {
      isOpen: false
    };

    UR.Subscribe('SCREENSHOT_OPEN', this.DoOpen);
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubscribe('SCREENSHOT_OPEN', this.DoOpen);
  }

  DoOpen(data) {
    this.setState({
      evId: data.evId,
      imageURL: data.imageURL,
      isOpen: true
    });
    this.setState({});
  }

  DoClearScreenshot() {
    this.OnDrop(null);
  }

  OnDrop(href) {
    DATA.PMC_EvidenceUpdate(this.state.evId, { imageURL: href });
    this.setState({
      imageURL: href
    });
  }

  DoClose() {
    this.setState({ isOpen: false });
  }

  render() {
    const { imageURL, isOpen } = this.state;

    return (
      isOpen && (
        <Draggable>
          <div className="dialog-container">
            <div className="WScreenshotView">
              <div className="screenshot">
                {imageURL === undefined || imageURL === null ? (
                  <Dropzone onDrop={this.OnDrop} />
                ) : (
                  <img src={imageURL} alt="screenshot" />
                )}
              </div>
              <div className="controlbar">
                <button
                  onClick={this.DoClearScreenshot}
                  hidden={imageURL === undefined || imageURL === null}
                >
                  Clear Screenshot
                </button>
                <button onClick={this.DoClose}>Close</button>
              </div>
            </div>
          </div>
        </Draggable>
      )
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WScreenshotView;
