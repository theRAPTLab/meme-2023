/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  WAdmDownload - Administrator Data Download Component

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import ADM from '../../../modules/data';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class WAdmDownload extends React.Component {
  onDownloadAllJSON(e) {
    e.preventDefault();
    ADM.DownloadDatabase();
  }

  onDownloadAllModelsJSON(e) {
    e.preventDefault();
    ADM.DownloadModels();
  }

  render() {
    return (
      <div
        className="WAdmDownload"
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '10px',
          marginTop: '20px',
          padding: '10px',
          borderTop: '1px solid #ccc'
        }}
      >
        <button
          className="btn btn-primary"
          onClick={e => this.onDownloadAllModelsJSON(e)}
        >
          Download All Data by Model (JSON)
        </button>
        <button className="btn btn-primary" onClick={e => this.onDownloadAllJSON(e)}>
          Download All Data (JSON)
        </button>
      </div>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WAdmDownload;
