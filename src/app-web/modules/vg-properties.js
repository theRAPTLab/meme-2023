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
import { cssinfo, cssdraw, csstab, csstab2, cssblue, cssdata } from './console-styles';
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

const DBG = false;

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
    this.visRoot = svgRoot.group(); // main container
    this.visBG = this.visRoot.rect(this.width, this.height); // background
    this.visData = this.visRoot.group();
    this.visDataName = this.visData.text(this.data.name); // label
    this.visKids = this.visRoot.group(); // child components
    this.visKids.rect(5, 5).fill('red'); // debug
    //
    this.fill = COL_BG;
    this.width = m_minWidth;
    this.height = m_minHeight;
    this.kidsWidth = 0;
    this.kidsHeight = 0;
    // higher order display properties
    this.visRoot.draggable();
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
    return this.visRoot.x();
  }

  Y() {
    return this.visRoot.y();
  }

  Width() {
    return this.width;
  }

  Height() {
    return this.height;
  }

  //
  Move(xObj, y) {
    if (typeof xObj === 'object') {
      const { x: xx, y: yy } = xObj;
      if (typeof xx !== 'number') throw Error(`x ${xx} is not an number`, xx);
      if (typeof yy !== 'number') throw Error(`y ${yy} is not an number`, yy);
      this.visRoot.move(xx, yy);
      return;
    }
    const x = xObj;
    if (typeof x !== 'number') throw Error(`x ${x} is not an number`, x);
    if (typeof y !== 'number') throw Error(`y ${y} is not an number`, y);
    this.visRoot.move(x, y);
  }

  //
  SetSize(wObj, h) {
    if (typeof wObj === 'object') {
      this.width = wObj.w;
      this.height = wObj.h;
    } else {
      this.width = wObj;
      this.height = h;
    }
    // set the background size
    this.visBG.size(this.width, this.height);
    const bbox = this.GetDataBBox();
    this.visKids.move(0, bbox.h);
  }

  //
  GetSize() {
    return {
      width: this.width,
      height: this.height
    };
  }

  // return the size requirment of the layout
  // minium size, but no additional padding
  GetDataBBox() {
    let { w, h } = this.visDataName.rbox();
    if (w < m_minWidth) w = m_minWidth;
    if (h < m_minHeight) h = m_minHeight;

    return {
      id: this.id,
      w: Math.ceil(w),
      h: Math.ceil(h)
    };
  }

  SetKidsBBox(wObj, h) {
    if (typeof wObj === 'object') {
      const { w: ww, h: hh } = wObj;
      if (typeof ww !== 'number') throw Error(`x ${ww} is not an number`, ww);
      if (typeof hh !== 'number') throw Error(`y ${hh} is not an number`, hh);
      this.kidsWidth = ww;
      this.kidsHeight = hh;
      return;
    }
    const w = wObj;
    if (typeof w !== 'number') throw Error(`x ${w} is not an number`, w);
    if (typeof h !== 'number') throw Error(`y ${h} is not an number`, h);
    this.kidsWidth = w;
    this.kidsHeight = h;
  }

  GetKidsBBox() {
    return { w: this.kidsWidth, h: this.kidsHeight };
  }

  MoveKids(xObj, yNum) {
    const [xx, yy] = m_Norm(xObj, yNum);
    if (typeof xx !== 'number') throw Error(`x ${xx} is not an number`, xx);
    if (typeof yy !== 'number') throw Error(`y ${yy} is not an number`, yy);
    console.log(`${this.id} moving kids to ${xx},${yy}`);
    this.visKids.move(xx, yy);
  }

  // drawing interface
  Draw(point) {
    console.log(`drawing '${this.id}'`);
    // draw box
    this.visBG
      .fill({ color: this.fill, opacity: 0.5 })
      .stroke({ color: this.fill, width: 2 })
      .radius(DIM_RADIUS);
    // draw label
    this.visDataName.move(m_pad, m_pad);
    // move
    if (point) this.visRoot.move(point.x, point.y);
  }

  // "destructor"
  Release() {
    return this.visRoot.remove();
  }

  //
  ToParent(id) {
    const vparent = m_GetVisual(id);
    if (DBG) console.log(`${id} <- ${this.id}`);
    this.visRoot.toParent(vparent.visKids);
  }

  //
  AddTo(id) {
    const vparent = m_GetVisual(id);
    if (DBG) console.log(`${id} ++ ${this.id}`);
    this.visRoot.addTo(vparent.visKids);
  }

  //
  ToRoot() {
    if (DBG) console.log(`%croot <- ${this.id}`, `font-weight:bold`);
    this.visRoot.toRoot();
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
function m_Norm(aObj, bNum) {
  if (typeof aObj === 'object') {
    if (bNum === undefined) return aObj.keys();
    throw Error(`can't normalize aObj ${aObj}, bNum ${bNum}`);
  }
  return [aObj, bNum];
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
/*/
 *  SizeToContents sizes all the properties to fit their contained props
 *  based on their display state
/*/
VGProperties.LayoutComponents = () => {
  const components = DATA.Components();
  // then dp ;aupit
  let xCounter = 50;
  let highHeight = 0;
  let yCounter = 50;

  // walk through all components
  // for each component, get the size of all children
  // set background size to it
  components.forEach(id => {
    // get the Visual
    const compVis = m_GetVisual(id);
    console.groupCollapsed(`%c:handling visual ${compVis.id}`, cssinfo);
    const dbox = compVis.GetDataBBox();
    highHeight = Math.max(highHeight, dbox.h);
    console.log(`component [${id}] size=[${dbox.w},${dbox.h}] to (${xCounter},${yCounter}) `);
    u_LayoutChildren({ x: 0, y: dbox.h }, id);
    compVis.Move(xCounter, yCounter);
    xCounter += dbox.w + m_pad;
    if (xCounter > 700) {
      yCounter += highHeight;
      xCounter = 0;
      highHeight = 0;
    }
    console.groupEnd();
  });
};

function u_LayoutChildren(offset, id) {
  console.group(`${id} recurse layout`);
  const children = DATA.Children(id);
  let cyy = offset.y;
  children.forEach(cid => {
    u_LayoutChildren({ x: 0, y: cyy }, cid);
    const childVis = m_GetVisual(cid);
    const kbb = childVis.GetKidsBBox();
    childVis.Move(0, cyy);
    console.log(`[${cid}] h=${kbb.h} to y=${cyy}`);
    cyy += kbb.h;
  });
  console.groupEnd();
}

/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
window.vprops = () => {
  console.log(`%cattaching props to window by [id]`, cssdata);
  let props = DATA.AllProps();
  props.forEach(pid => {
    window[pid] = m_GetVisual(pid);
  });
  return `${props} attached to window object`;
};
window.comps = () => {
  console.log(`%cshowing components`, cssdata);
  let comps = DATA.Components();
  comps.forEach(id => {
    console.log(`[${id}]`);
  });
  return `${comps.length} components listed`;
};
window.dumpid = id => {
  console.log(`%cdumping id [${id}] child hierarchy`, cssdata);
  recurse(id);
  /** helper **/
  function recurse(pid) {
    const vis = m_GetVisual(pid);
    const visHeight = vis.Height();
    const visY = vis.Y();
    console.group(`[${pid}] y=${visHeight} (${visHeight})`);
    const kids = DATA.Children(pid);
    kids.forEach(kid => {
      recurse(kid);
    });
    console.groupEnd();
  }
  return `finished dumping id [${id}]`;
};

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default VGProperties;
