import { Graph, alg as GraphAlg, json as GraphJSON } from '@dagrejs/graphlib';
import { cssinfo, cssreset, cssdata } from './console-styles';
import DEFAULTS from './defaults';

const { CoerceToPathId, CoerceToEdgeObj } = DEFAULTS;

/// MODULE DECLARATION ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @module PMCData
 * @desc
 * A centralized data manager for graph data consisting of MEME properties and
 * mechanisms. Also provides derived structures used for building view models
 * for the user interface.
 *
 * The model, viewmodel, and view data elements all use the same kinds of id.
 * For properties and components, a string `nodeId` is used. For mechanisms
 * connecting properties, a string `pathId` consisting of the form
 * `sourcetNodeId:targetNodeId` is used internally. However, mechanism-related
 * API methods also accept dagres/graphlib's native `edgeObj` and `w,v`
 * syntax as well.
 * @example TO USE
 * import PMCData from `../modules/pmc-data`;
 * console.log(PMCData.Graph())
 */
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PMCData = {};

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;

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
const selected_vprops = new Set();
const selected_vmechs = new Set();

/// MODULE DECLARATION ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API: DATASTORE:
 * Returns the raw object database, which is an instance of Graphlib
 * @returns {Graph} - GraphlibJS object
 * @example
 * const model = PMCData.Graph();
 * const edges = model.edges();
 * console.log(`there are ${edges.length} edges in the graph!`);
 */
