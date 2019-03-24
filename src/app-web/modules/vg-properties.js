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
const m_width = 200;
const m_height = 30;
const m_pad = 5;
const COL_BG = '#F06';
const DIM_RADIUS = 3;

/// PRIVATE HELPERS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_VProp(id) {
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
    this.svgRoot = svgRoot.group();
    this.svg = this.svgRoot.group();
    this.fill = COL_BG;
    // higher order display properties
    this.svgRoot.draggable();
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
    const { x, y } = point;
    if (typeof x !== 'number') throw Error('arg1 x is not an number');
    if (typeof y !== 'number') throw Error('arg2 y is not an number');
    this.svg.move(x, y);
  }

  // drawing interface
  Draw(point) {
    console.log(`drawing ${this.id}`);
    this.svg.clear();
    // draw box
    this.svg
      .rect(m_width, m_height)
      .fill({ color: this.fill, opacity: 0.5 })
      .stroke({ color: this.fill, width: 2 })
      .radius(DIM_RADIUS);
    // draw label
    this.svg.text(this.data.name).move(10, 5);
    // move
    if (point) this.svg.move(point.x, point.y);
  }

  // "destructor"
  Release() {
    return this.svg.remove();
  }

  //
  ToParent(id) {
    const vparent = m_VProp(id);
    console.log(`${this.id}.svg.toParent(${id})`);
    return this.svg.toParent(vparent.svg);
  }

  //
  AddTo(id) {
    const vparent = m_VProp(id);
    console.log(`${this.id}.svg.addTo(${id})`);
    this.svg.move(100, 100);
    return this.svg.addTo(vparent.svg);
  }

  //
  ToRoot() {
    console.log(`${this.id}.svg.toRoot()`);
    return this.svg.toRoot();
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
  const vprop = m_VProp(id);
  map_visuals.delete(id);
  return vprop.Release();
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
 *  Update instance from associated data id
/*/
VGProperties.Update = id => {
  const vprop = m_VProp(id);
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
  const child = m_VProp(id);
  if (!parentId) return child.ToRoot();
  if (typeof parentId !== 'string') throw Error(`arg2 parentId must be a string`);
  child.Move({ x: m_height + m_pad, y: m_height + m_pad });
  return child.ToParent(parentId);
};
VGProperties.SetRoot = id => {
  VGProperties.SetParent(id);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
 *  SizeToContents sizes all the properties to fit their contained props
 *  based on their display state
/*/
VGProperties.SizeToContents = () => {
  let x_counter = 1;
  let y_counter = 1;
  const components = DATA.Components();
  // walk through all components
  components.forEach(id => {
    const x = x_counter * (m_width + m_pad) + m_pad;
    const y = y_counter * (m_height + m_pad) + m_pad;
    if (++x_counter > 4) {
      x_counter = 0;
      ++y_counter;
    }
    const vprop = m_VProp(id);
    console.log(`%chandling vprop ${id}`, cssinfo);
    vprop.Move({ x, y });
    const size = getSize(id);
    console.log(`vprop size ${size[0]},${size[1]}`);

    /** find size of children helper **/
    function getSize(kId) {
      const kids = DATA.Children(kId);
      let level = 1;
      const sizeArray = [];
      // my size is based on size of children
      // first get bounding box of each child
      kids.forEach(kinder => {
        const pad = level * 10;
        const s = getSize(kinder); // returns [w,h]
        console.log(`%ckid ${kinder} size [${s[0]},${s[1]}]`, `padding-left:${pad}px`);
        sizeArray.push(s);
        level += 1;
      });
      // now calculate my own size based on sizeArray
      // first my size is...
      const myWidth = 1;
      const myHeight = myWidth * 2;
      // second, include height,width of children
      const width = sizeArray.length;
      const height = width * 2;
      //
      return [myWidth + width, myHeight + height];
    }
  });
};

/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
window.vgp = VGProperties;

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default VGProperties;
