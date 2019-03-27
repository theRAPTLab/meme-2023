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
import { PAD } from './defaults';

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const map_vmprops = new Map(); // our property viewmodel data
const map_vmmechs = new Map(); // our mechanism viewmodel data
//
let m_element;
let m_svgroot;
const m_testprops = [];
//
const COL_BG = '#F06';
const DBG = true;

/// PRIVATE HELPERS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PMC = {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
    attach an SVG instance, managed by SVGJS, to the container element
/*/
PMC.InitializeViewgraph = element => {
  m_element = element;
  m_svgroot = SVG(m_element);
};

/// LIFECYCLE /////////////////////////////////////////////////////////////////
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
    Get user inputs (external buttons, clcks, keypresses) and convert physical
    controls like "up arrow" into app-domain intentions "move piece up"
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
PMC.GetIntent = () => {
  console.log('GetIntent() unimplemented');
};
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
    Based on intentions, update current mode settings that will affect later
    processing stages
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
PMC.SyncModeSettings = () => {
  console.log('SyncModeSettings() unimplemented');
};
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
    SyncPropsToData();
    INPUTS: DataCompareProps(map_vmprops)

    Collects queued change requests (actions, inputs) and figures out how to
    handle them in the right order. These changes are then stored in collections
    to be processed by UpdateModel().
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
PMC.SyncPropsFromGraphData = () => {
  if (DBG) console.groupCollapsed(`%c:SyncPropsFromGraphData()`, cssinfo);
  const { added, removed, updated } = DATA.CompareProps(map_vmprops);
  removed.forEach(id => {
    VGProperties.Release(id);
    map_vmprops.delete(id);
  });
  added.forEach(id => {
    const vprop = VGProperties.New(id, m_svgroot);
    map_vmprops.set(id, vprop);
  });
  updated.forEach(id => {
    VGProperties.Update(id);
  });
  if (DBG) {
    if (removed.length) console.log(`%c:Removing ${removed.length} dead nodes`, csstab);
    if (added.length) console.log(`%c:Adding ${added.length} new nodes`, csstab);
    if (updated.length) console.log(`%c:Updating ${updated.length} nodes`, csstab);
    console.groupEnd();
  }
};
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
    Update the data model. For PMCViewGraph, this lifecycle event probably
    doesn't do anything because that is PMCDataGraph's responsibility.
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
PMC.UpdateModel = () => {
  console.log(`UpdateModel() unimplemented`);
};
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
    Draw the model data by calling draw commands on everything. Also update.
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
PMC.UpdateViewModel = () => {
  if (DBG) console.group(`%c:UpdateViewModel()`, cssinfo);

  // first get the list of component ids to walk through
  const components = DATA.Components();

  // walk through every component
  components.forEach(compId => {
    // VGProperties.MoveToRoot(compId);
    const { self, props } = u_Recurse(compId);
    console.group(`component ${compId} ${self.w}x${self.h} w/${props.length} props`);
    props.forEach(prop => {
      const s = prop.self;
      const p = prop.props;
      console.log(`%c prop.self ${s.id} ${s.w}x${s.h}`, csstab, p);
    });
    console.groupEnd();
  });
  if (DBG) console.groupEnd();
};

// given a propId, set dimension data for each property
// return dimension array of
function u_Recurse(propId) {
  let self; // the box { id, w, h } of the data area
  let props = []; // this will contain the size of child props
  // first get the databbox of the propID
  self = VGProperties.GetDataBBox(propId);
  // next calculate the size of the child props
  const children = DATA.Children(propId);
  // get the full size of each child prop
  children.forEach(childId => {
    props.push(u_Recurse(childId));
  });
  return {
    self,
    props
  };
}

// given an array of box objects { id, w, h }, return
function u_CalcPropsBox(bboxArray) {
  if (bboxArray === undefined) throw Error(`arg must be array of {id, w, h} items`);
  if (!Array.isArray(bboxArray))
    throw Error(`arg is not an array; got '${JSON.stringify(bboxArray)}'`);
  if (bboxArray.length === 0) return { id: '<NOBOX>', w: 0, h: 0 };
  let kids = '';
  let box = bboxArray.reduce((acc, item) => {
    // acc is the accumulator bbox and is mutated by reduce()
    // so don't try messing with it
    if (kids) kids = `${kids},${item.id}`;
    else kids = `${item.id}`;
    return {
      id: acc.id,
      w: Math.max(acc.w, item.w),
      h: acc.h + item.h
    };
  });
  // and is included for debugging purposes
  if (kids) box.kids = kids;
  return box;
}

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
    Draw the model data by calling draw commands on everything. Also update.
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
PMC.UpdateView = () => {
  if (DBG) console.groupCollapsed(`%c:UpdateView()`, cssinfo);
  VGProperties.LayoutComponents();
  if (DBG) console.groupEnd();
};
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
    Returns a data object
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
PMC.VMProp = id => {
  if (typeof id !== 'string') throw Error('arg1 must be string');
  if (!map_vmprops.has(id)) throw Error(`vprop ${id} is not in map_vmprops`);
  return map_vmprops.get(id);
};

/// DRAWING TEST CODE /////////////////////////////////////////////////////////
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
 *  draw two svg components
 *  test nesting
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
let mech;
let label;
let textpath;
const up = 150;
const blen = 55;
let S1;
let S2;
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_MakePropElement(name = '<unknown>') {
  const ww = 200;
  const hh = 30;
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
  m_testprops.push(prop);
  return prop;
}
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
    updates the path
    and also changes the label orientation
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
function m_UpdatePath() {
  let p1 = {};
  let p2 = {};
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
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
PMC.DrawSystemDiagram = (w, h) => {
  const width = w || m_svgroot.width();
  const height = h || m_svgroot.height();
  // clear screen then drawnpm
  m_svgroot.clear();
  console.log(`%c:DrawSystemDiagram() ${width} ${height}`, cssdraw);
  const xx = 100;
  const yy = 200;
  const ww = 200;
  const hh = 100;
  const pad = 10;
  // draw symbols
  let p1 = { x: xx, y: yy };
  let p2 = { x: xx + 2 * ww + pad, y: yy };
  S1 = m_MakePropElement()
    .cx(p1.x)
    .cy(p1.y);
  S2 = m_MakePropElement('Figaro')
    .cx(p2.x)
    .cy(p2.y);
  // draw bezier
  mech = m_svgroot
    .path(`M${p1.x},${p1.y} C${p1.x},${p1.y - up} ${p2.x},${p2.y - up} ${p2.x},${p2.y}`)
    .back()
    .fill('none')
    .stroke({ width: 4, color: 'orange', dasharray: '4 2' });
  // draw label
  label = m_svgroot.text(add => {
    add.tspan('mechanism');
  });
  //
  label.fill('orange').attr('dy', -6);
  label.attr('text-anchor', 'end');
  //
  textpath = label.path(mech).attr('startOffset', mech.length() - blen);
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
PMC.DrawRects = () => {
  const draw = m_svgroot;
  const COLOR = '#0f0';
  {
    /*\
    groups can establish common attributes for contained elements
    you can also nest svg instead of g if you need viewport control

    PRESENTATION ATTRIBUTES
    : class,style
    : clip-path, clip-rule
    : color, color-interpolation, color-rendering
    : cursor
    : display
    : fill, fill-opacity, fill-rule
    : filter, mask, opacity
    : pointer-events
    : shape-rendering
    : stroke, stroke-dasharray, stroke-dashoffset, stroke-linecap, stroke-linejoin
    : stroke-miterlimit, stroke-opacity, stroke-width
    : transform
    : vector-effect
    : visibilitiy

    ALLOWED CONTENT
    animation elements:   <animate>, <animateColor>, <animateMotion>,
                          <animateTransform>, <discard>, <mpath>, <set>
    descriptive elements: <desc>, <metadata>, <title>
    shape elements:       <circle>, <ellipse>, <line>, <mesh>, <path>
                          <polygon>, <polyline>, <rect>
    structural elements:  <defs>, <g>, <svg>, <symbol>, <use>
    gradient elements:    <linearGradient>, <meshGradient>, <radialGradient>, <stop>
    other elements:       <a>, <altGlypDef>, <clipPath>, <color-profile>, <cursor>,
                          <filter>, <font>, <font-face>, <foreignObject>, <image>,
                          <marker>, <mask>, <pattern>, <script>, <style>,
                          <switch>, <text>, <view>
    \*/
    const g = draw.group();
    const g1 = g.group();
    g1.rect(200, 100)
      .fill({ color: COLOR, opacity: 0.25 })
      .radius(3)
      .stroke({ color: COLOR, width: 4 });
    g1.move(10, 200);
  }
};

/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
window.pmc = PMC;
window.cc = PMC.CalculateChanges;
// DEBUGGERY
window.snn = (id, name) => {
  DATA.Prop(id).name = name;
  PMC.VMProp(id).Update();
  return DATA.Prop(id).name;
};
window.nn = id => {
  return DATA(id).name;
};

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PMCView = PMC;
export { PMCView, DATA };
