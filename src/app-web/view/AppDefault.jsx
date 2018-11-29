const React = require('react');

class AppDefault extends React.Component {
  componentDidMount() {
    console.log('AppDefault mounted');
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
          <p>AppDefault.jsx</p>
          <h4>NetCreate welcomes you</h4>
          <p>This is a work in progress.</p>
        </div>
        <div id="right" style={{ flex: '1 0 auto' }} />
      </div>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = AppDefault;
