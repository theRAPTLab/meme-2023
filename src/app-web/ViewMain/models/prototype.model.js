/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  prototype test data module - export an object that can be used to drive a SVG
  simulation

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// STATIC DECLARATIONS ///////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const m_data = [
  { group: 'nodes', data: { id: 'p1', name: 'prop1', parent: 'nparent' } },
  { group: 'nodes', data: { id: 'p2', name: 'prop2', parent: 'p1' } },
  { group: 'nodes', data: { id: 'p3', name: 'prop3', parent: 'p1' } },
  { group: 'nodes', data: { id: 'p4', name: 'prop4', parent: 'nparent' } },
  { group: 'nodes', data: { id: 'p5', name: 'prop5', parent: 'p4' } },
  { group: 'nodes', data: { id: 'p6', name: 'prop6', parent: 'nparent' } },
  { group: 'nodes', data: { id: 'p7', name: 'prop7', parent: 'p1' } },
  { group: 'nodes', data: { id: 'p8', name: 'prop8', parent: 'nparent' } },
  { group: 'nodes', data: { id: 'p9', name: 'prop9', parent: 'p8' } },
  { group: 'edges', data: { id: 'm1', name: 'mech1', source: 'p1', target: 'p2' } },
  { group: 'edges', data: { id: 'm2', name: 'mech2', source: 'p1', target: 'p3' } },
  { group: 'edges', data: { id: 'm3', name: 'mech3', source: 'p5', target: 'p2' } }
];
/// PRIVATE STATIC METHODS ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// INITIALIZATION ////////////////////////////////////////////////////////////
/** Extended Comment Block ***************************************************\

cytoscape
elements [
  {
    group: 'nodes' or 'edges'
    data: { id parent }
    scratch: { }
    position: { x, y }
  },
  {
    data: { id }
  },
  {
    data: { id, parent : 'nparent' } // nparent = no parent
  },
    data: { id, source:'n1', target:'n2' }
  }

\*****************************************************************************/

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default m_data;
