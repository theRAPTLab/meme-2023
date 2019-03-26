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
import { VPROP, PAD } from './defaults';

/// PRIVATE DECLARATIONS //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const map_visuals = new Map();
const m_minWidth = VPROP.MIN_WIDTH;
const m_minHeight = VPROP.MIN_HEIGHT;
const m_pad = PAD.MIN;
const m_pad2 = PAD.MIN2;
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
  X() {
    return this.visROOT.x();
  }

  Y() {
    return this.visROOT.y();
  }

  Width() {
    return this.width;
  }

  Height() {
    return this.height;
  }

  //
  Move(point) {
    if (typeof point !== 'object') throw Error(`arg must be {x,y} object not ${point}`);
    const { x, y } = point;
    if (typeof x !== 'number') throw Error(`x ${x} is not an number`, x);
    if (typeof y !== 'number') throw Error(`y ${y} is not an number`, y);
    this.visROOT.move(x, y);
  }

  //
  SetSize(w, h) {
    this.width = w;
    this.height = h;
    this.visBGRECT.size(w, h);
  }

  // return the size requirment of the layout
  // minium size, but no additional padding
  GetDataBBox() {
    let { w, h } = this.visTITLE.rbox();
    if (w < m_minWidth) w = m_minWidth;
    if (h < m_minHeight) h = m_minHeight;

    return {
      id: this.id,
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
VGProperties.MoveToParent = (id, parentId) => {
  if (!id) throw Error(`arg1 must be valid string id`);
  if (!map_visuals.has(id)) throw Error(`${id} isn't allocated, so can't set parent`);
  const child = m_GetVisual(id);
  if (!parentId) {
    child.ToRoot();
    return child;
  }
  if (typeof parentId !== 'string') throw Error(`arg2 parentId must be a string`);
  child.ToParent(parentId);
  return child;
};
VGProperties.MoveToRoot = id => {
  VGProperties.MoveToParent(id);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
VGProperties.GetVisual = id => {
  return m_GetVisual(id);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
VGProperties.Move = (id, x, y) => {
  if (!id) throw Error(`arg1 must be valid string id`);
  if (!map_visuals.has(id)) throw Error(`${id} isn't allocated, so can't move`);
  const child = m_GetVisual(id);
  child.Move({ x, y });
  return child;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
VGProperties.SetSize = (id, w, h) => {
  if (!id) throw Error(`arg1 must be valid string id`);
  if (!map_visuals.has(id)) throw Error(`${id} isn't allocated, so can't resize`);
  const child = m_GetVisual(id);
  child.SetSize(w, h);
  return child;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
VGProperties.GetSize = id => {
  if (!id) throw Error(`arg1 must be valid string id`);
  if (!map_visuals.has(id)) throw Error(`${id} isn't allocated, so can't retrieve size`);
  const child = m_GetVisual(id);
  return { id: child.Id(), w: child.Width(), h: child.Height() };
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
VGProperties.GetDataBBox = id => {
  if (!id) throw Error(`arg1 must be valid string id`);
  if (!map_visuals.has(id)) throw Error(`${id} isn't allocated, so can't retrieve data BBox`);
  const child = m_GetVisual(id);
  return child.GetDataBBox();
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
    console.groupCollapsed(`%chandling visual ${visual.id}`, cssinfo);
    // first get the sizes of everything
    const w = visual.Width();
    const h = visual.Height();
    highHeight = Math.max(highHeight, h);
    console.log(`component '${id}' size=[${w},${h}] to (${xCounter},${yCounter}) `);
    visual.Move({ x: xCounter, y: yCounter });
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
  const vsize = visual.GetDataBBox();
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