PMCData.Graph = () => {
  return m_graph;
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.DATASTORE:
 * Loads GraphLib data into data store (currently hardcoded)
 * @param {string} uri - (unimplemented) URI pointing to browser-accessible JSON-formatted data file
 */
PMCData.LoadGraph = uri => {
  const g = new Graph({ directed: true, compound: true, multigraph: true });

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
  PMCData.BuildModel();
}; // LoadGraph()

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.MODEL:
 *  Builds the PROPS, MECHS, COMPONENTS, CHILDREN, and OUTEDGES lists
 *  from the raw GraphLibJS data store.
 */
PMCData.BuildModel = () => {
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

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.MODEL:
 *  Return array of all the properties of the PMC model. Note that a PMC
 *  component is just a property that isn't a child of any other property.
 *  @returns {array} - array of nodeId strings
 */
PMCData.AllProps = () => {
  return a_props;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.MODEL:
 *  Return array of all the mechanisms of the PMC model.
 *  @returns {array} - array of pathId strings "sourceid:targetid"
 */
PMCData.AllMechs = () => {
  return a_mechs;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.MODEL:
 *  Return array of all the components of the PMC model. Note that a PMC
 *  component is just a property (node) that isn't a child of another property.
 *  @returns {array} - array of nodeId strings
 */
PMCData.Components = () => {
  return a_components;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.MODEL:
 *  Return array of all the children.
 *  @param {string} nodeId - the nodeId that might have children
 *  @returns {array} - an array of nodeId strings, or empty array
 */
PMCData.Children = nodeId => {
  return h_children.get(nodeId) || [];
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.MODEL:
 *  Returns TRUE if the passed nodeId exists in the graph data store
 *  @param {string} nodeId - the nodeId to test
 *  @returns {boolean} - true if the nodeId exists
 */
PMCData.HasProp = nodeId => {
  return m_graph.hasNode(nodeId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.MODEL:
 *  Returns TRUE if the passed edge exists. This function can accept one of
 *  three formats: an edgeObject, a pathId, or a source/target pair of nodeId strings
 *  @param {object|string} evo - edgeObj {w,v}, pathId, or nodeId string of source
 *  @param {string|undefined} ew - if defined, nodeId string of the target prop
 *  @returns {boolean} - true if the the edge exists
 */
PMCData.HasMech = (evo, ew) => {
  const eobj = CoerceToEdgeObj(evo, ew);
  return m_graph.hasEdge(eobj);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.MODEL:
 *  Given the passed nodeId string, returns the requested property object.
 *  This object is not a copy, so changing its properties will change the
 *  underlying data. If it the requested nodeId doesn't exist, an error is
 *  thrown.
 *  @param {string} nodeId - the nodeId you want
 *  @returns {object} - the property object
 */
PMCData.Prop = nodeId => {
  const prop = m_graph.node(nodeId);
  if (prop) return prop;
  throw Error(`no prop with id '${nodeId}' exists`);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.MODEL:
 *  Given the passed edge selector, returns the requested mechanism object.
 *  This object is not a copy, so changing it will change the
 *  underlying data. If it the requested edge doesn't exist, an error is
 *  thrown.
 *
 *  This function can accept one of three formats: an edgeObject, a pathId,
 *  or a source/target pair of nodeId strings.
 *  @param {object|string} evo - edgeObj {w,v}, pathId, or nodeId string of source
 *  @param {string|undefined} ew - if defined, nodeId string of the target prop
 */
PMCData.Mech = (evo, ew) => {
  const eobj = CoerceToEdgeObj(evo, ew);
  return m_graph.edge(eobj);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.VIEWMODEL:
 *  returns an object containing added, updated, removed arrays
 *  containing nodeId strings
 *  @return {object} - object { added, updated, removed }
 */
PMCData.VM_GetVPropChanges = () => {
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
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.VIEWMODEL:
 *  returns TRUE if a VProp corresponding to nodeId exists
 *  @param {string} nodeId - the property with nodeId to test
 *  @return {boolean} - true if the nodeId exists
 */
PMCData.VM_VPropExists = nodeId => {
  return map_vprops.has(nodeId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.VIEWMODEL:
 *  returns the VProp corresponding to nodeId if it exists
 *  @param {string} nodeId - the property with nodeId to retrieve
 *  @return {VProp} - VProp instance, if it exists
 */
PMCData.VM_VProp = nodeId => {
  return map_vprops.get(nodeId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.VIEWMODEL:
 *  deletes the VProp corresponding to nodeId if it exists
 *  @param {string} nodeId - the property with nodeId to delete
 */
PMCData.VM_VPropDelete = nodeId => {
  map_vprops.delete(nodeId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.VIEWMODEL:
 *  sets the VProp corresponding to nodeId
 *  @param {string} nodeId - the property with nodeId to add to viewmodel
 *  @param {VProp} vprop - the property with nodeId to add to viewmodel
 */
PMCData.VM_VPropSet = (nodeId, vprop) => {
  map_vprops.set(nodeId, vprop);
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.VIEWMODEL:
 *  returns an object containing added, updated, removed string arrays
 *  containing pathIds.
 */
PMCData.VM_GetVMechChanges = () => {
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
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.VIEWMODEL:
 *  returns TRUE if the designated edge exists.
 *
 *  This function can accept one of three formats: an edgeObject, a pathId,
 *  or a source/target pair of nodeId strings.
 *  @param {object|string} evo - edgeObj {w,v}, pathId, or nodeId string of source
 *  @param {string|undefined} ew - if defined, nodeId string of the target prop */
PMCData.VM_VMechExists = (evo, ew) => {
  const pathId = CoerceToPathId(evo, ew);
  return map_vmechs.has(pathId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.VIEWMODEL:
 *  returns the VMech corresponding to the designated edge if it exists
 *
 *  This function can accept one of three formats: an edgeObject, a pathId,
 *  or a source/target pair of nodeId strings.
 *  @param {object|string} evo - edgeObj {w,v}, pathId, or nodeId string of source
 *  @param {string|undefined} ew - if defined, nodeId string of the target prop
 */
PMCData.VM_VMech = (evo, ew) => {
  const pathId = CoerceToPathId(evo, ew);
  return map_vmechs.get(pathId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.VIEWMODEL:
 *  deletes the VMech corresponding to designated edge if it exists
 *
 *  This function can accept one of three formats: an edgeObject, a pathId,
 *  or a source/target pair of nodeId strings.
 *  @param {object|string} evo - edgeObj {w,v}, pathId, or nodeId string of source
 *  @param {string|undefined} ew - if defined, nodeId string of the target prop
 */
PMCData.VM_VMechDelete = (evo, ew) => {
  const pathId = CoerceToPathId(evo, ew);
  map_vmechs.delete(pathId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.VIEWMODEL:
 *  sets the VMech corresponding to the designated edge
 *
 *  This function can accept one of three formats: an edgeObject, a pathId,
 *  or a source/target pair of nodeId strings.
 *  @param {VMech} vmech - the VMech instance
 *  @param {object|string} evo - edgeObj {w,v}, pathId, or nodeId string of source
 *  @param {string|undefined} ew - if defined, nodeId string of the target prop
 */
PMCData.VM_VMechSet = (vmech, evo, ew) => {
  const pathId = CoerceToPathId(evo, ew);
  map_vmechs.set(pathId, vmech);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.VIEWMODEL:
 * add the vprop to the selection
 * @param {object} vprop - VProp instance with id property
 */
PMCData.VM_SelectProp = vprop => {
  // set appropriate vprop flags
  vprop.Select();
  vprop.Draw();
  // update viewmodel
  selected_vprops.add(vprop.id);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.VIEWMODEL:
 * remove th
 * @param {object} vprop - VProp instance with id property
 */
PMCData.VM_DeselectProp = vprop => {
  // set appropriate vprop flags
  vprop.visualState.Deselect();
  vprop.Draw();
  // update viewmodel
  selected_vprops.delete(vprop.id);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.VIEWMODEL:
 * remove th
 * @param {object} vprop - VProp instance with id property
 */
PMCData.VM_ToggleProp = vprop => {
  // set appropriate vprop flags
  vprop.visualState.ToggleSelect();
  // update viewmodel
  if (vprop.visualState.IsSelected()) {
    selected_vprops.add(vprop.id);
    if (selected_vprops.size === 1) {
      vprop.visualState.Select('first');
    }
    vprop.Draw();
  } else {
    selected_vprops.delete(vprop.id);
    vprop.Draw();
  }
  if (DBG) console.log(`global selection`, selected_vprops);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.VIEWMODEL:
 * erase the selected properties set. Also calls affected vprops to
 * handle deselection update
 */
PMCData.VM_DeselectAllProps = () => {
  // tell all vprops to clear themselves
  selected_vprops.forEach(vpid => {
    const vprop = PMCData.VM_VProp(vpid);
    vprop.visualState.Deselect();
    vprop.Draw();
  });
  // clear selection viewmodel
  selected_vprops.clear();
  if (DBG) console.log(`global selection`, selected_vprops);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.VIEWMODEL:
 return array of all string ids that are currently selected properties
 in order of insertion.
 Use VProp.visualState.IsSelected('first') to determine what the first
 selection is
 @returns {string[]} propIds - array of string ids of properties
 */
PMCData.VM_SelectedProps = () => {
  return Array.from(selected_vprops.values());
}

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.VIEWMODEL:
 */
/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
PMCData.VM = { map_vprops, map_vmechs };
export default PMCData;
