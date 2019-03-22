/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  A VGProp is the visual representation of a component OR property in
  our ViewGraph. It is designed to worth with IDs that are
  used to fetch the underlying graph data to refresh its viewmodel.

  THINKING ALOUD....
  (1) use the static method New() to create the viewmodel for the component.
  this adds it to the map_visuals map, which becomes our render list

  (2) VGProp receives a SVGJS Draw instance

  the VGProp fetches its data representation from DATA directly
  id
  data
  cx, cy, width, height, bbox

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import DATA from './pmc-data';

/// PRIVATE DECLARATIONS //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const map_visuals = new Map();
const m_width = 200;
const m_height = 50;
const m_pad = 10;
const COL_BG = '#F06';
const DIM_RADIUS = 3;
let x_counter = 0;
let y_counter = 0;

/// PRIVATE HELPERS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class VGProp {
  constructor(propId, svgRoot) {
    if (typeof propId !== 'string') throw Error(`require string id`);
    if (!DATA.HasProp(propId)) throw Error(`${propId} is not in graph data`);
    // basic display props
    this.id = propId;
    this.data = Object.assign({}, DATA.Prop(propId)); // copy, not reference
    this.svg = svgRoot.group();
    // higher order display properties
    this.dataDisplayMode = {}; // how to display data, what data to show/hide
    this.connectionPoints = []; // array of points available for mechanism connections
    this.highlightMode = {}; // how to display selection, subselection, hover
    const x = x_counter * (m_width + m_pad) + m_pad;
    const y = y_counter * (m_height + m_pad) + m_pad;
    if (++x_counter > 4) {
      x_counter = 0;
      ++y_counter;
    }
    this.Draw({ x, y });
  }

  // drawing interface
  Draw(point) {
    this.svg.clear();
    this.svg
      .rect(m_width, m_height)
      .fill(COL_BG)
      .radius(DIM_RADIUS);
    console.log(this.data.name);
    this.svg.text(this.data.name).move(10, 5);
    if (point) this.svg.move(point.x, point.y);
  }

  // "destructor"
  Release() {
    this.svg.remove();
  }

  //
  Update() {
    // update data by copying
    const data = DATA.Prop(this.id);
    this.data.name = data.name;
    // preserve layout
    const x = this.svg.x();
    const y = this.svg.y();
    this.Draw({ x, y });
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
  if (!map_visuals.has(id)) throw Error(`${id} isn't allocated, so can't release`);
  const vprop = map_visuals.get(id);
  vprop.Release();
  map_visuals.delete(id);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
 *  Update instance from associated data id
/*/
VGProperties.Update = id => {
  if (!map_visuals.has(id)) throw Error(`${id} isn't allocated, so can't update`);
  const vprop = map_visuals.get(id);
  vprop.Update();
  return vprop;
};

/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
window.vgp = VGProperties;

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default VGProperties;
