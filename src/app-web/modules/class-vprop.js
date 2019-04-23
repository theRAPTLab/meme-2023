import DATA from './pmc-data';
import { cssinfo, cssdraw, csstab, csstab2, cssblue, cssdata } from './console-styles';
import DEFAULTS from './defaults';
import UR from '../../system/ursys';

const { VPROP, PAD } = DEFAULTS;

/// MODULE DECLARATION ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @module VProp
 * @desc
 * The visual representation of "a property that has a name and associated data,
 * and may contain nested properties". It works with string ids (nodeId) that corresponds
 * to the pure data model nodeId.
 */
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const m_minWidth = VPROP.MIN_WIDTH;
const m_minHeight = VPROP.MIN_HEIGHT;
const m_pad = PAD.MIN;
const COL_BG = '#44F';
const DIM_RADIUS = 3;
//
const DBG = false;

/// PRIVATE HELPERS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// accepts either edgeObj or v,w as parameters
function m_Norm(aObj, bNum) {
  if (typeof aObj === 'object') {
    if (bNum === undefined) return aObj.keys();
    throw Error(`can't normalize aObj ${aObj}, bNum ${bNum}`);
  }
  return [aObj, bNum];
}

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class VProp {
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
    console.log(this.gRoot);
    this.gRoot.draggable();
    this.gRoot.on('dragmove.propmove', event => {
      const { handler, box } = event.detail;
      event.preventDefault();
      const { x, y } = box;
      handler.move(x, y);
      UR.Publish('PROP:MOVED', { prop: this.id });
    });

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
      x: this.visBG.cx(),
      y: this.visBG.cy()
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

  // return position bbox in screen coordinardinates
  // x,y,x2,y2,w,h,cx,cy
  GetScreenBBox() {
    return this.visBG.bbox();
  }

  // return a point to connect to
  GetEdgePoint(loc = 'c') {
    const { x, y, x2, y2, cx, cy } = this.visBG.bbox();
    switch (loc) {
      case 'c':
        return { x: cx, y: cy };
      case 't':
        return { x: cx, y };
      case 'r':
        return { x: x2, y: cy };
      case 'b':
        return { x: cx, y: y2 };
      case 'l':
        return { x, y: cy };
      default:
        throw Error(`unexpected location '${loc}'. Valid valus c t r b l`);
    }
  }

  // figures out what points to return
  // returns empty object if no path is possible (e.g. completely contained paths
  // returns { pt1: {x,y}, pt2:{x,y} } if possible
  GetEdgeConnectionPoints(targetId) {
    const target = DATA.VM_VProp(targetId);
    if (!target) throw Error(`VProp with targetId '${targetId}' doesn't exist`);
    const { x: Aleft, y: Atop, x2: Aright, y2: Abot, cx: Acx, cy: Acy } = this.GetScreenBBox();
    const { x: Bleft, y: Btop, x2: Bright, y2: Bbot, cx: Bcx, cy: Bcy } = target.GetScreenBBox();
    // find shortest distance between THIS and TARGET
    // eliminate negative values
    const distances = [
      { side: 't', d: Atop - Bbot },
      { side: 'r', d: Bleft - Aright },
      { side: 'b', d: Btop - Abot },
      { side: 'l', d: Aleft - Bright }
    ].filter(item => {
      return item.d > 0;
    });
    // sort by ascending distance
    distances.sort((foo, bar) => {
      if (foo.d < bar.d) return -1;
      if (foo.d > bar.d) return 1;
      return 0;
    });
    if (DBG)
      console.log(
        `${this.Id()} sees ${distances.length} potential outedges to ${targetId}`,
        distances
      );

    // if no drawable line (e.g. overlapping) then return no line
    if (distances.length === 0) return {}; // no drawable line

    // let's make a helper function to create an object
    // return { pt1:{ x,y,d, up }, pt2:{ x,y,d, up } }
    function makePtObj(side, x1, y1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const d = Math.sqrt(dx * dx + dy * dy);
      const up = Math.min(1000, d) / 1000; // should be based on viewport size
      return {
        pt1: { x: x1, y: y1, d, up },
        pt2: { x: x2, y: y2, d, up }
      };
    }

    // return the points from source (x1,y1) to target (x2,y2)
    const longest = distances[distances.length - 1];
    switch (longest.side) {
      case 't':
        return makePtObj('t', Acx, Atop, Bcx, Bbot);
      case 'r':
        return makePtObj('r', Aright, Acy, Bleft, Bcy);
      case 'b':
        return makePtObj('b', Acx, Abot, Bcx, Btop);
      case 'l':
        return makePtObj('l', Aleft, Acy, Bright, Bcy);
      default:
        throw Error(`unxpected side value ${longest.side}`);
    }
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
    // draw box
    this.visBG
      .fill({ color: this.fill, opacity: 0.1 })
      //      .stroke({ color: this.fill, width: 2 })
      .radius(DIM_RADIUS);
    // draw label
    this.gDataName.transform({ translateX: m_pad, translateY: m_pad / 2 });
    // draw evidence labels on right side of prop
    let evWidth = 28;
    if (this.gDataEvidenceBadge) {
      this.gDataEvidenceBadge.forEach((ev, index) => {
       ev.transform({ translateX: this.width - evWidth * (index + 1) - 4, translateY: m_pad / 2 + 3 });
      });
    }
    if (this.gDataEvidenceLabel) {
      this.gDataEvidenceLabel.forEach((ev, index) => {
       ev.transform({ translateX: this.width - evWidth * (index + 1) + evWidth / 3 - 4, translateY: m_pad / 2 + 7 });
      });
    }
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

    // Evidence
    const evArr = DATA.PropEvidence(this.id);
    this.gDataEvidenceBadge = [];
    this.gDataEvidenceLabel = [];
    if (evArr) {
      // When adding the evidence badges, we have to move them to the current location
      evArr.forEach((evId) => {
        this.gDataEvidenceBadge.push(
          this.gData
            .circle(25)
            .fill('#b2dfdb')
            .move(x, y)
        );
        this.gDataEvidenceLabel.push(
          this.gData
            .text(evId)
            .font({ fill: '#fff', size: '0.8em', weight: 'bold' })
            .move(x, y)
        );
      });
    }

    this.Draw({ x, y });
  }
}

