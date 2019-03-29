/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  A VGMech is the visual representation of connection between properties
  in our ViewGraph.

  extern DATA is the graph

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import DATA from './pmc-data';
import { cssinfo, cssdraw, csstab, csstab2, cssblue, cssdata } from './console-styles';
import { VPathId, ArrayFromABO } from './defaults';

/// PRIVATE DECLARATIONS //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const map_paths = DATA.VM.map_paths;
const m_up = 150;
const m_blen = 55;
const COL_BG = '#44F';
const DBG = false;

/// PRIVATE HELPERS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_GetPath(vSO, wS) {
  const [v, w] = ArrayFromABO(vSO, wS);
  const pathId = VPathId(v, w);
  const vmech = map_paths.get(pathId);
  if (!vmech) throw Error(`vmech '${vmech}' not found`);
  return vmech;
}
function m_GetPathString(p1, p2) {
  let pstring = `M${p1.x},${p1.y} C${p1.x},${p1.y - m_up} ${p2.x},${p2.y - m_up} ${p2.x},${p2.y}`;
  return pstring;
}

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class VGMech {
  constructor(edgeObj, svgRoot) {
    const pathId = VPathId(edgeObj);
    if (!DATA.HasMech(edgeObj)) throw Error(`${pathId} is not in graph data`);
    // basic display props
    this.id = pathId;
    this.v = edgeObj.v;
    this.w = edgeObj.w;
    this.data = Object.assign({}, DATA.Mech(pathId)); // copy, not reference
    // higher order display properties
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

  // drawing interface
  Draw() {
    console.log(`drawing ${this.id}`);
  }

  // "destructor"
  Release() {
    return this.gPath.remove();
  }

  Update(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    // update data by copying
    const data = DATA.Mech(p1.id, p2.id);
    this.data.name = data.name;
    //
    this.gPath.plot(m_GetPathString(p1, p2));
  }
}

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const VGMechanisms = {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
 *  Allocate VGProp instances through this static method. It maintains
 *  the collection of all allocated visuals
/*/
VGMechanisms.New = (id, svgRoot) => {
  if (map_paths.has(id)) throw Error(`${id} is already allocated`);
  if (svgRoot.constructor.name !== 'Svg') throw Error(`arg2 must be SVGJS draw instance`);
  const vmech = new VGMech(id, svgRoot);
  map_paths.set(id, vmech);
  return vmech;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
 *  De-allocate VGProp instance by id.
/*/
VGMechanisms.Release = id => {
  const vmech = m_GetPath(id);
  map_paths.delete(id);
  return vmech.Release();
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
 *  Update instance from associated data id
/*/
VGMechanisms.Update = id => {
  const vmech = m_GetPath(id);
  vmech.Update();
  return vmech;
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
VGMechanisms.GetPath = id => {
  return m_GetPath(id);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
VGMechanisms.SetPath = (sId, dId) => {
  const pathId = VPathId(sId, dId);
  if (!map_paths.has(pathId)) throw Error(`${pathId} isn't allocated, so can't set path`);
};

/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default VGMechanisms;
