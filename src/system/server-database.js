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
  let error = '';
  const added = [];
  const collections = DATAMAP.ExtractCollections(data);
  // collection is object with { colKey, docs, subKey, subDocs }
  // for 'add' op, docs is an array of data objects WITHOUT an id
  // these data objects will be assigned ids and returned to caller
  /*/
    'teachers', { name }
    'pmcData.entities', { id:, entities: [ { name } ]
  /*/
  collections.forEach(entry => {
    let { colKey, docs, subKey, subDocs } = entry;
    const dbc = m_db.getCollection(colKey);
    docs.forEach(colData => {
      const { id } = colData;
      const record = dbc.chain().find({ id: { $eq: id } });
      if (!id) {
        error += `record in ${colKey} doesn't can't find id: ${JSON.stringify(doc)}`;
        return;
      }
      if (!subKey) {
        // IS NORMAL ADD
        const reskey = colkey;
        results[reskey] = results[reskey] || [];
        let inserted = dbc.insert(docs);
        if (!Array.isArray(inserted)) inserted = [inserted];
        const insertedIds = inserted.map(item => item.id);
        const entitiesUpdated = dbc
          .chain()
          .find({ id: { $in: insertedIds } })
          .data({ removeMeta: true });
        results[reskey] = entitiesUpdated;
      } else {
        // IS SUBKEY ADD
        if (record.count() === 0) {
          error += `add could not find matching ${id} in ${colKey} collection`;
          return;
        }
        record.update(match => {
          // subrecord is an array of objs to add
          const subrecord = match[subKey];
          // special case processing
          if (subKey === 'entities') {
            // find max index
            const maxidx = subrecord.reduce((acc, cv) => {
              return cv.id > acc ? cv.id : acc;
            }, 0);
            subDocs.forEach(sd => {
              sd.id = ++maxidx;
              if (DBG) console.log(PR, `.. writing new id into ${JSON.stringify(sd)}`);
              subrecord.push(sd);
              const sdcopy = Object.assign({}, sd);
              added.push(sdcopy);
            });
            // rewrite match
            match[subKey] = subrecord;
            //
          } // subkey entities
          const reskey = `${colKey}.${subKey}`;
          results[reskey] = results[reskey] || [];
          results[reskey].push(...added);
        }); // record update
      } // if subkey
      if (DBG) console.log(PR, `ADDED '${colKey}': ${JSON.stringify(entitiesUpdated)}`);
    }); // docs foreach
  }); // collections foreach

  if (error) {
    console.log(PR, 'PKT_Add:', error);
    return { error };
  }
  // send update to network
  m_DatabaseChangeEvent('add', results);
  // return
  return results;
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** MESSAGE HANDLER: 'NET:SRV_DBUPDATE'
 * Update a collection.
 * All properties that match an existing DBKEY are considered inputs.
 * The property values must be objects WITH an id property.
 * If the call fails, the error property will be set as well.
 * @param {NetMessage} pkt - packet with data object with collection keys
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
  // collection is object with { colkey, subkey, value }
  collections.forEach(collection => {
    let { colkey, subkey, value } = collection;
    const dbc = m_db.getCollection(colkey);
    if (!DATAMAP.IsValidId(value.id)) {
      error += `${colkey} no id in ${JSON.stringify(value)}`;
      return;
    }
    const colid = value.id;
    if (DBG) console.log(PR, `matching id:${colid} in collection:${colkey}...`);
    let retval;
    // update!
    const found = dbc
      .chain()
      .find({ id: { $eq: colid } })
      .update(record => {
        /*/
          record is a matching update object that we can modify it's always the
          matching top-level record in the collection however, how we process it
          depends on whether there is a subkey or not.
          /*/
        let reskey = colkey;
        if (subkey) {
          reskey = `${colkey}.${subkey}`;
          retval = DATAMAP.MutateObjectProp(record, subkey, value[subkey]);
        } else {
          retval = DATAMAP.MutateObject(record, value);
        }
        //
        results[reskey] = results[reskey] || [];
        results[reskey].push(retval); // update results object
        if (DBG) console.log(PR, `updated: ${reskey} ${JSON.stringify(retval)}`);
      });
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
  const updated = [];
  let error = '';
  const collections = DATAMAP.ExtractCollections(data);
  // collection is object with { colkey, subkey, value }
  collections.forEach(collection => {
    let { colkey, subkey, value } = collection;
    if (DBG) console.log(PR, `${colkey} has ${JSON.stringify(value)}`);
    // process collections
    const dbc = m_db.getCollection(colkey);
    if (!DATAMAP.IsValidId(value.id)) {
      error += `${colkey} no id in ${JSON.stringify(value)}`;
      return;
    }
    const colid = value.id;
    let reskey = colkey;
    // remove
    const found = dbc.chain().find({ id: { $eq: colid } }); // e.g. pmcdata model
    if (found.count() === 0) {
      error += `remove could not find matching ${colid} in ${colkey} collection.`;
      return;
    }
    if (DBG) console.log(PR, `remove found match for id:${colid} in collection:${colkey}`);
    if (!subkey) {
      // IS NORMAL REMOVE - pure database remove
      const reskey = colkey;
      results[reskey] = results[reskey] || [];
      const retval = record.branch().data({ removeMeta: true });
      found.remove();
      results[reskey].push(retval);
      if (DBG) console.log(PR, `${colkey} delete ${JSON.stringify(retval)}`);
    } else {
      // IS SUBKEY REMOVE - database modify and update record
      found.update(record => {
        const reskey = `${colkey}.${subkey}`;
        results[reskey] = results[reskey] || [];
        const subrecord = record[subkey]; // this is what we want to modify
        if (!DATAMAP.IsValidId(value[subkey].id)) {
          error += `${reskey} no id in ${JSON.stringify(value[subkey])}`;
          return; // exit update(), process afterwards
        }
        const subid = value[subkey].id;
        if (DBG) console.log(PR, `matching id:${subid} in ${reskey} list...`);
        let keep = subrecord.filter(element => {
          const b_delete = subid === element.id;
          if (b_delete) {
            removed.push(element);
            if (DBG) console.log(PR, `.. removing ${JSON.stringify(element).substring(0, 40)}`);
          }
          return !b_delete;
        }); // filter subrecord

        // keep[]    - has items to save (probably more than one)
        // removed[] - saved the removed items (probably just be one)

        // if there are no removed items, that is a problem
        if (!removed.length) {
          error += `no matching subkey id ${subid} in subrecord ${JSON.stringify(record[subkey])}`;
          return; // exit update(), process afterwards
        }

        // special case processing
        if (subkey === 'entities') {
          if (DBG) console.log(PR, `scrubbing entities referring to id:${subid}`);
          // now remove linked entities
          keep.forEach(entity => {
            // for every removed entity, remove links to it in kept entities
            removed.forEach(r => {
              if (entity.propId === r.id) {
                if (DBG)
                  console.log(PR, `.. evidence ${entity.id} removed propId ${entity.propId}`);
                entity.propId = undefined;
                updated.push(entity);
              } // if propId
              if (entity.parent === r.id) {
                if (DBG) console.log(PR, `.. prop ${entity.id} removed parent ${entity.parent}`);
                entity.parent = undefined;
                updated.push(entity);
              } // if parent
              if (entity.type === 'mech') {
                let changed = false;
                if (entity.source === r.id) {
                  changed = true;
                  if (DBG) console.log(PR, `.. mech ${entity.id} removed source ${entity.source}`);
                  entity.source = undefined;
                }
                if (entity.target === r.id) {
                  changed = true;
                  if (DBG) console.log(PR, `.. mech ${entity.id} removed target ${entity.target}`);
                  entity.target = undefined;
                }
                if (changed) updated.push(entity);
              } // if mech
            }); // end removed forEach
          }); // end keep forEach
        } // end special case entities

        // now remove child nodes
        record[subkey] = keep;
        results[reskey].push(...removed);
        if (DBG) console.log(PR, `${reskey} deleted`, JSON.stringify(removed));
        if (DBG) console.log(PR, `${reskey} updated`, JSON.stringify(updated));
      }); // end found update
    } // end if-else subkey
  }); // collections
  // was there an error?
  if (error) {
    console.log(PR, 'PKT_Remove:', error);
    return { error };
  }
  // otherwise send update to network
  m_DatabaseChangeEvent('remove', results);
  if (updated.length) m_DatabaseChangeEvent('update', { 'pmcData.entities': updated });
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
