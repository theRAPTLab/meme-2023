/*//////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import cytoscape from 'cytoscape';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class CytoView extends React.Component {
  constructor(props) {
    super(props);
    //
    this.DB = props.DB;
    console.log(props);
    //
    this.cstrName = this.constructor.name;
    this.refContainer = React.createRef();
    this.container = null; // assigned in componentDidMount
    this.width = null;
    this.height = null;
  }

  componentDidMount() {
    console.log(`<${this.cstrName}> mounted`);
    // save reference elements
    this.container = this.refContainer.current;
    // figure out how big to make the CytoView full screen
    const nav = document.getElementById('nav');
    this.width = window.innerWidth;
    this.height = window.innerHeight - nav.offsetHeight * 2;
    this.container.style.width = `${this.width}px`;
    this.container.style.height = `${this.height}px`;
    //
    console.log(this.DB);
    //
    const cy = cytoscape({
      container: this.container,
      // headless: true
      style: [
        // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            label: 'data(id)'
          }
        },

        {
          selector: 'edge',
          style: {
            width: 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle'
          }
        }
      ],
      zoom: 1,
      pan: { x: 0, y: 0 }
    });
    cy.add(this.DB);
    const layout = cy.layout({
      name: 'grid',
      fit: true
    });
    layout.run();
    window.cy = cy;
    window.p1 = cy.getElementById('p1');
    window.p3 = cy.getElementById('p3');
    window.m1 = cy.getElementById('m1');
    window.m2 = cy.getElementById('m2');
    console.log('edge m1', window.m1);
    console.log('edge m2', window.m2);
    console.log('node p3', window.p3);
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
        ref={this.refContainer}
      />
    );
  }
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// define the property types in detail
CytoView.propTypes = {
  DB: PropTypes.arrayOf(
    PropTypes.shape({
      group: PropTypes.string,
      data: PropTypes.shape({ id: PropTypes.string })
    })
  )
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// defaultProps are used to populate props if they aren't passed in
CytoView.defaultProps = {
  DB: []
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default CytoView;
