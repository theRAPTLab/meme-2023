/*//////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

should be a child of RoutedView

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import SVG from 'svg.js';

const DBG = false;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class SVGView extends React.Component {
  constructor(props) {
    super(props);
    //
    this.cstrName = this.constructor.name;
    this.refContainer = React.createRef();
    this.Draw = null; // assigned in componentDidMount
    console.log(
      `${this.cstrName}.constructor() state width ${this.props.viewWidth}x${this.props.viewHeight}`
    );
  }

  componentDidMount() {
    // this view is assumed to be passed the size of its containing div
    console.log(`${this.cstrName}.componentDidMount()`);
    // create SVG element attached to refContainer
    this.Draw = SVG(this.refContainer.current);
    this.DrawTestScene();
  }

  componentDidUpdate(prevProps, prevState) {
    let dimChanged = prevProps.viewWidth !== this.viewWidth;
    dimChanged = dimChanged || prevProps.viewHeight !== this.viewHeight;
    if (dimChanged) {
      if (!this.Draw) {
        console.warn(`$this.cstrName.componentDidUpdate() ERROR this.Draw not definedf`);
        return;
      }
      const prompt = `${this.cstrName}.componentDidUpdate()`;
      console.log(
        `%c${prompt} props ${this.props.viewWidth} ${this.props.viewHeight}`,
        `color:blue`
      );
      this.DrawTestScene(this.props.viewWidth, this.props.viewHeight);
    }
  }

  DrawTestScene(width = 100, height = 100) {
    this.Draw.clear();
    const pad = 25;
    const ww = width - pad - pad;
    const hh = height - pad - pad;
    console.log(`%cdrawing ${ww} ${hh}`, 'color:green');
    const rect = this.Draw.rect(width - pad - pad, height - pad - pad).attr({ fill: '#f06' });
    rect.move(pad, pad);
  }

  render() {
    if (DBG.dimensions)
      console.log(
        `${this.cstrName}.render() props ${this.props.viewWidth}x${this.props.viewHeight}`
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
