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
import { cssblue, cssreact } from '../modules/console-styles';

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
    if (DBG)
      console.log(
        `%cconstructor() state width ${this.props.viewWidth}x${this.props.viewHeight}`,
        cssreact
      );
    // LIFECYCLE: Initialize DataGraph
    DATA.LoadGraph();
  }

  componentDidMount() {
    // LIFECYCLE: Initialize ViewGraph
    PMCView.InitializeViewgraph(this.refContainer.current);
    if (this.props.viewWidth && this.props.viewHeight) {
      this.InputUpdateDraw();
    } else if (DBG) console.log(`%ccomponentDidMount() skip draw`, cssreact);
  }

  componentDidUpdate(prevProps, prevState) {
    let dimChanged = prevProps.viewWidth !== this.viewWidth;
    dimChanged = dimChanged || prevProps.viewHeight !== this.viewHeight;
    if (dimChanged) {
      const prompt = `componentDidUpdate()`;
      if (DBG)
        console.log(`%c${prompt} props ${this.props.viewWidth} ${this.props.viewHeight}`, cssreact);
      this.InputUpdateDraw();
    }
  }

  InputUpdateDraw() {
    // LIFECYCLE: CheckInputs
    PMCView.UpdateComponentLists();
    // LIFECYCLE: Update
    PMCView.UpdateComponents({ w: this.props.viewWidth, h: this.props.viewHeight });
    // LIFECYCLE: Draw
    PMCView.DrawComponents();
  }

  render() {
    if (DBG)
      console.log(`%crender() props ${this.props.viewWidth}x${this.props.viewHeight}`, cssreact);
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
