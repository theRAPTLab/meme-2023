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

const Graph = GraphLib.Graph;
const Alg = GraphLib.alg;
const GraphJSON = GraphLib.json;

const DBG = false;
const cstyle_INFO = 'color:white;background-color:blue;padding:0 4px';
const cstyle_DRAW = 'color:white;background-color:green;padding:0 4px';

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
    // graphic json test
    const g = new Graph({ directed: true, compound: true, multigraph: true });
    g.setNode('a', { name: 'a node', data: { j: 1, k: 11, l: 111 } });
    g.setNode('b', { name: 'b node', data: { j: 2, k: 22, l: 222 } });
    g.setNode('c', { name: 'c node', data: { j: 3, k: 33, l: 333 } });
    g.setNode('d', { name: 'd node', data: { j: 4, k: 44, l: 444 } });
    g.setNode('e', { name: 'e node', data: { j: 5, k: 55, l: 555 } });
    g.setNode('f', { name: 'f node', data: { j: 6, k: 66, l: 667 } });
    g.setParent('c', 'a');
    g.setParent('d', 'c');
    g.setParent('f', 'a');
    g.setEdge('b', 'a', { name: 'b to a' });
    g.setEdge('b', 'd', { name: 'b to d' });
    g.setEdge('c', 'e', { name: 'c to e' });
    g.setEdge('e', 'b', { name: 'e to b' });
    // test serial write out, then serial read back in
    const cleanGraphObj = GraphJSON.write(g);
    const json = JSON.stringify(cleanGraphObj);
    this.graph = GraphJSON.read(JSON.parse(json));
  }

  componentDidMount() {
    // create SVG element attached to refContainer
    this.Draw = SVG(this.refContainer.current);
    if (this.props.viewWidth && this.props.viewHeight) this.DrawTestScene();
    else if (DBG) console.log(`${this.cstrName}.componentDidMount() skip draw on first mount`);
    // test graphlib
    const props = this.graph.nodes(); // returns ids of nodes
    const components = [];
    const propkids = new Map(); // property children
    const propedges = new Map(); // outedges for each prop
    /*\
     * components is an array of ids of top-level props
     * propkids maps prop ids to arrays of ids of child props,
     * including children of children
     * propedges maps all the outgoing edges for a node
    \*/
    props.forEach(n => {
      const p = this.graph.parent(n);
      if (!p) {
        components.push(n);
      }
      //
      const children = this.graph.children(n);
      let arr = propkids.get(n);
      if (arr) arr.push.apply(children);
      else propkids.set(n, children);
      //
      const outedges = this.graph.outEdges(n); // an array of edge objects {v,w,name}
      arr = propedges.get(n) || [];
      outedges.forEach(key => {
        arr.push(key.w);
      });
      propedges.set(n, arr);
    });
    console.log(`Components`, components);
    console.log(`PropKids`, propkids);
    console.log(`PropEdges`, propedges);
    /*\
     * to draw the container structure, perhaps
     * start with the parents and distribute them in available space.
     *
    \*/
    const numComponents = components.length;
    console.log(`%cDrawing ${numComponents} components`, cstyle_INFO);
    // calculate size of a container by counting children
    components.forEach(id => {
      console.log(`component ${id} size ${recurseChildren(id)}`);
    });
    // calculate size of component based on all nested children
    function recurseChildren(id) {
      let s = 10;
      const children = propkids.get(id) || [];
      children.forEach(child => {
        s += recurseChildren(child);
      });
      return s;
    }
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
    console.log(`%cdrawing ${ww} ${hh}`, cstyle_DRAW);
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
    console.log(`%cDrawSystemDiagram() ${width} ${height}`, cstyle_DRAW);
    const xx = 100;
    const yy = 200;
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
      //
      prop.on('dragstart.propmove', event => {
        const { handler, box } = event.detail;
        event.preventDefault();
      });
      //
      prop.on('dragmove.propmove', event => {
        const { handler, box } = event.detail;
        event.preventDefault();
        const { x, y } = box;
        handler.move(x, y);
        updatePath();
      });
      //
      prop.on('dragend.propmove', event => {
        const { handler, box } = event.detail;
        event.preventDefault();
      });
      return prop;
    }
    // draw symbols
    let p1 = { x: xx, y: yy };
    let p2 = { x: xx + 2 * ww + pad, y: yy };
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
      .stroke({ width: 4, color: 'orange', dasharray: '4 2' });
    // draw label
    const label = Draw.text(add => {
      add.tspan('mechanism');
    });
    //
    label.fill('orange').attr('dy', -6);
    label.attr('text-anchor', 'end');
    //
    const blen = 55;
    const textpath = label.path(mech).attr('startOffset', mech.length() - blen);
    /*\
     * updates the path
     * and also changes the label orientation
    \*/
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
      if (S1.cx() > S2.cx()) {
        label.attr('text-anchor', 'start');
        textpath.attr('startOffset', blen);
      } else {
        label.attr('text-anchor', 'end');
        textpath.attr('startOffset', mech.length() - blen);
      }
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
