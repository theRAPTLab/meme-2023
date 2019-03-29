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
const COL_BG = '#44F';
const DIM_RADIUS = 3;

const DBG = false;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class VGProp {
  constructor(propId, svgRoot) {
    if (typeof propId !== 'string') throw Error(`require string id`);
    if (!DATA.HasProp(propId)) throw Error(`${propId} is not in graph data`);
    // basic display props
    this.id = propId;
    this.data = Object.assign({}, DATA.Prop(propId)); // copy, not reference
    this.gRoot = svgRoot.group(); // main reference group
    // this order is important
    this.visBG = this.gRoot.rect(this.width, this.height); // background
    this.gData = this.gRoot.group(); // main data properties
    this.gKids = this.gRoot.group(); // child components group
    this.gDataName = this.gData.text(this.data.name.toUpperCase()); // label
    // other default properties
    this.fill = COL_BG;
    this.width = m_minWidth;
    this.height = m_minHeight;
    this.kidsWidth = 0;
    this.kidsHeight = 0;
    // higher order display properties
    this.gRoot.draggable();
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
    return this.gRoot.x();
  }

  Y() {
    return this.gRoot.y();
  }

  Width() {
    return this.width;
  }

  Height() {
    return this.height;
  }

  DataHeight() {
    return this.GetDataBBox().h;
  }

  //
  Move(xObj, y) {
    if (typeof xObj === 'object') {
      const { x: xx, y: yy } = xObj;
      if (typeof xx !== 'number') throw Error(`x ${xx} is not an number`, xx);
      if (typeof yy !== 'number') throw Error(`y ${yy} is not an number`, yy);
      this.gRoot.move(xx, yy);
      return;
    }
    const x = xObj;
    if (typeof x !== 'number') throw Error(`x ${x} is not an number`, x);
    if (typeof y !== 'number') throw Error(`y ${y} is not an number`, y);
    this.gRoot.move(x, y);
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
  }

  //
  GetCenter() {
    return {
      id: this.id,
      x: this.gRoot.cx(),
      y: this.gRoot.cy()
    };
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
    let { w, h } = this.gDataName.rbox();
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
    return { id: this.id, w: this.kidsWidth, h: this.kidsHeight };
  }

  MoveKids(xObj, yNum) {
    const [xx, yy] = m_Norm(xObj, yNum);
    if (typeof xx !== 'number') throw Error(`x ${xx} is not an number`, xx);
    if (typeof yy !== 'number') throw Error(`y ${yy} is not an number`, yy);
    console.log(`${this.id} moving kids to ${xx},${yy}`);
    this.gKids.move(xx, yy);
  }

  // drawing interface
  Draw(point) {
    console.log(`drawing '${this.id}'`);
    // draw box
    this.visBG
      .fill({ color: this.fill, opacity: 0.1 })
      //      .stroke({ color: this.fill, width: 2 })
      .radius(DIM_RADIUS);
    // draw label
    this.gDataName.transform({ translateX: m_pad, translateY: m_pad / 2 });
    // move
    if (point) this.gRoot.move(point.x, point.y);
  }

  // "destructor"
  Release() {
    return this.gRoot.remove();
  }

  //
  ToParent(id) {
    const vparent = DATA.VM_VProp(id);
    if (DBG) console.log(`${id} <- ${this.id}`);
    this.gRoot.toParent(vparent.gKids);
  }

  //
  AddTo(id) {
    const vparent = DATA.VM_VProp(id);
    if (DBG) console.log(`${id} ++ ${this.id}`);
    this.gRoot.addTo(vparent.gKids);
  }

  //
  ToRoot() {
    if (DBG) console.log(`%croot <- ${this.id}`, `font-weight:bold`);
    this.gRoot.toRoot();
  }

  //
  Update() {
    // update data by copying
    const data = DATA.Prop(this.id);
    this.data.name = data.name;
    // preserve layout
    const x = this.gRoot.x();
    const y = this.gRoot.y();
    this.Draw({ x, y });
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
  if (DATA.VM_VProp(id)) throw Error(`${id} is already allocated`);
  if (svgRoot.constructor.name !== 'Svg') throw Error(`arg2 must be SVGJS draw instance`);
  const vprop = new VGProp(id, svgRoot);
  DATA.VM_VPropSet(id, vprop);
  return vprop;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
 *  De-allocate VGProp instance by id.
/*/
VGProperties.Release = id => {
  const vprop = DATA.VM_VProp(id);
  DATA.VM_VPropDelete(id);
  return vprop.Release();
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
 *  Update instance from associated data id
/*/
VGProperties.Update = id => {
  const vprop = DATA.VM_VProp(id);
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
  if (!DATA.VM_VPropExists(id)) throw Error(`${id} isn't allocated, so can't set parent`);
  const child = DATA.VM_VProp(id);
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
  return DATA.VM_VProp(id);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
VGProperties.Move = (id, x, y) => {
  if (!id) throw Error(`arg1 must be valid string id`);
  if (!map_visuals.has(id)) throw Error(`${id} isn't allocated, so can't move`);
  const child = DATA.VM_VProp(id);
  child.Move({ x, y });
  return child;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
VGProperties.SetSize = (id, w, h) => {
  if (!id) throw Error(`arg1 must be valid string id`);
  if (!map_visuals.has(id)) throw Error(`${id} isn't allocated, so can't resize`);
  const child = DATA.VM_VProp(id);
  child.SetSize(w, h);
  return child;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
VGProperties.GetSize = id => {
  if (!id) throw Error(`arg1 must be valid string id`);
  if (!map_visuals.has(id)) throw Error(`${id} isn't allocated, so can't retrieve size`);
  const child = DATA.VM_VProp(id);
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
    console.groupCollapsed(`%c:layout component ${id}`, cssinfo);
    u_Layout({ x: xCounter, y: yCounter }, id);
    const compVis = DATA.VM_VProp(id);
    xCounter += compVis.GetSize().width + PAD.MIN2;
    if (xCounter > 700) {
      yCounter += highHeight;
      xCounter = 0;
      highHeight = 0;
    }
    console.groupEnd();
  });
};

function u_Layout(offset, id) {
  let { x, y } = offset;
  console.group(`${id} draw at (${x},${y})`);
  const compVis = DATA.VM_VProp(id);
  compVis.Move(x, y); // draw compVis where it should go in screen space
  y += compVis.DataHeight() + PAD.MIN;
  x += PAD.MIN;
  const children = DATA.Children(id);
  let widest = 0;
  children.forEach(cid => {
    const childVis = DATA.VM_VProp(cid);
    widest = Math.max(widest, childVis.GetKidsBBox()).w;
    u_Layout({ x, y }, cid);
    const addH = childVis.Height() + PAD.MIN;
    y += addH;
    console.log(`y + ${addH} = ${y}`);
  });
  console.groupEnd();
}

/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
window.vprops = () => {
  console.log(`%cattaching props to window by [id]`, cssdata);
  let props = DATA.AllProps();
  props.forEach(pid => {
    window[pid] = DATA.VM_VProp(pid);
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
    const vis = DATA.VM_VProp(pid);
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