/// STATIC CLASS METHODS //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Allocate VProp instances through this static method. It maintains
 *  the collection of all allocated visuals
 */
VProp.New = (id, svgRoot) => {
  if (DATA.VM_VProp(id)) throw Error(`${id} is already allocated`);
  if (svgRoot.constructor.name !== 'Svg') throw Error(`arg2 must be SVGJS draw instance`);
  const vprop = new VProp(id, svgRoot);
  DATA.VM_VPropSet(id, vprop);
  return vprop;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  De-allocate VProp instance by id.
 */
VProp.Release = id => {
  const vprop = DATA.VM_VProp(id);
  DATA.VM_VPropDelete(id);
  return vprop.Release();
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Update instance from associated data id
 */
VProp.Update = id => {
  const vprop = DATA.VM_VProp(id);
  vprop.Update();
  return vprop;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Given a nodeId, add its associated VProp to the designated parent. After
 *  this is done, moving the parent VProp will also move its children.
 *  `parentId`. Transformations are preserved so it will not "jump".
 *  @param {string} id - the key for getting the associated VProp
 *  @param {string} parentId - the key for the parent VProp. If null, will move
 *  to the root SVG canvas.
 */
VProp.MoveToParent = (id, parentId) => {
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
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Given a nodeId, move the associated VProp to the svg root canvas, All PMC
 * properties that are also a Component are drawn on the root canvas.
 *  @param {string} id - the key for getting the associated VProp
 */
VProp.MoveToRoot = id => {
  VProp.MoveToParent(id);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Return the VProp associated with the passed nodeId
 * @param {string} id - the key for getting the associated VProp
 * @returns {VProp} - the retrieved VProp instance
 */
VProp.GetVisual = id => {
  return DATA.VM_VProp(id);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Move a VProp to the x,y screen location. The origin is set by the root SVG canvas' transform.
 * @param {string} id - the key for getting the associated VProp
 * @param {number} x - the x coordinate
 * @param {number} y - the y coordinate
 * @returns {VProp} - the VProp instance that was moved
 */
VProp.Move = (id, x, y) => {
  if (!id) throw Error(`arg1 must be valid string id`);
  const vprop = DATA.VM_VProp(id);
  vprop.Move({ x, y });
  return vprop;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Set the size of a VProp, which is the size of its background rect. This call
 * is used by the layout pass and probably should be changed so the size is set
 * explicitly by the VProps data fields, not externally.
 * @param {string} id - the key for getting the associated VProp
 * @param {number} w - the width to set
 * @param {number} h - the height to set
 * @returns {VProp} - the VProp instance that was sized
 */
VProp.SetSize = (id, w, h) => {
  if (!id) throw Error(`arg1 must be valid string id`);
  const vprop = DATA.VM_VProp(id);
  vprop.SetSize(w, h);
  return vprop;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Retrieve the size of a VProp in width and height
 * @param {string} id - the key for getting the associated VProp
 * @returns {object} - { id, w, h }
 * @example
 * const {id, w, h} = VProp.GetSize('a');
 */
VProp.GetSize = id => {
  if (!id) throw Error(`arg1 must be valid string id`);
  const vprop = DATA.VM_VProp(id);
  return { id: vprop.Id(), w: vprop.Width(), h: vprop.Height() };
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  LIFECYCLE: SizeToContents sizes all the properties to fit their contained props
 *  based on their display state
 */
VProp.LayoutComponents = () => {
  const components = DATA.Components();
  // then dp ;aupit
  let xCounter = PAD.MIN2;
  let yCounter = PAD.MIN2;

  // walk through all components
  // for each component, get the size of all children
  // set background size to it
  components.forEach(id => {
    // get the Visual
    console.groupCollapsed(`%c:layout component ${id}`, cssinfo);
    u_Layout({ x: xCounter, y: yCounter }, id);
    const compVis = DATA.VM_VProp(id);
    const compHeight = compVis.Height();
    highHeight = Math.max(compHeight, highHeight);
    xCounter += compVis.GetSize().width + PAD.MIN2;
    if (xCounter > 700) {
      yCounter += highHeight + PAD.MIN2;
      xCounter = PAD.MIN2;
      highHeight = 0;
    }
    console.groupEnd();
  });
};

let highHeight = 0;

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
if (!window.meme) window.meme = {};
window.meme.vprops = () => {
  console.log(`%cattaching props to window by [id]`, cssdata);
  let props = DATA.AllProps();
  props.forEach(pid => {
    window[pid] = DATA.VM_VProp(pid);
  });
  return `${props} attached to window object`;
};
window.meme.comps = () => {
  console.log(`%cshowing components`, cssdata);
  let comps = DATA.Components();
  comps.forEach(id => {
    console.log(`[${id}]`);
  });
  return `${comps.length} components listed`;
};
window.meme.dumpid = id => {
  console.log(`%cdumping id [${id}] child hierarchy`, cssdata);
  recurse(id);
  /* helper */
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
export default VProp;
