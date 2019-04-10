/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

    MCGraph - Mechanisms and Components Graphing
    pure non-REACT module

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/
import SVGJS from '@svgdotjs/svg.js/src/svg';
// import '@svgdotjs/svg.draggable.js';

/// MODULES ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import DATA from './pmc-data';
import VGProperties from './vg-properties';
import VGMechanisms from './vg-mechanisms';
import { cssinfo, cssdraw, csstab, csstab2 } from './console-styles';
import { PAD, SVGDEFS, COLOR, UTIL } from './defaults';
import UR from '../../system/ursys';

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let m_element;
let m_svgroot;
const m_testprops = [];
//
const COL_BG = '#F06';
const DBG = true;

/// REFLECT DUMP
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
console.log(`Reflection test`, UTIL.DumpObj(DATA));

/// PRIVATE HELPERS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
UR.Sub('PROP:MOVED', data => {
  VGMechanisms.DrawEdges();
});

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PMC = {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
    attach an SVG instance, managed by SVGJS, to the container element
/*/
PMC.InitializeViewgraph = element => {
  m_element = element;
  m_svgroot = SVGJS(m_element);
  PMC.DefineDefs(m_svgroot);
  PMC.DefineSymbols(m_svgroot);
};

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
  define svg defs that are resused in the viewgraph
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
PMC.DefineDefs = svg => {
  SVGDEFS.set(
    'arrowEndHead',
    svg
      .marker(4, 4, add => {
        add.path('M0,0 L0,4 L4,2 Z').fill(COLOR.LINE);
      })
      .attr({ id: 'arrowEndHead', orient: 'auto', refX: 4 })
  );
  SVGDEFS.set(
    'arrowStartHead',
    svg
      .marker(4, 4, add => {
        add.path('M4,4 L4,0 L0,2 Z').fill(COLOR.LINE);
      })
      .attr({ id: 'arrowStartHead', orient: 'auto', refX: 0 })
  );
};

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
  define svg symbols that are resused in the viewgraph
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
PMC.DefineSymbols = svg => {};

/// LIFECYCLE /////////////////////////////////////////////////////////////////
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
    Get user inputs (external buttons, clcks, keypresses) and convert physical
    controls like "up arrow" into app-domain intentions "move piece up"
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
PMC.GetIntent = () => {
  console.log('GetIntent() unimplemented');
};
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
    Based on intentions, update current mode settings that will affect later
    processing stages
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
PMC.SyncModeSettings = () => {
  console.log('SyncModeSettings() unimplemented');
};
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
    SyncPropsFromGraphData()

    Maintain Properties ViewModel by synchronizing data that has been added,
    removed, or updated
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
PMC.SyncPropsFromGraphData = () => {
  if (DBG) console.groupCollapsed(`%c:SyncPropsFromGraphData()`, cssinfo);
  const { added, removed, updated } = DATA.VM_GetVPropChanges();
  removed.forEach(id => {
    VGProperties.Release(id);
  });
  added.forEach(id => {
    const vprop = VGProperties.New(id, m_svgroot);
  });
  updated.forEach(id => {
    VGProperties.Update(id);
  });
  if (DBG) {
    if (removed.length) console.log(`%c:Removing ${removed.length} dead nodes`, csstab);
    if (added.length) console.log(`%c:Adding ${added.length} new nodes`, csstab);
    if (updated.length) console.log(`%c:Updating ${updated.length} nodes`, csstab);
    console.groupEnd();
  }
};
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
    SyncMechsFromGraphData()

    Maintain Mechanisms ViewModel by synchronizing data that has been added,
    removed, or updated
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
PMC.SyncMechsFromGraphData = () => {
  if (DBG) console.groupCollapsed(`%c:SyncMechsFromGraphData()`, cssinfo);
  // the following arrays contain pathIds
  const { added, removed, updated } = DATA.VM_GetVMechChanges();
  removed.forEach(pathId => {
    VGMechanisms.Release(pathId);
    DATA.VM_VMechDelete(pathId);
  });
  added.forEach(pathId => {
    const vmech = VGMechanisms.New(pathId, m_svgroot);
    DATA.VM_VMechSet(vmech, pathId);
  });
  updated.forEach(pathId => {
    VGMechanisms.Update(pathId);
  });
  if (DBG) {
    if (removed.length) console.log(`%c:Removing ${removed.length} dead edgeObjs`, csstab);
    if (added.length) console.log(`%c:Adding ${added.length} new edgeObjs`, csstab);
    if (updated.length) console.log(`%c:Updating ${updated.length} edgeObjs`, csstab);
    console.groupEnd();
  }
};

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
    Update the data model. For PMCViewGraph, this lifecycle event probably
    doesn't do anything because that is PMCDataGraph's responsibility.
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
PMC.UpdateModel = () => {
  console.log(`UpdateModel() unimplemented`);
};
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
    Draw the model data by calling draw commands on everything. Also update.
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
PMC.UpdateViewModel = () => {
  if (DBG) console.groupCollapsed(`%c:UpdateViewModel()`, cssinfo);

  // first get the list of component ids to walk through
  const components = DATA.Components();

  // walk through every component
  components.forEach(compId => {
    VGProperties.MoveToRoot(compId);
    const bbox = u_Recurse(compId);
  });
  if (DBG) console.groupEnd();
};

// given a propId, set dimension data for each property
// set the component directly
// return struct { id, w, h } w/out padding
function u_Recurse(propId) {
  const propVis = VGProperties.GetVisual(propId);
  const self = propVis.GetDataBBox();
  self.h += PAD.MIN;
  console.group(`${propId} recurse`);
  /* WALK CHILD PROPS */
  const childIds = DATA.Children(propId);
  // if there are no children, break recursion
  if (childIds.length === 0) {
    propVis.SetSize(self);
    propVis.SetKidsBBox({ w: 0, h: 0 });
    console.groupEnd();
    return self;
  }
  // otherwise, let's recurse!
  let sizes = [];
  childIds.forEach(childId => {
    const childVis = VGProperties.GetVisual(childId);
    childVis.ToParent(propId);
    const size = u_Recurse(childId);
    childVis.SetKidsBBox(size);
    sizes.push(size);
  });
  //
  const pbox = sizes.reduce((accbox, item) => {
    return {
      id: propId,
      w: Math.max(accbox.w, item.w),
      h: accbox.h + item.h
    };
  });
  // adjust size
  const all = {
    id: pbox.id,
    w: Math.max(self.w, pbox.w) + PAD.MIN2,
    h: self.h + pbox.h
  };
  all.h += childIds.length > 1 ? PAD.MIN2 : PAD.MIN;
  propVis.SetSize(all);
  propVis.SetKidsBBox(all);
  console.groupEnd();
  return all;
}

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*:
    Draw the model data by calling draw commands on everything. Also update.
:*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
PMC.UpdateView = () => {
  if (DBG) console.groupCollapsed(`%c:UpdateView()`, cssinfo);
  VGProperties.LayoutComponents();
  VGMechanisms.DrawEdges();
  if (DBG) console.groupEnd();
};

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PMCView = PMC;
export { PMCView, DATA };
