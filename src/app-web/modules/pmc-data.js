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

  /**
   *    Student Examples
   *
   *    These are four examples of student work based on student sketches.
   *    To use them, first comment out the nodes above that you're not interested in,
   *    then uncomment the section below that you ARE interested in and save to reload.
   * 
   */
  
  // // 3.5.19 sample model for group 3.pdf
  // // Sample for Group 3
  // g.setNode('title', { name: 'Sample for Group 3' });
  // g.setNode('foxes', { name: 'Fox' });
  // g.setNode('foxes-amount', { name: 'amount' });
  // g.setNode('rabbit', { name: 'Rabbit' });
  // g.setNode('rabbit-furcolor', { name: 'fur color' });
  // g.setNode('rabbit-amount', { name: 'amount' });
  // g.setNode('rabbits', { name: 'Rabbits' });
  // g.setNode('rabbits-furcolor', { name: 'fur color' });
  // g.setNode('plants', { name: 'Thicket' });
  // g.setNode('bacteria', { name: 'Bacteria?' });
  // g.setNode('oldage', { name: 'Old age?' });
  // g.setNode('properties', { name: 'Make sure to talk properties' });
  // g.setParent('foxes-amount', 'foxes');
  // g.setParent('rabbit-furcolor', 'rabbit');
  // g.setParent('rabbit-amount', 'rabbit');
  // g.setParent('rabbits-furcolor', 'rabbits');
  // g.setEdge('foxes', 'rabbit', { name: 'eat' });
  // g.setEdge('rabbit', 'rabbits', { name: 'tries to hide' });
  // g.setEdge('rabbits', 'plants', { name: 'hiding' });

  // 3.5.19 Day 1 Group 4 sample model.pdf
  // // Sample for Group 4
  // g.setNode('title', { name: 'Sample for Group 4' });
  // g.setNode('foxes', { name: 'Foxes' });
  // g.setNode('foxes-amount', { name: 'amount: 2' });
  // g.setNode('rabbits', { name: 'Rabbits' });
  // g.setNode('rabbits-amount', { name: 'amount: 20' });
  // g.setNode('plants', { name: 'Plants' });
  // g.setNode('forest', { name: 'Forest' });
  // g.setParent('foxes-amount', 'foxes');
  // g.setParent('rabbits-amount', 'rabbits');
  // g.setEdge('foxes', 'rabbits', { name: 'eat' });
  // g.setEdge('rabbits', 'plants', { name: 'eat' });
  // g.setEdge('forest', 'foxes', { name: 'live in' });
  // g.setEdge('forest', 'rabbits', { name: 'live in' });

  // // day2_group4_model_02.JPG
  // // Sample for Group 3
  // g.setNode('title', { name: 'Day 2 Group 4 Model 2: "Food Water Cleaning System' });
  // g.setNode('ammonia', { name: 'Ammonia' });
  // g.setNode('dirty-water', { name: 'dirty water' });
  // g.setNode('dirty-water-waste', { name: 'waste' });
  // g.setNode('dirty-water-algee', { name: 'algee' });
  // g.setNode('tank', { name: 'big enough fish tank' });
  // g.setNode('fish', { name: 'fish' });
  // g.setNode('food', { name: 'food' });
  // g.setNode('rotting-food', { name: 'rotting food' });
  // g.setNode('cleaning', { name: 'cleaning system?' });
  // g.setNode('clean-water', { name: 'clean water' });
  // g.setParent('dirty-water-waste', 'dirty-water');
  // g.setParent('dirty-water-algee', 'dirty-water');
  // g.setEdge('ammonia', 'fish', { name: 'death' });
  // g.setEdge('fish', 'ammonia', { name: 'makes' });
  // g.setEdge('fish', 'dirty-water', { name: 'waste' });
  // g.setEdge('dirty-water', 'fish', { name: 'death' });
  // g.setEdge('tank', 'fish', { name: 'live in' });
  // g.setEdge('fish', 'food', { name: 'eat' });
  // g.setEdge('food', 'rotting-food', { name: '' });
  // g.setEdge('cleaning', 'clean-water', { name: 'clean' });
  // g.setEdge('clean-water', 'fish', { name: 'live in' });
  // g.setEdge('rotting-food', 'clean-water', { name: 'if rots can also make dirty' });


  // // 3.5.19 Day 1 Group 3 Brainstomring list and Final Model.pdf
  // g.setNode('title', { name: 'Day 1 Group 3 Brainstorming List' });
  // g.setNode('fish', { name: 'Fish' });
  // g.setNode('fish-how-many', { name: 'how many' });
  // g.setNode('fish-how-big', { name: 'how big' });
  // g.setNode('fish-camo', { name: 'camo' });
  // g.setNode('fish-how-healthy', { name: 'how healthy' });
  // g.setNode('food', { name: 'food' });
  // g.setNode('aquarium', { name: 'aquarium' });
  // g.setNode('water-type', { name: 'water type' });
  // g.setNode('water-how-clean', { name: 'how clean water is' });
  // g.setNode('aquarium-setup', { name: 'setup' });
  // g.setNode('aquarium-space', { name: 'space in aquarium' });
  // /**
  //  * Comment out the setParents to show graph as students originally drew it
  //  * The setParents reworks the items as propoerties of fish and aquarium
  //  *  */
  // // g.setParent('fish-how-big', 'fish');
  // // g.setParent('fish-how-many', 'fish');
  // // g.setParent('fish-camo', 'fish');
  // // g.setParent('fish-how-healthy', 'fish');
  // // g.setParent('water-type', 'aquarium');
  // // g.setParent('aquarium-setup', 'aquarium');
  // // g.setParent('aquarium-space', 'aquarium');
  // // g.setParent('water-how-clean', 'water-type');
  // g.setEdge('fish', 'fish-how-big', { name: '' });
  // g.setEdge('fish', 'fish-how-many', { name: '' });
  // g.setEdge('fish', 'fish-camo', { name: 'what type' });
  // g.setEdge('fish', 'fish-how-healthy', { name: '' });
  // g.setEdge('fish', 'food', { name: '' });
  // g.setEdge('fish', 'aquarium', { name: 'Live in it' });
  // g.setEdge('fish-how-big', 'aquarium-space', { name: '' });
  // g.setEdge('fish-how-healthy', 'fish-how-many', { name: '' });
  // g.setEdge('fish-how-healthy', 'food', { name: '' });
  // g.setEdge('fish-how-healthy', 'water-how-clean', { name: '' });
  // g.setEdge('fish-how-healthy', 'aquarium-setup', { name: '' });
  // g.setEdge('fish-how-healthy', 'aquarium-space', { name: '' });
  // g.setEdge('food', 'water-type', { name: 'stays at top or rot' });
  // g.setEdge('water-how-clean', 'fish', { name: 'how long they live could depend on this' });
  // g.setEdge('aquarium', 'water-type', { name: 'water in aquarium' });
  // g.setEdge('aquarium', 'aquarium-setup', { name: '' });
  // g.setEdge('aquarium', 'aquarium-space', { name: '' });
  // g.setEdge('water-type', 'water-how-clean', { name: '' });
  // g.setEdge('water-type', 'aquarium-space', { name: 'more or less water purifier' });
  // g.setEdge('aquarium-setup', 'aquarium-space', { name: 'more or less decoration depends on size' });


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
