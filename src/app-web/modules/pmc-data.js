/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  prototype model based on dagresjs/graphlib

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/
import { Graph, alg as GraphAlg, json as GraphJSON } from '@dagrejs/graphlib';
import { cssinfo, cssdraw } from './console-styles';

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let m_graph; // dagresjs/graphlib instance
let arr_props = []; // all properties
let arr_components = []; // top-level props with no parents
let map_children = new Map(); // children array of each prop by id
let map_outedges = new Map(); // outedges array of each prop by id

const DATA = {};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DATA.Graph = () => {
  return m_graph;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DATA.LoadGraph = () => {
  const g = new Graph({ directed: true, compound: true, multigraph: true });
  g.setNode('a', { name: 'a node', data: { j: 1, k: 11, l: 111 } });
  g.setNode('b', { name: 'b node', data: { j: 2, k: 22, l: 222 } });
  g.setNode('c', { name: 'c node', data: { j: 3, k: 33, l: 333 } });
  g.setNode('d', { name: 'd node', data: { j: 4, k: 44, l: 444 } });
  g.setNode('e', { name: 'e node', data: { j: 5, k: 55, l: 555 } });
  g.setNode('f', { name: 'f node', data: { j: 6, k: 66, l: 667 } });
  g.setParent('c', 'a');
  g.setParent('d', 'c');
  g.setParent('f', 'a');
  g.setEdge('b', 'a', { name: 'b to a' });
  g.setEdge('b', 'd', { name: 'b to d' });
  g.setEdge('c', 'e', { name: 'c to e' });
  g.setEdge('e', 'b', { name: 'e to b' });
  // test serial write out, then serial read back in
  const cleanGraphObj = GraphJSON.write(g);
  const json = JSON.stringify(cleanGraphObj);
  m_graph = GraphJSON.read(JSON.parse(json));
  DATA.UpdateViewModel();
}; // LoadGraph()

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DATA.UpdateViewModel = () => {
  // test graphlib
  arr_props = m_graph.nodes(); // returns ids of nodes
  arr_components = [];
  map_children = new Map(); // property children
  map_outedges = new Map(); // outedges for each prop
  /*\
     * arr_components is an array of ids of top-level props
     * map_children maps prop ids to arrays of ids of child props,
     * including children of children
     * map_outedges maps all the outgoing edges for a node
    \*/
  arr_props.forEach(n => {
    const p = m_graph.parent(n);
    if (!p) {
      arr_components.push(n);
    }
    //
    const children = m_graph.children(n);
    let arr = map_children.get(n);
    if (arr) arr.push.apply(children);
    else map_children.set(n, children);
    //
    const outedges = m_graph.outEdges(n); // an array of edge objects {v,w,name}
    arr = map_outedges.get(n) || [];
    outedges.forEach(key => {
      arr.push(key.w);
    });
    map_outedges.set(n, arr);
  });
  console.log(`arr_components`, arr_components);
  console.log(`map_children`, map_children);
  console.log(`map_outedges`, map_outedges);
  /*\
     * to draw the container structure, perhaps
     * start with the parents and distribute them in available space.
     *
    \*/
  const numComponents = arr_components.length;
  console.log(`%cDrawing ${numComponents} arr_components`, cssinfo);
  // calculate size of a container by counting children
  arr_components.forEach(id => {
    console.log(`component ${id} size ${m_RecurseChildren(id)}`);
  });
  // calculate size of component based on all nested children};
};

/// PRIVATE HELPERS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_RecurseChildren(id) {
  let s = 10;
  const children = map_children.get(id) || [];
  children.forEach(child => {
    s += m_RecurseChildren(child);
  });
  return s;
}

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// INITIALIZATION ////////////////////////////////////////////////////////////

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default DATA;
