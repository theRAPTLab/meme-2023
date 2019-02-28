/*//////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class SVG extends React.Component {
  constructor(props) {
    super(props);
    //
    this.cstrName = this.constructor.name;
    this.refContainer = React.createRef();
    this.svg = null; // assigned in componentDidMount
    this.width = null;
    this.height = null;
  }

  componentDidMount() {
    console.log(`<${this.cstrName}> mounted`);
    // save reference elements
    this.svg = this.refContainer.current;
    // figure out how big to make the SVG full screen
    const nav = document.getElementById('nav');
    this.width = window.innerWidth;
    this.height = window.innerHeight - nav.offsetHeight;
    //
    console.log(`${this.cstrName}: settign size to ${this.width},${this.height}`);
    this.svg.style.width = `${this.width}px`;
    this.svg.style.height = `${this.height}px`;
    //
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '25%');
    circle.setAttribute('cy', '25%');
    circle.setAttribute('r', '50');
    circle.setAttribute('fill', '#ff0000');
    this.svg.appendChild(circle);
  }

  render() {
    return (
      <svg ref={this.refContainer}>
        <circle cx="50%" cy="50%" r="150" fill="#0000FF" />
      </svg>
    );
  }
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// define the property types in detail
SVG.propTypes = {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// defaultProps are used to populate props if they aren't passed in
SVG.defaultProps = {};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SVG;
