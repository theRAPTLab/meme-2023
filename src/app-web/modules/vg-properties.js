/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  A VGProp is the visual representation of a component OR property in
  our ViewGraph. It is designed to worth with IDs that are
  used to fetch the underlying graph data to refresh its viewmodel.

  All static properties operate on ids that are shared between data and
  svg elements.

  extern DATA is the graph

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import '@svgdotjs/svg.draggable.js';
import DATA from './pmc-data';
import { cssinfo, cssdraw, csstab, csstab2 } from './console-styles';

/// PRIVATE DECLARATIONS //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const map_visuals = new Map();
const m_minWidth = 200;
const m_minHeight = 30;
const m_pad = 5;
const m_pad2 = m_pad * 2;
const COL_BG = '#F06';
const DIM_RADIUS = 3;

const DBG = true;

/// PRIVATE HELPERS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_GetVisual(id) {
  if (typeof id !== 'string') throw Error(`require string id`);
  const vprop = map_visuals.get(id);
  if (!vprop) throw Error(`vprop '${id}' not found`);
  return vprop;
}

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class VGProp {
  constructor(propId, svgRoot) {
    if (typeof propId !== 'string') throw Error(`require string id`);
    if (!DATA.HasProp(propId)) throw Error(`${propId} is not in graph data`);
    // basic display props
    this.id = propId;
    this.data = Object.assign({}, DATA.Prop(propId)); // copy, not reference
    this.visROOT = svgRoot.group(); // main container
    this.visBGRECT = this.visROOT.rect(this.width, this.height); // background
    this.visTITLE = this.visROOT.text(this.data.name); // label
    this.visKIDS = this.visROOT.group(); // child components
    this.visKIDS.move(5, 0);
    //
    this.fill = COL_BG;
    this.width = m_minWidth;
    this.height = m_minHeight;
    // higher order display properties
    this.visROOT.draggable();
    this.dataDisplayMode = {}; // how to display data, what data to show/hide
    this.connectionPoints = []; // array of points available for mechanism connections
    this.highlightMode = {}; // how to display selection, subselection, hover

    // initial drawing
    this.Draw();
  }

  //
  Id() {
    return this.id;
  }

  //
  Move(point) {
    if (typeof point !== 'object') throw Error('arg must be {x,y} object');
    const { x, y } = point;
    if (typeof x !== 'number') throw Error('x is not an number');
    if (typeof y !== 'number') throw Error('y is not an number');
    console.log(this.id, 'move', x, y);
    this.visROOT.move(x, y);
  }

  //
  SetSize(w, h) {
    this.width = w;
    this.height = h;
    this.visBGRECT.size(w, h);
  }

  // return the size requirment of the layout
  GetInnerSize() {
    const { w, h } = this.visTITLE.rbox();
    return {
      w: Math.ceil(w),
      h: Math.ceil(h)
    };
  }

  // drawing interface
  Draw(point) {
    console.log(`drawing '${this.id}'`);
    // draw box
    this.visBGRECT
      .fill({ color: this.fill, opacity: 0.5 })
      .stroke({ color: this.fill, width: 2 })
      .radius(DIM_RADIUS);
    // draw label
    this.visTITLE.move(m_pad, m_pad);
    // move
    if (point) this.visROOT.move(point.x, point.y);
  }

  // "destructor"
  Release() {
    return this.visROOT.remove();
  }

  //
  ToParent(id) {
    const vparent = m_GetVisual(id);
    console.log(`${this.id}.svg.toParent(${id})`);
    const kid = this.visROOT.toParent(vparent.visKIDS);
    console.log(kid);
    return kid;
  }

  //
  AddTo(id) {
    const vparent = m_GetVisual(id);
    console.log(`${this.id}.svg.addTo(${id})`);
    return this.visROOT.addTo(vparent.visKIDS);
  }

  //
  ToRoot() {
    console.log(`%c${this.id}.svg.toRoot()`, `font-weight:bold`);
    return this.visROOT.toRoot();
  }

  //
  Update() {
    // update data by copying
    const data = DATA.Prop(this.id);
    this.data.name = data.name;
    // preserve layout
    const x = this.svg.x();
    const y = this.svg.y();
    //this.Draw({ x, y });
  }
}

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const VGProperties = {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
 *  Allocate VGProp instances through this static method. It maintains
 *  the collection of all allocated visuals
/*/
VGProperties.New = (id, svgRoot) => {
  if (map_visuals.has(id)) throw Error(`${id} is already allocated`);
  if (svgRoot.constructor.name !== 'Svg') throw Error(`arg2 must be SVGJS draw instance`);
  const vprop = new VGProp(id, svgRoot);
  map_visuals.set(id, vprop);
  return vprop;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
 *  De-allocate VGProp instance by id.
/*/
VGProperties.Release = id => {
  const vprop = m_GetVisual(id);
  map_visuals.delete(id);
  return vprop.Release();
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
 *  Update instance from associated data id
/*/
VGProperties.Update = id => {
  const vprop = m_GetVisual(id);
  vprop.Update();
  return vprop;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
 *  move a property to a parent by id, preserving transformations
    if parentId is falsey, then move to root svg
/*/
VGProperties.SetParent = (id, parentId) => {
  if (!id) throw Error(`arg1 must be valid string id`);
  if (!map_visuals.has(id)) throw Error(`${id} isn't allocated, so can't set parent`);
  const child = m_GetVisual(id);
  if (!parentId) {
    child.ToRoot();
    return child;
  }
  if (typeof parentId !== 'string') throw Error(`arg2 parentId must be a string`);
  child.ToParent(parentId);
  child.Move({ x: m_pad2, y: m_pad + m_minHeight });
  return child;
};
VGProperties.MoveToRoot = id => {
  VGProperties.SetParent(id);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
 *  SizeToContents sizes all the properties to fit their contained props
 *  based on their display state
/*/
VGProperties.LayoutComponents = () => {
  const components = DATA.Components();
  // then dp ;aupit
  let xCounter = 0;
  let highHeight = 0;
  let yCounter = 0;

  // walk through all components
  // for each component, get the size of all children
  // set background size to it
  components.forEach(id => {
    // get the Visual
    const visual = m_GetVisual(id);
    console.group(`%chandling visual ${visual.id}`, cssinfo);
    // first get the sizes of everything
    const { w, h } = u_RecurseSize(id);
    highHeight = Math.max(highHeight, h);
    console.log(`component '${id}' size=[${w},${h}] to (${xCounter},${yCounter}) `);
    visual.Move({ x: xCounter, y: yCounter });
    visual.SetSize(w, h);
    xCounter += w + m_pad;
    if (xCounter > 700) {
      yCounter += highHeight;
      xCounter = 0;
      highHeight = 0;
    }
    console.groupEnd();
  });
};
/** find size of children helper - returns size containing everything **/
function u_RecurseSize(id) {
  // set baseline size
  const visual = m_GetVisual(id);
  const vsize = visual.GetInnerSize();
  // this is the size that will be returned + padding;
  let w = Math.max(vsize.w, m_minWidth);
  let h = Math.max(vsize.h, m_minHeight);
  // for each kid, we need to add padding
  const kids = DATA.Children(id);
  // recurse through children
  let level = 1;
  kids.forEach(kid => {
    const ksize = u_RecurseSize(kid);
    w = Math.max(w, ksize.w + m_pad2);
    h += ksize.h + m_pad;
    const p = { x: m_pad, y: h };
    let padding = level * 6;
    console.log(
      `%cslotting '${kid}' size=[${ksize.w},${ksize.h}] to (${p.x},${p.y}) `,
      `padding-left:${padding}px`
    );
  });
  level++;
  // now calculate my own size based on label size + size of kids
  visual.SetSize(w, h);
  return { w, h };
}
/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
window.vgp = VGProperties;

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default VGProperties;
