/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  A VGMech is the visual representation of connection between properties
  in our ViewGraph.

  extern DATA is the graph

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import DATA from './pmc-data';
import { cssinfo, cssdraw, csstab, csstab2, cssblue, cssdata } from './console-styles';
import { CoerceToPathId, CoerceToEdgeObj } from './defaults';
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
  constructor(pathId, svgRoot) {
    if (!DATA.HasMech(pathId)) throw Error(`${pathId} is not in graph data`);
    // basic display props
    this.id = pathId;
    this.data = Object.assign({}, DATA.Mech(pathId)); // copy, not reference
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

  Update(srcId, tgtId) {
    const stype = typeof srcId;
    const ttype = typeof tgtId;

    if (srcId === undefined && tgtId === undefined) {
      // update data
      const data = DATA.Mech(this.sourceId, this.targetId);
      this.data.name = data.name;
      // no change in srcId or tgtId so return
      return;
    }
    if (stype === 'string' && ttype === 'string') {
      // valid id inputs
      this.sourceId = srcId;
      this.targetId = tgtId;

      // update visual data fields
      const data = DATA.Mech(this.sourceId, this.targetId);
      this.data.name = data.name;

      // update visual paths
      const src = DATA.VM_VProp(srcId);
      const dst = DATA.VM_VProp(tgtId);
      const srcPt = src.GetCenter();
      const tgtPt = dst.GetCenter();

      // plot path left-right
      if (this.path) {
        if (srcPt.x < tgtPt.x) {
          this.path.plot(m_MakePathDrawingString(srcPt, tgtPt));
          this.pathLabel.attr('text-anchor', 'end');
          this.textpath.attr('startOffset', this.path.length() - m_blen);
        } else {
          this.path.plot(m_MakePathDrawingString(tgtPt, srcPt));
          this.pathLabel.attr('text-anchor', 'start');
          this.textpath.attr('startOffset', m_blen);
        }
      }
    } else {
      throw Error('arg1 and arg2 must both be propIds or undefined');
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
VGMechanisms.New = (pathId, svgRoot) => {
  if (DATA.VM_VMechExists(pathId)) throw Error(`${pathId} is already allocated`);
  if (svgRoot.constructor.name !== 'Svg') throw Error(`arg2 must be SVGJS draw instance`);
  const vmech = new VGMech(pathId, svgRoot);
  console.log('created vmech', vmech.id);
  DATA.VM_VMechSet(vmech, pathId);
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
  const eobj = CoerceToEdgeObj(vSO, wS);
  const vmech = DATA.VM_VMech(eobj);
  console.log('update vmech', vmech);
  vmech.Update(eobj.v, eobj.w);
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
  // console.group(`%c:drawing ${DATA.VM.map_vmechs.size} edges`, cssinfo);
  let edges = DATA.AllMechs();
  edges.forEach(edgeObj => {
    const { v, w } = edgeObj;
    const vmech = DATA.VM_VMech(edgeObj);
    vmech.Update(v, w);
  });
  // console.groupEnd();
};

/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default VGMechanisms;
