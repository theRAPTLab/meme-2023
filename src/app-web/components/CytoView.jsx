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
    this.cstrName = this.constructor.name;
    //
    this.DB = props.DB;
    this.container = null;
    this.refContainer = React.createRef();
  }

  componentDidMount() {
    console.log(`<${this.cstrName}> mounted`);
    this.container = this.refContainer.current;
    const cy = cytoscape({
      container: this.container,
      // headless: true
      style: [
        // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': 'rgb(64,128,255)',
            label: 'data(name)'
          }
        },
        {
          selector: '$node > node',
          style: {
            'background-color': 'rgb(128,192,255)',
            label: 'data(name)'
          }
        },
        {
          selector: 'edge',
          style: {
            width: 5,
            'curve-style': 'unbundled-bezier',
            'control-point-distances': [40, -40],
            'control-point-weights': [0.25, 0.75],
            'line-style': 'dashed',
            'line-dash-pattern': [6, 3],
            label: 'data(name)',

            'line-color': 'rgb(255,128,64)',
            'target-arrow-color': 'rgb(255,128,64)',
            'target-arrow-shape': 'triangle'
          }
        }
      ],
      zoom: 1
    });
    cy.add(this.DB);
    this.cy = cy;
    console.log('%ccomponentDidMount:%c complete', 'color:orange', 'color:auto');
  }

  componentDidUpdate() {
    if (this.cy) {
      console.log(
        `%ccomponentDidUpdate:%c cy ok ${this.props.viewWidth}`,
        'color:orange',
        'color:auto'
      );
      setTimeout(() => {
        const layout = this.cy.layout({
          name: 'grid',
          avoidOverlap: true,
          fit: true
        });
        layout.run();
        this.cy.center();
      }, 250);
    } else {
      console.log('%ccomponentDidUpdate:%c cy nope', 'color:orange', 'color:auto');
    }
  }

  render() {
    return (
      <div
        ref={this.refContainer}
        style={{ height: this.props.viewHeight, width: this.props.viewWidth }}
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
  ),
  viewWidth: PropTypes.number,
  viewHeight: PropTypes.number
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// defaultProps are used to populate props if they aren't passed in
CytoView.defaultProps = {
  DB: [],
  viewWidth: 0,
  viewHeight: 0
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default CytoView;
