/*//////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

should be a child of RoutedView

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';

import SVG from '@svgdotjs/svg.js/src/svg';
import '@svgdotjs/svg.draggable.js';
import GraphLib from '@dagrejs/graphlib';
import { PMCView, DATA } from '../modules/pmc-viewgraph';
import { cssinfo, cssdraw } from '../modules/console-styles';

const DBG = true;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class SVGView extends React.Component {
  //
  constructor(props) {
    super(props);
    this.displayName = this.constructor.name;
    //
    this.refContainer = React.createRef();
    this.Draw = null; // assigned in componentDidMount
    if (DBG)
      console.log(
        `${this.displayName}.constructor() state width ${this.props.viewWidth}x${
          this.props.viewHeight
        }`
      );

    DATA.LoadGraph();
  }

  componentDidMount() {
    // create SVG element attached to refContainer
    PMCView.MountSVG(this.refContainer.current);
    if (this.props.viewWidth && this.props.viewHeight) PMCView.DrawTestScene();
    else if (DBG) console.log(`${this.displayName}.componentDidMount() skip draw on first mount`);
  }

  componentDidUpdate(prevProps, prevState) {
    let dimChanged = prevProps.viewWidth !== this.viewWidth;
    dimChanged = dimChanged || prevProps.viewHeight !== this.viewHeight;
    if (dimChanged) {
      const prompt = `${this.displayName}.componentDidUpdate()`;
      if (DBG)
        console.log(
          `%c${prompt} props ${this.props.viewWidth} ${this.props.viewHeight}`,
          `color:blue`
        );
      PMCView.DrawSystemDiagram(this.props.viewWidth, this.props.viewHeight);
    }
  }

  render() {
    if (DBG)
      console.log(
        `${this.displayName}.render() props ${this.props.viewWidth}x${this.props.viewHeight}`
      );
    // returns a root svg that is the PARENT of the SVGJS-created draw surface
    return (
      <svg ref={this.refContainer} width={this.props.viewWidth} height={this.props.viewHeight} />
    );
  }
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// define the property types in detail
SVGView.propTypes = {
  viewWidth: PropTypes.number,
  viewHeight: PropTypes.number
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// defaultProps are used to populate props if they aren't passed in
SVGView.defaultProps = {
  viewWidth: 300,
  viewHeight: 300
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SVGView;
