/* eslint-disable no-param-reassign */
/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

DATABASE SERVER

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

const DBG = false;

/// LOAD LIBRARIES ////////////////////////////////////////////////////////////
/// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const Loki = require('lokijs');
const PATH = require('path');
const FS = require('fs-extra');

const DATAMAP = require('./common-datamap');
const SESSION = require('./common-session');
const LOGGER = require('./server-logger');
const PROMPTS = require('../system/util/prompts');
const UNET = require('./server-network');

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const { TERM_DB: CLR, TR, CCRIT } = PROMPTS;
const PR = `${CLR}${PROMPTS.Pad('UR_DB')}${TR}`;
const RUNTIMEPATH = PATH.join(__dirname, '../../runtime');
const DATASETPATH = PATH.join(__dirname, '/datasets/meme');

/// MODULE-WIDE VARS //////////////////////////////////////////////////////////
/// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
let m_options; // saved initialization options
let m_db; // loki database
const DBKEYS = DATAMAP.DBKEYS;

/// API METHODS ///////////////////////////////////////////////////////////////
/// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const DB_CONFIG = {
  dataset: 'meme' // eventually this will be provided from somewhere
}; //
const DB = {};

/// INITIALIZE DATABASE ///////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Initialize database, creating blank DB file if necessary.
 */
DB.InitializeDatabase = (options = {}) => {
  let dataset = DB_CONFIG.dataset || 'test';
  let db_file = m_GetValidDBFilePath(dataset);
  FS.ensureDirSync(PATH.dirname(db_file));
  if (!FS.existsSync(db_file)) {
    console.log(PR, `CREATING NEW DATABASE FILE '${db_file}'`);
  }

  // initialize database with given options
  console.log(PR, `loading database ${db_file}`);
  let ropt = {
    autoload: true,
    autoloadCallback: f_DatabaseInitialize,
    autosave: true,
    autosaveCallback: f_AutosaveStatus,
    autosaveInterval: 4000 // save every four seconds
  };
  m_options = Object.assign(ropt, options);
  m_db = new Loki(db_file, m_options);
  m_options.db_file = db_file; // store for use by DB.WriteJSON

  // register handlers
  UNET.Subscribe('NET:SRV_DBGET', DB.PKT_GetDatabase);

  // end of initialization code...following are local functions

  /* Local Utility Functions *************************************************/
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // callback on load
  function f_DatabaseInitialize() {
    // on the first load of (non-existent database), we will have no
    // collections so we can detect the absence of our collections and
    // add (and configure) them now.
    if (options.memehost === 'devserver') {
      const fname = `'datasets/${DB_CONFIG.dataset}'`;
      console.log(PR, `${CCRIT}DEV OVERRIDE${TR}...reloading database from ${fname}`);
    }
    DBKEYS.forEach(name => f_LoadCollection(name));
    console.log(PR, `database ready`);
    console.log(PR, fout_CountCollections());
    m_db.saveDatabase();

    // Call complete callback
    if (typeof m_options.onLoadComplete === 'function') {
      m_options.onLoadComplete();
    }
  } // end f_DatabaseInitialize
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function f_AutosaveStatus() {
    const status = fout_CountCollections();
    console.log(PR, `AUTOSAVING! ${status}`);
  }
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function f_EnsureCollection(col) {
    if (m_db.getCollection(col) === null) {
      m_db.addCollection(col, {
        unique: [`${col}Id`],
        autoupdate: true
      });
    }
    return m_db.getCollection(col);
  }
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function f_LoadCollection(col) {
    const collection = f_EnsureCollection(col);
    if (options.memehost !== 'devserver') {
      console.log(PR, `loaded '${col}' w/ ${collection.count()} elements`);
      return;
    }
    const dpath = `${DATASETPATH}/${col}.db`;
    console.log(PR, `resetting dataset '${col}.db'`);
    collection.clear();
    collection.insert(require(dpath));
    // save collection reference
  }
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function fout_CountCollections() {
    let out = '';
    DBKEYS.forEach(colname => {
      out += count(colname);
    });
    //
    function count(col) {
      return `${col}: ${m_db.getCollection(col).count()} `;
    }
    //
    return out;
  }
}; // Initialize Database

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API:
 * Return the entire admin database structure. Used when initializing client
 * app.
 */
