/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  A VGMech is the visual representation of connection between properties
  in our ViewGraph.

  extern DATA is the graph

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import DATA from './pmc-data';
import { cssinfo, cssdraw, csstab, csstab2, cssblue, cssdata } from './console-styles';
import { VPathId } from './defaults';

/// PRIVATE DECLARATIONS //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const map_paths = DATA.VM.map_paths; // the paths being drawn by system
const m_up = 150;
const m_blen = 55;
const COL_BG = '#44F';
const DBG = false;

/// PRIVATE HELPERS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// accepts either edgeObj or v,w as parameters
function m_GetSVGPath(vso, ws) {
  const pathId = VPathId(vso, ws);
  const vmech = DATA.GetVPath(pathId);
  if (!vmech) throw Error(`vmech '${pathId}' not found`);
  return vmech;
}
function m_GetSVGPathString(p1, p2) {
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
    this.data = Object.assign({}, DATA.Mech(pathId)); // copy, not reference
    // higher order display properties
    this.dataDisplayMode = {}; // how to display data, what data to show/hide
    this.connectionPoints = []; // array of points available for mechanism connections
    this.highlightMode = {}; // how to display selection, subselection, hover
    this.svgPath = null;

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
    if (this.svgPath) this.svgPath.remove();
  }

  Update(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    // update data by copying
    const data = DATA.Mech(p1.id, p2.id);
    this.data.name = data.name;
    //
    if (this.svgPath) {
      this.svgPath.plot(m_GetSVGPathString(p1, p2));
    }
  }
}

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const VGMechanisms = {};

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
 *  Allocate VGProp instances through this static method. It maintains
 *  the collection of all allocated visuals
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
VGMechanisms.New = (edgeObj, svgRoot) => {
  const pathId = VPathId(edgeObj);
  if (DATA.VM_VMechExists(edgeObj)) throw Error(`${pathId} is already allocated`);
  if (svgRoot.constructor.name !== 'Svg') throw Error(`arg2 must be SVGJS draw instance`);
  const vmech = new VGMech(edgeObj, svgRoot);
  DATA.VM_VMechSet(pathId, vmech);
  return vmech;
};
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
 *  De-allocate VGProp instance by id.
 *  accepts either edgeObj or v,w
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
VGMechanisms.Release = (vso, ws) => {
  const pathId = VPathId(vso, ws);
  const vmech = m_GetSVGPath(pathId);
  DATA.VM_VMechDelete(pathId);
  return vmech.Release();
};
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
 *  Update instance from associated data id
 *  accepts either edgeObj or v,w
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
VGMechanisms.Update = (vSO, wS) => {
  const vmech = m_GetSVGPath(vSO, wS);
  vmech.Update();
  return vmech;
};
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
 *  Return the SVGPath from the ViewModel data by either edgeObj or v,w
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
VGMechanisms.Get = (vso, ws) => {
  return m_GetSVGPath(vso, ws);
};
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
    Draw the model data by calling draw commands on everything. Also update.
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
VGMechanisms.DrawEdges = () => {
  console.log(DATA.VM.map_vmechs);
  console.log(`drawing ${DATA.VM.map_vmechs.size} edges`);
};

/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default VGMechanisms;
