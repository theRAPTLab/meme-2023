/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

    MCGraph - Mechanisms and Components Graphing
    pure non-REACT module

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/
import SVG from '@svgdotjs/svg.js/src/svg';
import '@svgdotjs/svg.draggable.js';

/// MODULES ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import DATA from './pmc-data';
import { cssinfo, cssdraw } from './console-styles';

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PMC = {};
let m_element;
let m_draw;
let m_width;
let m_height;

/// PRIVATE HELPERS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_RecurseChildren(id) {
  let s = 10;
  const children = DATA.Children(id);
  children.forEach(child => {
    s += m_RecurseChildren(child);
  });
  return s;
}

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
PMC.Update = config => {
  const { w, h } = config;
  if (w) m_width = w;
  if (h) m_height = h;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
PMC.MountSVG = element => {
  m_element = element;
  m_draw = SVG(m_element);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
PMC.DrawTestScene = (w, h) => {
  const width = w || m_width;
  const height = h || m_height;
  const pad = 25;
  const ww = width - pad - pad;
  const hh = height - pad - pad;
  //
  console.log(`%cdrawing ${ww} ${hh}`, cssdraw);
  //
  m_draw.clear();
  const rect = m_draw.rect(ww, hh).attr({ fill: '#f06' });
  rect.move(pad, pad);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
PMC.DrawComponents = () => {
  // PMC.DrawTestScene();
  const components = DATA.Components();
  /*\
     * to draw the container structure, perhaps
     * start with the parents and distribute them in available space.
     *
    \*/
  const numComponents = components.length;
  console.log(`%cDrawing ${numComponents} arr_components`, cssinfo);
  // calculate size of a container by counting children
  components.forEach(id => {
    console.log(`component ${id} size ${m_RecurseChildren(id)}`);
  });
  // calculate size of component based on all nested children};
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
PMC.DrawSystemDiagram = (w, h) => {
  const width = w || m_width;
  const height = h || m_height;
  // clear screen then drawnpm
  m_draw.clear();
  console.log(`%cDrawSystemDiagram() ${width} ${height}`, cssdraw);
  const xx = 100;
  const yy = 200;
  const ww = 200;
  const hh = 100;
  const pad = 10;
  const COL_BG = '#F06';
  // define symbols

  function makePropElement(name = '<unknown>') {
    const prop = m_draw.group();
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
  const mech = m_draw
    .path(`M${p1.x},${p1.y} C${p1.x},${p1.y - up} ${p2.x},${p2.y - up} ${p2.x},${p2.y}`)
    .back()
    .fill('none')
    .stroke({ width: 4, color: 'orange', dasharray: '4 2' });
  // draw label
  const label = m_draw.text(add => {
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
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
PMC.DrawComponent = nodeId => {
  if (typeof node !== 'string') {
    console.log('expect string nodeId, not', nodeId);
  }
  // node should have data that looks like
};

/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PMCView = PMC;
export { PMCView, DATA };
