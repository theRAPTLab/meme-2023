/* eslint-disable no-param-reassign */
/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

DATABASE SERVER

The most readable LokiJS documentation is at:
http://techfort.github.io/LokiJS/

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

const DBG = true;

/// LOAD LIBRARIES ////////////////////////////////////////////////////////////
/// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const Loki = require('lokijs');
const PATH = require('path');
const FS = require('fs-extra');

const DATAMAP = require('./common-datamap');
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
const { DBCMDS } = DATAMAP; // key lookup for incoming data packets
let send_queue = []; // queue outgoing data
let recv_queue = []; // queue incoming requests

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
    autosaveInterval: 3000 // save every four seconds
  };
  m_options = Object.assign(ropt, options);
  m_db = new Loki(db_file, m_options);
  m_options.db_file = db_file; // store for use by DB.WriteJSON

  // register handlers
  UNET.NetSubscribe('NET:SRV_DBGET', DB.PKT_GetDatabase);
  UNET.NetSubscribe('NET:SRV_DBADD', DB.PKT_Add);
  UNET.NetSubscribe('NET:SRV_DBUPDATE', DB.PKT_Update);
  UNET.NetSubscribe('NET:SRV_DBREMOVE', DB.PKT_Remove);
  UNET.NetSubscribe('NET:SRV_DBQUERY', DB.PKT_Query);
  // also we publish 'NET:SYSTEM_DBSYNC' { collection key arrays of change }

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
    DATAMAP.Collections().forEach(name => f_LoadCollection(name));
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
        asyncListeners: false,
        autoupdate: true,
        cloneObjects: true // IMPORTANT
      });
    }
    return m_db.getCollection(col);
  }
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function f_LoadCollection(col) {
    const collection = f_EnsureCollection(col);
    // autoincrement enable
    collection.on('insert', u_CopyLokiId);
    // if not running devserver, don't overwrite database
    if (options.memehost !== 'devserver') {
      console.log(PR, `loaded '${col}' w/ ${collection.count()} elements`);
      return;
    }
    // otherwise...reset the dataset from template .db.js files
    const dpath = `${DATASETPATH}/${col}.db`;
    console.log(PR, `resetting dataset '${col}.db'`);
    collection.clear();
    collection.insert(require(dpath));
    // save collection reference
  }
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function fout_CountCollections() {
    let out = '';
    DATAMAP.Collections().forEach(colname => {
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
// returns the contents of a collection as an array of objects
// stored in the collection, suitable for delivering as JSON
function f_GetCollectionData(col) {
  collection = m_db.getCollection(col);
  if (!collection) throw Error(`Collection '${col}' doesn't exist`);
  return collection.chain().data({ removeMeta: true });
}

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Internal Helper:
 * Utility that sends database synch changes to all subscribing clients.
 * It is called whenever a change is written to the database.
 */
function m_DatabaseChangeEvent(cmd, data) {
  if (!DATAMAP.ValidateCommand(cmd)) throw Error(`unknown change event '{cmd}'`);
  data.cmd = cmd;
  // send data changes to all clients
  UNET.NetPublish('NET:SYSTEM_DBSYNC', data);
}

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** MESSAGE HANDLER: 'NET:SRV_DBGET'
 * Return the entire admin database structure. Used when initializing client
 * app.
 */
DB.PKT_GetDatabase = pkt => {
  LOGGER.Write(pkt.Info(), `getdatabase`);
  const adm_db = {};

  DATAMAP.Collections().forEach(colname => {
    adm_db[colname] = f_GetCollectionData(colname);
  });
  // return object for transaction; URSYS will automatically return
  // to the netdevice that called this
  return adm_db;
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** MESSAGE HANDLER: 'NET:SRV_DBADD'
 * Add an element or elements to the specificed collection.
 * All properties that match an existing DBKEY are considered inputs.
 * The property values must be objects WITHOUT an id property, or an
 * array of such objects. Returns the input with ids added to each object.
 * If the call fails, the error property will be set as well.
 * data.cmd 'add'
 * data.collectionName = obj || [ obj ], returns objs with id set
 * @param {NetMessage} pkt - packet with data object as described above
 * @returns {Object} - data to return to caller
 */
DB.PKT_Add = pkt => {
  const session = UNET.PKT_Session(pkt);
  if (session.error) return { error: session.error };
  //
  const data = pkt.Data();
  const results = {};
  const collections = DATAMAP.ExtractCollections(data);
  // collection is object with { colKey, docs, subKey, subDocs }
  // for 'add' op, docs is an array of data objects WITHOUT an id
  // these data objects will be assigned ids and returned to caller
  collections.forEach(entry => {
    let { colKey, docs, subKey, subDocs } = entry;
    const dbc = m_db.getCollection(colKey);
    // INSERT entries
    let inserted = dbc.insert(docs);
    if (!Array.isArray(inserted)) inserted = [inserted];
    // RETURN ids
    const insertedIds = inserted.map(item => item.id);
    // grab filtered values
    const entitiesUpdated = dbc
      .chain()
      .find({ id: { $in: insertedIds } })
      .data({ removeMeta: true });
    results[colKey] = entitiesUpdated;
    if (DBG) console.log(PR, `ADDED '${colKey}': ${JSON.stringify(entitiesUpdated)}`);
  });
  // send update to network
  m_DatabaseChangeEvent('add', results, pkt);
  // return
  return results;
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** MESSAGE HANDLER: 'NET:SRV_DBUPDATE'
 * Update a collection.
 * All properties that match an existing DBKEY are considered inputs.
 * The property values must be objects WITH an id property.
 * If the call fails, the error property will be set as well.
 *
 * data.cmd 'update'
 * data.collectionName = obj || [ obj ], reurns entitiesUpdated items
 * @param {NetMessage} pkt - packet with data object as described above
 * @returns {Object} - data to return (including error if any)
 */
DB.PKT_Update = pkt => {
  const session = UNET.PKT_Session(pkt);
  if (session.error) return { error: session.error };
  //
  const data = pkt.Data();
  const results = {};
  let error = '';
  const collections = DATAMAP.ExtractCollections(data);
  // collection is object with { colKey, docs, subKey, subDocs }
  // for 'update' op, docs is always an array of data objects WITH an id
  // these data objects will replace matching db items and returned
  collections.forEach(collection => {
    let { colKey, docs, subKey, subDocs } = collection;
    // console.log(`COLLECTION: ${JSON.stringify(collection)}`);
    const dbc = m_db.getCollection(colKey);
    let entitiesUpdatedIds = [];
    // 1. docs is the objects of the collection
    // 2. grab ids from each colObj
    // 3. find each object, then update it
    docs.forEach((colData, index) => {
      const { id } = colData; // id of the object in collection
      if (!id) {
        error += `item[${index}] has no id`;
        return;
      }
      // got this far, we found an id to update
      if (DBG) console.log(PR, `looking for id:${id} in collection:${colKey}`);
      let retval;
      const found = dbc
        .chain()
        .find({ id: { $eq: id } })
        .update(match => {
          if (DBG) console.log(PR, `found match for id:${id} in collection:${colKey}`);
          /*/
          match is a matching update object that we can modify it's always the
          matching top-level record in the collection however, how we process it
          depends on whether there is a subkey or not.
          /*/
          let reskey = colKey;
          if (subKey) {
            reskey = `${colKey}.${subKey}`;
            retval = DATAMAP.UpdateObjectProp(match, subKey, subDocs); // arr
          } else {
            DATAMAP.AssignObject(match, colData);
            const matchcopy = Object.assign({}, match);
            matchcopy.$loki = undefined;
            matchcopy.meta = undefined;
            retval = [matchcopy]; // force arr
          }
          //
          results[reskey] = results[reskey] || [];
          results[reskey].push(...retval); // push arr as individual bits
        });
      entitiesUpdatedIds.push(id);
    }); // docs foreach
    if (DBG) console.log(PR, `updated: ${JSON.stringify(results)}`);
  }); // collections forEach
  // was there an error?
  if (error) {
    console.log(PR, 'PKT_Update:', error);
    return { error };
  }
  // otherwise send update to network
  m_DatabaseChangeEvent('update', results);
  // return
  return results;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** MESSAGE HANDLER: 'NET:SRV_DBREMOVE'
 * Delete elements from a collection.
 * All properties that match an existing DBKEY are considered inputs.
 * The property values must be an id or array of ids
 * If the call fails, the error property will be set as well.
 * data.cmd 'remove'
 * data.collectionName = id || [ id ], return deleted items
 * @param {NetMessage} pkt - packet with data object as described above
 * @param {NetMessage} pkt.data - data containing parameters
 * @returns {Object} - data to return (including error if any)
 */
DB.PKT_Remove = pkt => {
  const session = UNET.PKT_Session(pkt);
  if (session.error) return { error: session.error };
  //
  const data = pkt.Data();
  const results = {};
  const removed = [];
  const entitiesUpdated = [];
  let error = '';
  const collections = DATAMAP.ExtractCollections(data);
  // collection is object with { colKey, docs, subKey, subDocs }
  // for 'update' op, docs is an array of ids to be removed
  // docs matching these ids are removed and returned to caller
  collections.forEach(collection => {
    let { colKey, docs, subKey, subDocs } = collection;
    if (DBG) console.log(PR, `${colKey} has ${JSON.stringify(docs)}`);
    // process collections
    const dbc = m_db.getCollection(colKey);
    let reskey = colKey;
    docs.forEach(doc => {
      const id = doc.id;
      if (!id) {
        error += `doc doesn't have an id: ${JSON.stringify(doc)}`;
        return;
      }
      const record = dbc.chain().find({ id: { $eq: id } }); // e.g. pmcdata model
      if (record.count() === 0) {
        error += `could not find matching ${id} in ${colKey} collection.`;
        return;
      }
      if (DBG) console.log(PR, `found ${record.count()} matches with ${colKey}.${id}`);
      if (!subKey) {
        // IS NORMAL COLLECTION
        const reskey = colKey;
        results[reskey] = results[reskey] || [];
        const rdata = record.branch().data({ removeMeta: true });
        record.remove();
        results[reskey].push(rdata);
        if (DBG) console.log(PR, `${colKey} delete ${JSON.stringify(rdata)}`);
      } else {
        // IS SUBKEY
        record.update(match => {
          const subrecord = match[subKey]; // e.g. pmcdata model entities array
          // subrecord is an array of objs to update
          const reskey = `${colKey}.${subKey}`;
          results[reskey] = results[reskey] || [];
          let keep = subrecord.filter(element => {
            const toDelete = subDocs.includes(element.id);
            // if (DBG) console.log(PR, '.. filtering', element, 'against', subDocs, toDelete);
            if (toDelete) removed.push(element);
            return !toDelete;
          }); // filter subrecord

          // special case processing
          if (subKey === 'entities') {
            if (DBG) console.log(PR, `scrubbing entities in ${colKey} id=${match.id}`);
            // now remove linked entities
            keep.forEach(entity => {
              // for every removed entity, remove links to it in kept entities
              removed.forEach(r => {
                if (entity.propId === r.id) {
                  if (DBG)
                    console.log(PR, `.. evidence ${entity.id} removed propId ${entity.propId}`);
                  entity.propId = undefined;
                  entitiesUpdated.push(entity);
                } // if propId
                if (entity.parent === r.id) {
                  if (DBG) console.log(PR, `.. prop ${entity.id} removed parent ${entity.parent}`);
                  entity.parent = undefined;
                  entitiesUpdated.push(entity);
                } // if parent
                if (entity.type === 'mech') {
                  let changed = false;
                  if (entity.source === r.id) {
                    changed = true;
                    if (DBG)
                      console.log(PR, `.. mech ${entity.id} removed source ${entity.source}`);
                    entity.source = undefined;
                  }
                  if (entity.target === r.id) {
                    changed = true;
                    if (DBG)
                      console.log(PR, `.. mech ${entity.id} removed target ${entity.target}`);
                    entity.target = undefined;
                  }
                  if (changed) entitiesUpdated.push(entity);
                } // if mech
              }); // removed
            }); // keep forEach
          } // special case entities
          // now remove child nodes
          match[subKey] = keep;
          results[reskey].push(...removed);
          if (DBG) console.log(PR, `${reskey} delete ${subDocs}`, JSON.stringify(removed));
          if (DBG) console.log(PR, `${reskey} entitiesUpdated`, JSON.stringify(entitiesUpdated));
          if (!removed.length) error += `no matching subKey id ${subDocs} in ${reskey}`;
        }); // record update
      } // else subkey
    }); // docs foreach
  }); // collections
  // was there an error?
  if (error) {
    console.log(PR, 'PKT_Remove:', error);
    return { error };
  }
  // otherwise send update to network
  m_DatabaseChangeEvent('remove', results);
  if (entitiesUpdated.length)
    m_DatabaseChangeEvent('update', { 'pmcData.entities': entitiesUpdated });
  // return
  return results;
};
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
DB.PKT_Query = pkt => {
  const session = UNET.PKT_Session(pkt);
  if (session.error) return { error: session.error };
  //
  return { error: 'query is unimplemented' };
};

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

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function u_CopyLokiId(input) {
  if (!Array.isArray(input)) {
    if (input.id && typeof input.id !== 'number')
      console.log(PR, `WARNING: replacing bogus string id '${input.id}' with ${input.$loki}`);
    input.id = input.$loki;
    // console.log(PR, '*** array output.id', input.id);
    return;
  }
  input.forEach(item => {
    if (item.id && typeof item.id !== 'number')
      console.log(PR, `WARNING: replacing bogus string id '${item.id}' with ${item.$loki}`);
    item.id = item.$loki;
    // console.log(PR, '*** non-array output.id', item.id);
  });
}

/// EXPORT MODULE DEFINITION //////////////////////////////////////////////////
/// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
module.exports = DB;
