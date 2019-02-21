/*//////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const React = require('react');
const D3 = require('d3');

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class SVG extends React.Component {
  constructor(props) {
    super(props);
    this.refSVG = React.createRef();

    this.viewBox = [
      window.innerWidth / -2,
      window.innerHeight / -2,
      window.innerWidth,
      window.innerHeight
    ];
  }

  componentDidMount() {
    // save reference elements
    this.svg = this.refSVG.current;
    // execute D3
    const square = D3.selectAll('rect');
    square.style('fill', 'orange');
  }

  render() {
    return (
      <svg
        id="aliens-go-home-canvas"
        ref={this.refSVG}
        preserveAspectRatio="xMaxYMax"
        viewBox={this.viewBox}
        style={{ width: '100%', border: '1px solid black' }}
      >
        <circle cx={0} cy={0} r={50} />
        <rect x="20" y="20" width="20px" height="20" rx="5" ry="5" />
        <rect x="60" y="20" width="20px" height="20" rx="5" ry="5" />
        <rect x="100" y="20" width="20px" height="20" rx="5" ry="5" />
      </svg>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = SVG;
