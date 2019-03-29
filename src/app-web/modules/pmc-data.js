/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  MODEL and VIEWMODEL data

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { Graph, alg as GraphAlg, json as GraphJSON } from '@dagrejs/graphlib';
import { cssinfo, cssreset, cssdata } from './console-styles';
import { VPathId, ArrayFromABO } from './defaults';

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
// used by vg-properties
const map_visuals = new Map();
// used by vg-mechanisms.js
const map_paths = new Map(); // vmech visuals stored by pathId
// used by pmc-viewgraph
const map_vmprops = new Map(); // our property viewmodel data
const map_vmmechs = new Map(); // our mechanism viewmodel data

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
  g.setNode('a', { name: 'a property', data: {} });
  g.setNode('b', { name: 'b property', data: {} });
  g.setNode('c', { name: 'c property', data: {} });
  g.setNode('d', { name: 'd property', data: {} });
  g.setNode('e', { name: 'e property', data: {} });
  g.setNode('f', { name: 'f property', data: {} });
  g.setNode('x', { name: 'x property', data: {} });
  g.setNode('y', { name: 'y property', data: {} });
  g.setNode('z', { name: 'z property', data: {} });
  g.setParent('d', 'a');
  g.setParent('e', 'a');
  g.setParent('f', 'b');
  g.setParent('x', 'c');
  g.setParent('y', 'x');
  g.setParent('z', 'c');
  g.setParent('b', 'z');
  g.setEdge('b', 'a', { name: 'b to a' });
  g.setEdge('b', 'd', { name: 'b to d' });
  g.setEdge('c', 'e', { name: 'c to e' });
  g.setEdge('e', 'b', { name: 'e to b' });
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
  if (typeof ew === 'number') return m_graph.hasEdge(evo, ew);
  return m_graph.hasEdge(evo);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DATA.Prop = id => {
  return m_graph.node(id);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DATA.Mech = (evo, ew) => {
  if (typeof ew === 'number') return m_graph.edge(evo, ew);
  return m_graph.edge(evo);
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
    if (map_vmprops.has(id)) updated.push(id);
    else added.push(id);
  });
  // removed ids exist in viewmodelPropMap but not in updated props
  map_vmprops.forEach((val, id) => {
    if (!updated.includes(id)) removed.push(id);
  });
  return { added, removed, updated };
};
DATA.VM_VPropDelete = id => {
  map_vmprops.delete(id);
};
DATA.VM_VPropSet = (id, vprop) => {
  map_vmprops.set(id, vprop);
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DATA.VM_GetVMechChanges = () => {
  // remember that a_mechs is an array of { v, w } edgeObjects.
  const added = [];
  const updated = [];
  const removed = [];
  // find what matches and what is new
  a_mechs.forEach(edgeObj => {
    if (map_vmmechs.has(edgeObj)) updated.push(edgeObj);
    else added.push(edgeObj);
  });
  // removed ids exist in viewmodelPropMap but not in updated props
  map_vmmechs.forEach((val, edgeObj) => {
    if (!updated.includes(edgeObj)) removed.push(edgeObj);
  });
  return { added, removed, updated };
};
DATA.VM_VMechDelete = edgeObj => {
  map_vmmechs.delete(edgeObj);
};
DATA.VM_VMechSet = (edgeObj, vmech) => {
  map_vmmechs.set(edgeObj, vmech);
};
/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - s- - - - - - - - - -
DATA.VM = { map_paths, map_vmprops, map_vmmechs, map_visuals };
export default DATA;