DB.PKT_GetDatabase = pkt => {
  LOGGER.Write(pkt.Info(), `getdatabase`);
  const adm_db = {};

  DBKEYS.forEach(colname => {
    adm_db[`a_${colname}`] = f_GetCollectionData(colname);
  });
  // return object for transaction; URSYS will automatically return
  // to the netdevice that called this
  return adm_db;
  //
  function f_GetCollectionData(col) {
    collection = m_db.getCollection(col);
    if (!collection) throw Error(`Collection '${col}' doesn't exist`);
    return collection.chain().data({ removeMeta: true });
  }
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API:
 * Add an element or elements to the specificed collection.
 * All properties that match an existing DBKEY are considered inputs.
 * The property values must be objects WITHOUT an id property, or an
 * array of such objects. Returns the input with ids added to each object.
 * If the call fails, the error property will be set as well.
 * @param {NetMessage} pkt - packet with data object as described above
 * @returns {Object} - data to return to caller
 */
DB.PKT_Add = pkt => {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API:
 * Update a collection.
 * All properties that match an existing DBKEY are considered inputs.
 * The property values must be objects WITH an id property.
 * If the call fails, the error property will be set as well.
 * @param {NetMessage} pkt - packet with data object as described above
 * @returns {Object} - data to return (including error if any)
 */
DB.PKT_Update = pkt => {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API:
 * Delete elements from a collection.
 * All properties that match an existing DBKEY are considered inputs.
 * The property values must be an id or array of ids
 * If the call fails, the error property will be set as well.
 * @param {NetMessage} pkt - packet with data object as described above
 * @returns {Object} - data to return (including error if any)
 */
DB.PKT_Delete = pkt => {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API:
 * Query elements.
 * All properties that match an existing DBKEY are considered inputs.
 * The property values must be an LokiJS condition or array of such
 * conditions that are applied successively. The properties are
 * replaced with the found results.
 * If the call fails, the error property will be set as well.
 * @param {NetMessage} pkt - packet with data object as described above
 * @returns {Object} - data to return (including error if any)
 */
DB.PKT_Query = pkt => {};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API:
 * data packet contains items that will be updated. Expects keys to be
 *
 */
DB.PKT_Update = pkt => {
  let { node, edge, nodeID, edgeID } = pkt.Data();
  // PROCESS NODE INSERT/UPDATE
  if (node) return m_UpdateNode(node, pkt);
  if (edge) return m_UpdateEdge(edge, pkt);
  if (nodeID !== undefined) return m_DeleteNode(nodeID, pkt);
  if (edgeID !== undefined) return m_DeleteEdge(edgeID, pkt);
  // return update value
  return { op: 'error-noaction' };
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_UpdateNode(node, pkt) {
  let retval = {};

  m_CleanObjID(`${pkt.Info()} node.id`, node);
  let matches = NODES.find({ id: node.id });
  if (matches.length === 0) {
    // if there was no node, then this is an insert new operation
    if (DBG) console.log(PR, `PKT_Update ${pkt.Info()} INSERT nodeID ${JSON.stringify(node)}`);
    LOGGER.Write(pkt.Info(), `insert node`, node.id, JSON.stringify(node));
    DB.AppendNodeLog(node, pkt); // log GroupId to node stored in database
    NODES.insert(node);
    retval = { op: 'insert', node };
  } else if (matches.length === 1) {
    // there was one match to update
    NODES.findAndUpdate({ id: node.id }, n => {
      if (DBG)
        console.log(
          PR,
          `PKT_Update ${pkt.Info()} UPDATE nodeID ${node.id} ${JSON.stringify(node)}`
        );
      LOGGER.Write(pkt.Info(), `update node`, node.id, JSON.stringify(node));
      DB.AppendNodeLog(n, pkt); // log GroupId to node stored in database
      Object.assign(n, node);
    });
    retval = { op: 'update', node };
  } else {
    if (DBG) console.log(PR, `WARNING: multiple nodeID ${node.id} x${matches.length}`);
    LOGGER.Write(pkt.Info(), `ERROR`, node.id, 'duplicate node id');
    retval = { op: 'error-multinodeid' };
  }
  return retval;
} // updatenode
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_UpdateEdge(edge, pkt) {
  let retval = {};
  // PROCESS EDGE INSERT/UPDATE
  m_CleanObjID(`${pkt.Info()} edge.id`, edge);
  let matches = EDGES.find({ id: edge.id });
  if (matches.length === 0) {
    // this is a new edge
    if (DBG)
      console.log(PR, `PKT_Update ${pkt.Info()} INSERT edgeID ${edge.id} ${JSON.stringify(edge)}`);
    LOGGER.Write(pkt.Info(), `insert edge`, edge.id, JSON.stringify(edge));
    DB.AppendEdgeLog(edge, pkt); // log GroupId to edge stored in database
    EDGES.insert(edge);
    retval = { op: 'insert', edge };
  } else if (matches.length === 1) {
    // update this edge
    EDGES.findAndUpdate({ id: edge.id }, e => {
      if (DBG)
        console.log(
          PR,
          `PKT_Update ${pkt.SourceGroupID()} UPDATE edgeID ${edge.id} ${JSON.stringify(edge)}`
        );
      LOGGER.Write(pkt.Info(), `update edge`, edge.id, JSON.stringify(edge));
      DB.AppendEdgeLog(e, pkt); // log GroupId to edge stored in database
      Object.assign(e, edge);
    });
    retval = { op: 'update', edge };
  } else {
    console.log(PR, `WARNING: multiple edgeID ${edge.id} x${matches.length}`);
    LOGGER.Write(pkt.Info(), `ERROR`, edge.id, 'duplicate edge id');
    retval = { op: 'error-multiedgeid' };
  }
  return retval;
} // update edge
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_DeleteNode(nodeID, pkt) {
  // DELETE NODE
  nodeID = m_CleanID(`${pkt.Info()} nodeID`, nodeID);
  if (DBG) console.log(PR, `PKT_Update ${pkt.Info()} DELETE nodeID ${nodeID}`);
  // Log first so it's apparent what is triggering the edge changes
  LOGGER.Write(pkt.Info(), `delete node`, nodeID);

  // handle edges
  let edgesToProcess = EDGES.where(e => {
    return e.source === nodeID || e.target === nodeID;
  });

  // handle linked nodes
  let { replacementNodeID } = pkt.Data();
  replacementNodeID = m_CleanID(`${pkt.Info()} replacementNodeID`, replacementNodeID);
  if (replacementNodeID !== -1) {
    // re-link edges to replacementNodeID...
    EDGES.findAndUpdate({ source: nodeID }, e => {
      LOGGER.Write(pkt.Info(), `relinking edge`, e.id, `to`, replacementNodeID);
      e.source = replacementNodeID;
    });
    EDGES.findAndUpdate({ target: nodeID }, e => {
      LOGGER.Write(pkt.Info(), `relinking edge`, e.id, `to`, replacementNodeID);
      e.target = replacementNodeID;
    });
  } else {
    // ... or delete edges completely
    let sourceEdges = EDGES.find({ source: nodeID });
    EDGES.findAndRemove({ source: nodeID });
    if (sourceEdges.length)
      LOGGER.Write(pkt.Info(), `deleting ${sourceEdges.length} sources matching ${nodeID}`);
    let targetEdges = EDGES.find({ target: nodeID });
    EDGES.findAndRemove({ target: nodeID });
    if (targetEdges.length)
      LOGGER.Write(pkt.Info(), `deleting ${targetEdges.length} targets matching ${nodeID}`);
  }
  // ...finally remove the node itself
  NODES.findAndRemove({ id: nodeID });
  return { op: 'delete', nodeID, replacementNodeID };
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_DeleteEdge(edgeID, pkt) {
  edgeID = m_CleanID(`${pkt.Info()} edgeID`, edgeID);
  if (DBG) console.log(PR, `PKT_Update ${pkt.Info()} DELETE edgeID ${edgeID}`);
  LOGGER.Write(pkt.Info(), `delete edge`, edgeID);
  EDGES.findAndRemove({ id: edgeID });
  return { op: 'delete', edgeID };
}

/// NODE ANNOTATION ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** write/remove packet SourceGroupID() information into the node before writing
  the first entry is the insert, subsequent operations are updates
 */
DB.AppendNodeLog = (node, pkt) => {
  if (!node._nlog) node._nlog = [];
  let gid = pkt.SourceGroupID() || pkt.SourceAddress();
  node._nlog.push(gid);
  if (DBG) {
    let out = '';
    node._nlog.forEach(el => {
      out += `[${el}] `;
    });
    console.log(PR, 'nodelog', out);
  }
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** */
DB.FilterNodeLog = node => {
  let newNode = Object.assign({}, node);
  Reflect.deleteProperty(newNode, '_nlog');
  return newNode;
};
/// EDGE ANNOTATION ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** write/remove packet SourceGroupID() information into the node before writing
 * the first entry is the insert, subsequent operations are updates
 */
DB.AppendEdgeLog = (edge, pkt) => {
  if (!edge._elog) edge._elog = [];
  let gid = pkt.SourceGroupID() || pkt.SourceAddress();
  edge._elog.push(gid);
  if (DBG) {
    let out = '';
    edge._elog.forEach(el => {
      out += `[${el}] `;
    });
    console.log(PR, 'edgelog', out);
  }
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *
 */
DB.FilterEdgeLog = edge => {
  let newEdge = Object.assign({}, edge);
  Reflect.deleteProperty(newEdge, '_elog');
  return newEdge;
};

/// JSON EXPORT ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** called by brunch to generate an up - to - date JSON file to path.
 * creates the path if it doesn't exist
 */
DB.WriteDbJSON = filePath => {
  let dataset = DB_CONFIG.dataset;

  // Ideally we should use m_otions value, but in standlone mode,
  // m_options might not be defined.
  let db_file = m_options ? m_options.db_file : m_GetValidDBFilePath(dataset);
  let db = new Loki(db_file, {
    autoload: true,
    autoloadCallback: () => {
      if (typeof filePath === 'string') {
        if (DBG) console.log(PR, `writing { nodes, edges } to '${filePath}'`);
        let nodes = db
          .getCollection('nodes')
          .chain()
          .data({ removeMeta: true });
        let edges = db
          .getCollection('edges')
          .chain()
          .data({ removeMeta: true });
        let data = { nodes, edges };
        let json = JSON.stringify(data);
        if (DBG) console.log(PR, `ensuring DIR ${PATH.dirname(filePath)}`);
        FS.ensureDirSync(PATH.dirname(filePath));
        if (DBG) console.log(PR, `writing file ${filePath}`);
        FS.writeFileSync(filePath, json);
        console.log(PR, `*** WROTE JSON DATABASE ${filePath}`);
      } else {
        console.log(PR, `ERR path ${filePath} must be a pathname`);
      }
    }
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** called by brunch to generate an up - to - date Template file to path.
 * creates the path if it doesn't exist
 */
DB.WriteTemplateJSON = filePath => {
  let templatePath = `${RUNTIMEPATH + DB_CONFIG.dataset}.template`;
  FS.ensureDirSync(PATH.dirname(templatePath));
  // Does the template exist?
  if (!FS.existsSync(templatePath)) {
    console.error(PR, `ERR could not find template ${templatePath}`);
  } else {
    FS.copySync(templatePath, filePath);
    console.log(PR, `*** COPIED TEMPLATE ${templatePath} to ${filePath}`);
  }
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// utility function for cleaning nodes with numeric id property
function m_CleanObjID(prompt, obj) {
  if (typeof obj.id === 'string') {
    let int = parseInt(obj.id, 10);
    LOGGER.Write(PR, `! ${prompt} "${obj.id}" is string; converting to ${int}`);
    obj.id = int;
  }
  return obj;
}
function m_CleanEdgeEndpoints(prompt, edge) {
  if (typeof edge.source === 'string') {
    let int = parseInt(edge.source, 10);
    LOGGER.Write(PR, `  edge ${prompt} source "${edge.source}" is string; converting to ${int}`);
    edge.source = int;
  }
  if (typeof edge.target === 'string') {
    let int = parseInt(edge.target, 10);
    LOGGER.Write(PR, `  edge ${prompt} target "${edge.target}" is string; converting to ${int}`);
    edge.target = int;
  }
  return edge;
}
function m_CleanID(prompt, id) {
  if (typeof id === 'string') {
    let int = parseInt(id, 10);
    LOGGER.Write(PR, `! ${prompt} "${id}" is string; converting to number ${int}`);
    id = int;
  }
  return id;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Given a root word, create a full pathname to .loki file in the runtime path.
 * Makes sure that the passed pathname allows only alphanumeric characters with
 * some special characters
 */
function m_GetValidDBFilePath(dataset) {
  // validate dataset name
  let regex = /^([A-z0-9-_+./])*$/; // Allow _ - + . /, so nested pathways are allowed
  if (!regex.test(dataset)) {
    console.error(PR, `Trying to initialize database with bad dataset name: ${dataset}`);
  }

  return `${RUNTIMEPATH}/${dataset}.loki`;
}

/// EXPORT MODULE DEFINITION //////////////////////////////////////////////////
/// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
module.exports = DB;
