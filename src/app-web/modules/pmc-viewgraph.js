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
    Collects queued change requests (actions, inputs) and figures out how to
    handle them in the right order. These changes are then stored in collections
    to be processed by UpdateModel().
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
PMC.CalculateChanges = () => {
  if (DBG) console.groupCollapsed(`%cCalculateChanges()`, cssinfo);
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
    if (removed.length) console.log(`%cRemoving ${removed.length} dead nodes`, csstab);
    if (added.length) console.log(`%cAdding ${added.length} new nodes`, csstab);
    if (updated.length) console.log(`%cUpdating ${updated.length} nodes`, csstab);
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
  if (DBG) console.group(`%cUpdateViewModel()`, cssinfo);

  // first get the list of component ids to walk through
  const components = DATA.Components();

  // walk through every component
  components.forEach(compId => {
    VGProperties.MoveToRoot(compId);
    const sizes = u_GetBBoxes(compId);
    console.log(`${compId} sizes`, sizes);
  });
  if (DBG) console.groupEnd();

  //
};

// given a propId, return array of size objects
// [ self { id, w, h} , child { id, w, h }, ... ]
function u_GetBBoxes(propId) {
  // first get the databbox of the propID
  const pSelf = VGProperties.GetDataBBox(propId);
  let sizes = [];
  // then get the boxes of the children
  const children = DATA.Children(propId);
  children.forEach(childId => {
    VGProperties.MoveToParent(childId, propId);
    const childSize = u_GetBBoxes(childId);
    sizes = sizes.concat(childSize);
  });
  // sizes contains pSelf + child(s)
  // calculate size of this prop
  let pSize = u_CombineBBoxes([pSelf, ...sizes]);
  VGProperties.SetSize(propId, pSize.w, pSize.h);
  // position the children
  let yy = pSelf.h;
  sizes.forEach(childSize => {
    VGProperties.Move(childSize.id, 0, yy);
    yy += childSize.h;
  });

  // return self+child sizes
  return [pSelf].concat(sizes);
}

/** helper to compile bboxes together **/
function u_CombineBBoxes(bboxArray) {
  if (bboxArray === undefined) throw Error(`arg must be array of {id, w, h} items`);
  if (!Array.isArray(bboxArray)) throw Error(`arg is not an array ${JSON.toString(bboxArray)}`);
  if (!bboxArray.length) throw Error(`bboxArray must have at least one elements`);
  let box = bboxArray.reduce((bbox, item) => {
    return {
      id: `${bbox.id}:${item.id}`,
      w: Math.max(bbox.w, item.w),
      h: bbox.h + item.h
    };
  });
  return box;
}

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
    Draw the model data by calling draw commands on everything. Also update.
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
PMC.UpdateView = () => {
  if (DBG) console.group(`%cUpdateView()`, cssinfo);
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
  console.log(`%cDrawSystemDiagram() ${width} ${height}`, cssdraw);
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
