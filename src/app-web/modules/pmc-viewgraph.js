/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

    MCGraph - Mechanisms and Components Graphing
    pure non-REACT module

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/
import SVG from '@svgdotjs/svg.js/src/svg';
import '@svgdotjs/svg.draggable.js';

/// MODULES ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import DATA from './pmc-data';
import VGProperties from './vg-properties';
import { cssinfo, cssdraw, csstab, csstab2 } from './console-styles';

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PMC = {};
const map_props = new Map(); // our property viewmodel
const map_mechs = new Map(); // our mechanism viewmodel
let m_element;
let m_svgroot;
let m_width;
let m_height;
const COL_BG = '#F06';
const DBG = true;

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
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_MakePropElement(name = '<unknown>') {
  const prop = m_svgroot.group();
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
    m_UpdatePath();
  });
  //
  prop.on('dragend.propmove', event => {
    const { handler, box } = event.detail;
    event.preventDefault();
  });
  return prop;
}
/*\
     * updates the path
     * and also changes the label orientation
    \*/
function m_UpdatePath() {
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
/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
PMC.UpdateComponentLists = config => {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
PMC.UpdateComponents = config => {
  const { w, h } = config;
  if (w) m_width = w;
  if (h) m_height = h;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
    attach an SVG instance, managed by SVGJS, to the container element
/*/
PMC.InitializeViewgraph = element => {
  m_element = element;
  m_svgroot = SVG(m_element);
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
  m_svgroot.clear();
  const rect = m_svgroot.rect(ww, hh).attr({ fill: '#f06' });
  rect.move(pad, pad);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
PMC.DrawComponents = () => {
  // PMC.DrawTestScene();
  const components = DATA.Components();
  const num = components.length;
  console.log(`%cDrawing ${num} arr_components`, cssinfo);
  // calculate size of a container by counting children
  let ancx = 75;
  let ancy = 75;
  const gap = 10;
  //
  components.forEach(id => {
    const width = 100 + gap + gap;
    const height = m_RecurseChildren(id) + gap + gap;
    const gComponent = m_DrawComponent(id, ancx, ancy);
    // const rect = m_svgroot.rect(width, height).attr({ fill: '#f06' });
    // rect.move(ancx, ancy);
    ancy += height + gap;
  });
  // calculate size of component based on all nested children}
  // let's try drawing a bunch of rectangles
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_DrawComponent(id, ancx, ancy) {
  /*\
   * What is a component?
   * it's a group of svg elements! make a group and stuff!
   * then return the group with
  \*/
  const children = DATA.Children(id);
  children.forEach(child => {
    console.log(`drawing ${child}`);
    // draw all the child nodes
  });
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
PMC.DrawSystemDiagram = (w, h) => {
  const width = w || m_width;
  const height = h || m_height;
  // clear screen then drawnpm
  m_svgroot.clear();
  console.log(`%cDrawSystemDiagram() ${width} ${height}`, cssdraw);
  const xx = 100;
  const yy = 200;
  const ww = 200;
  const hh = 100;
  const pad = 10;
  // draw symbols
  let p1 = { x: xx, y: yy };
  let p2 = { x: xx + 2 * ww + pad, y: yy };
  const S1 = m_MakePropElement()
    .cx(p1.x)
    .cy(p1.y);
  const S2 = m_MakePropElement('Figaro')
    .cx(p2.x)
    .cy(p2.y);
  // draw bezier
  const up = 150;
  const mech = m_svgroot
    .path(`M${p1.x},${p1.y} C${p1.x},${p1.y - up} ${p2.x},${p2.y - up} ${p2.x},${p2.y}`)
    .back()
    .fill('none')
    .stroke({ width: 4, color: 'orange', dasharray: '4 2' });
  // draw label
  const label = m_svgroot.text(add => {
    add.tspan('mechanism');
  });
  //
  label.fill('orange').attr('dy', -6);
  label.attr('text-anchor', 'end');
  //
  const blen = 55;
  const textpath = label.path(mech).attr('startOffset', mech.length() - blen);
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
PMC.DrawComponent = nodeId => {
  if (typeof node !== 'string') {
    console.log('expect string nodeId, not', nodeId);
  }
  // node should have data that looks like
};

/// LIFECYCLE /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
 *  Get user inputs (external buttons, clcks, keypresses) and convert physical
 *  controls like "up arrow" into app-domain intentions "move piece up"
/*/
PMC.GetIntent = () => {
  console.log('GetIntent() unimplemented');
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
 *  Based on intentions, update current mode settings that will affect later
 *  processing stages
/*/
PMC.SyncModeSettings = () => {
  console.log('SyncModeSettings() unimplemented');
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
 *  Collects queued change requests (actions, inputs) and figures out how to
 *  handle them in the right order. These changes are then stored in collections
 *  to be processed by UpdateModel().
/*/
PMC.CalculateChanges = () => {
  if (DBG) console.log(`%cCalculateChanges()`, cssinfo);
  let { added, removed, updated } = DATA.CompareProps(map_props);
  removed.forEach(id => {
    VGProperties.Release(id);
    map_props.delete(id);
  });
  added.forEach(id => {
    const vprop = VGProperties.New(id, m_svgroot);
    map_props.set(id, vprop);
  });
  updated.forEach(id => {
    VGProperties.Update(id);
  });
  if (DBG) {
    if (removed.length) console.log(`%cRemoving ${removed.length} dead nodes`, csstab);
    if (added.length) console.log(`%cAdding ${added.length} new nodes`, csstab);
    if (updated.length) console.log(`%cUpdating ${updated.length} nodes`, csstab);
  }
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
 *  Update the data model. For PMCViewGraph, this lifecycle event probably doesn't
*  do anything because that is PMCDataGraph's responsibility.
/*/
PMC.UpdateModel = () => {
  console.log(`UpdateModel() unimplemented`);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
*  Fetch the model data and transform it into our ViewModel data structures
/*/
PMC.UpdateViewModel = () => {
  console.log(`UpdateViewModel() unimplemented`);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
Draw the model data by calling draw commands on everything. Also update.
/*/
PMC.UpdateView = () => {
  console.log(`UpdateView() unimplemented`);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
PMC.VProp = id => {
  if (typeof id !== 'string') throw Error('arg1 must be string');
  if (!map_props.has(id)) throw Error(`vprop ${id} is not in map_props`);
  return map_props.get(id);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
window.pmc = PMC;
window.cc = PMC.CalculateChanges;
// DEBUGGERY
window.snn = (id, name) => {
  DATA.Prop(id).name = name;
  PMC.VProp(id).Update();
  return DATA.Prop(id).name;
};
window.nn = id => {
  return DATA(id).name;
};

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PMCView = PMC;
export { PMCView, DATA };
