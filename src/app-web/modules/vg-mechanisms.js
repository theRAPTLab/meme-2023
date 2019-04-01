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
import UR from '../../system/ursys';

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
function m_MakePathDrawingString(p1, p2) {
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
    this.data = Object.assign({}, DATA.Mech(edgeObj)); // copy, not reference
    this.sourceId = 0;
    this.targetId = 0;
    // higher order display properties
    this.dataDisplayMode = {}; // how to display data, what data to show/hide
    this.connectionPoints = []; // array of points available for mechanism connections
    this.highlightMode = {}; // how to display selection, subselection, hover
    this.path = svgRoot
      .path()
      .back()
      .fill('none')
      .stroke({ width: 4, color: 'orange', dasharray: '4 2' });
    this.pathLabel = svgRoot.text(add => {
      add.tspan(this.data.name);
    });
    this.pathLabel.fill('orange').attr('dy', -6);
    this.pathLabel.attr('text-anchor', 'end');
    this.textpath = this.pathLabel.path(this.path).attr('startOffset', this.path.length() - m_blen);
  }

  //
  Id() {
    return this.id;
  }

  // "destructor"
  Release() {
    if (this.path) this.path.remove();
  }

  Update(p1, p2) {
    // update data by copying
    const data = DATA.Mech(p1.id, p2.id);
    this.data.name = data.name;
    // save edge metadata
    let w = p1.id;
    let v = p2.id;
    this.sourceId = w;
    this.targetId = v;
    // plot path left-right
    if (this.path) {
      if (p1.x < p2.x) {
        this.path.plot(m_MakePathDrawingString(p1, p2));
        this.pathLabel.attr('text-anchor', 'end');
        this.textpath.attr('startOffset', this.path.length() - m_blen);
      } else {
        this.path.plot(m_MakePathDrawingString(p2, p1));
        this.pathLabel.attr('text-anchor', 'start');
        this.textpath.attr('startOffset', m_blen);
      }
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
  console.log('created vmech', vmech.id);
  DATA.VM_VMechSet(vmech, edgeObj);
  return vmech;
};
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
 *  De-allocate VGProp instance by id.
 *  accepts either edgeObj or v,w
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
VGMechanisms.Release = (vso, ws) => {
  const vmech = DATA.VM_VMech(vso, ws);
  DATA.VM_VMechDelete(vso, ws);
  console.log('released vmech', vmech.id);
  return vmech.Release();
};
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
 *  Update instance from associated data id
 *  accepts either edgeObj or v,w
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
VGMechanisms.Update = (vSO, wS) => {
  const vmech = DATA.VM_VMech(vSO, wS);
  console.log('update vmech', vmech);
  vmech.Update();
  return vmech;
};
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
 *  Return the SVGPath from the ViewModel data by either edgeObj or v,w
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
VGMechanisms.GetVisual = (vso, ws) => {
  return DATA.VM_VMech(vso, ws);
};
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
    Draw the model data by calling draw commands on everything. Also update.
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
VGMechanisms.DrawEdges = () => {
  console.group(`%c:drawing ${DATA.VM.map_vmechs.size} edges`, cssinfo);
  let edges = DATA.AllMechs();
  edges.forEach(edgeObj => {
    const src = DATA.VM_VProp(edgeObj.v);
    const dst = DATA.VM_VProp(edgeObj.w);
    const p1 = src.GetCenter();
    const p2 = dst.GetCenter();
    console.log(`${src.id}:${dst.id} (${p1.x},${p1.y}) to (${p2.x},${p2.y})`);
    const vmech = DATA.VM_VMech(edgeObj);
    vmech.Update(p1, p2);
  });
  console.groupEnd();
};

/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default VGMechanisms;
