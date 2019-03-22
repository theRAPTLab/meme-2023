/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  A VGComponent is the visual representation of a component OR property in
  our ViewGraph representation. It is designed to worth with IDs that are
  used to fetch the underlying graph data to refresh its viewmodel.

  THINKING ALOUD....
  (1) use the static method New() to create the viewmodel for the component.
  this adds it to the m_elements map, which becomes our render list

  (2) VGComponents receive a SVGJS Draw instance

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import DATA from './pmc-data';

/// PRIVATE DECLARATIONS //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const m_elements = new Map();
const m_width = 200;
const m_height = 10;
const COL_BG = '#F06';

/// PRIVATE HELPERS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class VGComponent {
  constructor(datumId) {
    if (datumId !== 'string') throw Error(`require string id`);
    if (!DATA.HasProp(datumId)) throw Error(`${datumId} is not in graph data`);
    // we keep a copy of the node id and data, not a reference
    this.id = datumId;
    this.data = Object.assign({}, DATA.Prop(datumId));
    // basic display properties
    this.cx = 0;
    this.cy = 0;
    this.width = m_width;
    this.height = m_height;
    this.bbox = []; // bounding box for layout purposes
    // higher order display properties
    this.dataDisplayMode = {}; // how to display data, what data to show/hide
    this.connectionPoints = []; // array of points available for mechanism connections
    this.highlightMode = {}; // how to display selection, subselection, hover
  }

  // drawing interface
  Draw(draw) {
    // draw is the SVGJS drawing object
    // we are supposed to draw our element according to internal state
    const rect = draw.rect(this.width, this.height);
    rect.fill(COL_BG);
    rect.move(this.cx, this.cy);
  }
}

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
VGComponent.New = id => {
  if (m_elements.has(id)) throw Error(`${id} is already allocated`);
  let c = new VGComponent(id);
  m_elements.set(id, c);
  return c;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
VGComponent.Release = id => {
  if (!m_elements.has(id)) throw Error(`${id} isn't allocated, so can't release`);
  m_elements.delete(id);
};

/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default VGComponent;
