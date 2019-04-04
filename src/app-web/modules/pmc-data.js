/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  MODEL and VIEWMODEL data

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { Graph, alg as GraphAlg, json as GraphJSON } from '@dagrejs/graphlib';
import { cssinfo, cssreset, cssdata } from './console-styles';
import { CoerceToPathId, CoerceToEdgeObj } from './defaults';

/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;

/// MODEL /////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let m_graph; // dagresjs/graphlib instance
let a_props = []; // all properties (strings)
let a_mechs = []; // all mechanisms (pathId strings)
//
let a_components = []; // top-level props with no parents
let h_children = new Map(); // children hash of each prop by id
let h_outedges = new Map(); // outedges hash of each prop by id

/// VIEWMODEL /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const map_vprops = new Map(); // our property viewmodel data stored by id
const map_vmechs = new Map(); // our mechanism viewmodel data stored by pathid

/// MODULE DECLARATION ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DATA = {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DATA.Graph = () => {
  return m_graph;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DATA.LoadGraph = () => {
  const g = new Graph({ directed: true, compound: true, multigraph: true });

  /** insert graph definition here *******************************************/

  /// g.setNode('a', { name: 'a node' });
  g.setNode('a', { name: 'a node' });
  g.setNode('b', { name: 'b node' });
  g.setNode('c', { name: 'c node' });
  g.setNode('d', { name: 'd node' });
  g.setNode('e', { name: 'e node' });
  g.setNode('f', { name: 'f node' });
  g.setNode('g', { name: 'g node' });
  g.setNode('x', { name: 'x node' });
  g.setNode('y', { name: 'y node' });
  g.setNode('z', { name: 'z node' });
  /// g.setParent('a','b')
  g.setParent('a', 'b');
  g.setParent('c', 'd');
  g.setParent('e', 'd');
  g.setParent('f', 'd');
  g.setParent('g', 'a');
  g.setParent('y', 'd');
  /// g.setEdge('a', 'b', { name: 'a-b' });
  g.setEdge('z', 'x', { name: 'zexxxxy!' });
  g.setEdge('g', 'd', { name: 'alpha>' });
  g.setEdge('y', 'z', { name: 'datum' });
  g.setEdge('a', 'g', { name: 'atog' });

  /***************************************************************************/

  // test serial write out, then serial read back in
  const cleanGraphObj = GraphJSON.write(g);
  const json = JSON.stringify(cleanGraphObj);
  m_graph = GraphJSON.read(JSON.parse(json));
  DATA.BuildModel();
}; // LoadGraph()

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DATA.BuildModel = () => {
  // test graphlib
  a_props = m_graph.nodes(); // returns node ids
  a_mechs = m_graph.edges(); // returns edgeObjects {v,w}
  a_components = [];
  h_children = new Map(); // property children
  h_outedges = new Map(); // outedges for each prop
  /*/
   *  a_components is an array of ids of top-level props
   *  h_children maps prop ids to arrays of ids of child props,
   *  including children of children
   *  h_outedges maps all the outgoing edges for a node
  /*/
  a_props.forEach(n => {
    const p = m_graph.parent(n);
    if (!p) {
      a_components.push(n);
    }
    //
    const children = m_graph.children(n);
    let arr = h_children.get(n);
    if (arr) arr.push.apply(children);
    else h_children.set(n, children);
    //
    const outedges = m_graph.outEdges(n); // an array of edge objects {v,w,name}
    arr = h_outedges.get(n) || [];
    outedges.forEach(key => {
      arr.push(key.w);
    });
    h_outedges.set(n, arr);
  });

  if (!DBG) return;
  console.groupCollapsed('%cBuildModel()%c Nodes and Edges', cssinfo, cssreset);
  console.log(`arry a_components`, a_components);
  console.log(`hash h_children`, h_children);
  console.log(`hash h_outedges`, h_outedges);
  console.groupEnd();
};

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DATA.AllProps = () => {
  return a_props;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DATA.AllMechs = () => {
  return a_mechs;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DATA.Components = () => {
  return a_components;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DATA.Children = id => {
  return h_children.get(id) || [];
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DATA.HasProp = id => {
  return m_graph.hasNode(id);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DATA.HasMech = (evo, ew) => {
  const eobj = CoerceToEdgeObj(evo, ew);
  return m_graph.hasEdge(eobj);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DATA.Prop = id => {
  const prop = m_graph.node(id);
  if (prop) return prop;
  throw Error(`no prop with id '${id}' exists`);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DATA.Mech = (evo, ew) => {
  const eobj = CoerceToEdgeObj(evo, ew);
  return m_graph.edge(eobj);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
called by PMCViewGraph to figure out what is new in the datagraph
compared to what it already has, so it can add/remove/update its
visual components from the data
/*/
DATA.VM_GetVPropChanges = () => {
  // remember that a_props is an array of string ids, not objects
  // therefore the returned arrays have values, not references! yay!
  const added = [];
  const updated = [];
  const removed = [];
  // find what matches and what is new
  a_props.forEach(id => {
    if (map_vprops.has(id)) updated.push(id);
    else added.push(id);
  });
  // removed ids exist in viewmodelPropMap but not in updated props
  map_vprops.forEach((val, id) => {
    if (!updated.includes(id)) removed.push(id);
  });
  return { added, removed, updated };
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - s- - - - - - - - - -
DATA.VM_VPropExists = id => {
  return map_vprops.has(id);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - s- - - - - - - - - -
DATA.VM_VProp = id => {
  return map_vprops.get(id);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - s- - - - - - - - - -
DATA.VM_VPropDelete = id => {
  map_vprops.delete(id);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - s- - - - - - - - - -
DATA.VM_VPropSet = (id, vprop) => {
  map_vprops.set(id, vprop);
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DATA.VM_GetVMechChanges = () => {
  // remember that a_mechs is an array of { v, w } edgeObjects.
  const added = [];
  const updated = [];
  const removed = [];
  // find what matches and what is new by pathid
  a_mechs.forEach(edgeObj => {
    const pathId = CoerceToPathId(edgeObj);
    if (map_vmechs.has(pathId)) {
      updated.push(pathId);
      console.log('updated', pathId);
    } else {
      added.push(pathId);
      console.log('added', pathId);
    }
  });
  // removed
  map_vmechs.forEach((val_vmech, key_pathId) => {
    if (!updated.includes(key_pathId)) {
      removed.push(key_pathId);
      console.log('removed', key_pathId);
    }
  });
  return { added, removed, updated };
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - s- - - - - - - - - -
DATA.VM_VMechExists = (vso, ws) => {
  const pathId = CoerceToPathId(vso, ws);
  return map_vmechs.has(pathId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - s- - - - - - - - - -
DATA.VM_VMech = (vso, ws) => {
  const pathId = CoerceToPathId(vso, ws);
  return map_vmechs.get(pathId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - s- - - - - - - - - -
DATA.VM_VMechDelete = (vso, ws) => {
  const pathId = CoerceToPathId(vso, ws);
  map_vmechs.delete(pathId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - s- - - - - - - - - -
DATA.VM_VMechSet = (vmech, vso, ws) => {
  const pathId = CoerceToPathId(vso, ws);
  map_vmechs.set(pathId, vmech);
};
/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - s- - - - - - - - - -
DATA.VM = { map_vprops, map_vmechs };
export default DATA;
