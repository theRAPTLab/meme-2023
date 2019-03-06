/*//////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

should be a child of RoutedView

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import SVG from '@svgdotjs/svg.js/src/svg';
import '@svgdotjs/svg.draggable.js';

const DBG = false;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class SVGView extends React.Component {
  //
  constructor(props) {
    super(props);
    //
    this.cstrName = this.constructor.name;
    this.refContainer = React.createRef();
    this.Draw = null; // assigned in componentDidMount
    if (DBG)
      console.log(
        `${this.cstrName}.constructor() state width ${this.props.viewWidth}x${
          this.props.viewHeight
        }`
      );
  }

  componentDidMount() {
    // create SVG element attached to refContainer
    this.Draw = SVG(this.refContainer.current);
    if (this.props.viewWidth && this.props.viewHeight) this.DrawTestScene();
    else if (DBG) console.log(`${this.cstrName}.componentDidMount() skip draw on first mount`);
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
      if (DBG)
        console.log(
          `%c${prompt} props ${this.props.viewWidth} ${this.props.viewHeight}`,
          `color:blue`
        );
      this.DrawSystemDiagram(this.props.viewWidth, this.props.viewHeight);
    }
  }

  DrawTestScene(w, h) {
    const width = w || this.props.viewWidth;
    const height = h || this.props.viewHeight;
    const pad = 25;
    const ww = width - pad - pad;
    const hh = height - pad - pad;
    //
    console.log(`%cdrawing ${ww} ${hh}`, 'color:green');
    //
    this.Draw.clear();
    const rect = this.Draw.rect(ww, hh).attr({ fill: '#f06' });
    rect.move(pad, pad);
  }

  DrawSystemDiagram(w, h) {
    const width = w || this.props.viewWidth;
    const height = h || this.props.viewHeight;
    // clear screen then drawnpm
    this.Draw.clear();
    console.log(`%cDrawSystemDiagram() ${width} ${height}`, 'color:green');
    const xx = 100;
    const yy = 100;
    const ww = 200;
    const hh = 100;
    const pad = 10;
    const Draw = this.Draw;
    const COL_BG = '#F06';
    // define symbols

    function makePropElement(name = '<unknown>') {
      const prop = Draw.group();
      const rect = prop
        .rect(10, 10)
        .fill(COL_BG)
        .radius(5);
      const text = prop
        .text(add => {
          add.tspan(name);
        })
        .font({ weight: 'bold' })
        .move(10, 5);
      // resize rect to size of text
      rect.size(Math.min(text.bbox().w, ww) + 20, Math.min(text.bbox().h, hh) + 10);
      // play with events
      prop.draggable();
      prop.on('dragmove.propmove', event => {
        const { handler, box } = event.detail;
        event.preventDefault();
        const { x, y } = box;
        handler.move(x, y);
        updatePath();
      });
      return prop;
    }
    // draw symbols
    let p1 = { x: xx, y: yy };
    let p2 = { x: xx + 2 * ww + pad, y: yy + pad + hh };
    const S1 = makePropElement()
      .cx(p1.x)
      .cy(p1.y);
    const S2 = makePropElement('Figaro')
      .cx(p2.x)
      .cy(p2.y);
    // draw bezier
    const up = 150;
    const mech = Draw.path(
      `M${p1.x},${p1.y} C${p1.x},${p1.y - up} ${p2.x},${p2.y - up} ${p2.x},${p2.y}`
    )
      .back()
      .fill('none')
      .stroke({ width: 4, color: 'orange' });
    // draw label
    const label = Draw.text(add => {
      add.tspan('mechanism');
    });
    label
      .fill('orange')
      .attr('dy', -6)
      .path(mech)
      .attr('side', 'right')
      .attr('startOffset', '50%')
      .attr('textAnchor', 'middle');

    function updatePath() {
      p1.x = S1.cx();
      p1.y = S1.cy();
      p2.x = S2.cx();
      p2.y = S2.cy();
      if (p1.x > p2.x) {
        const t = p1;
        p1 = p2;
        p2 = t;
      }
      mech.plot(`M${p1.x},${p1.y} C${p1.x},${p1.y - up} ${p2.x},${p2.y - up} ${p2.x},${p2.y}`);
    }
  }

  render() {
    if (DBG)
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
