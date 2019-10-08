/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  A class for managing hash-mapped data and detecting differences
  in a dataset. Keys must be unique.

  (1) manages differences - an array of just keys of your object is
      passed in, and DataMap returns what's the same or different.
  (2) stores related data by key into a Map()

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// list of collection names stored in database
const DBKEYS = [
  `teachers`,
  `classrooms`,
  `groups`,
  `models`,
  `criteria`,
  `sentenceStarters`,
  `ratingsDefinitions`,
  `classroomResources`,
  `resources`,
  `pmcData`,
  `pmcData.entities`,
  `pmcData.commentThreads`
];

/// list of valid database change commands
const DBCMDS = new Map([
  ['add', 'NET:SRV_DBADD'],
  ['update', 'NET:SRV_DBUPDATE'],
  ['remove', 'NET:SRV_DBREMOVE']
]);

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * An object containing the differences detected between an array NOW vs
 * an array the LAST TIME
 * @typedef {Object} ArrayChangeObject
 * @property {Array} added -
 * @property {Array} removed -
 * @property {Array} updated -
 */
/// CLASS /////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class DataMap {
  constructor() {
    this.ids = []; // array of string ids
    this.idsUpdated = [];
    this.idsAdded = [];
    this.idsRemoved = [];
    this.map = new Map();
    this.selection = new Set();
  }

  /**
   * Given an array of elements, return the differences since the last
   * call. Useful for managing data protocols that send the entire list
   * of entities in an array.
   * @param {Array<string>} arr - array of elements. The elements should be usable
   * as keys in a Map.
   * @returns {ArrayChangeObject} - { added, updated, removed }
   */
  GetChanges(arr) {
    const added = [];
    const updated = [];
    const removed = [];

    // find what matches and what is new
    arr.forEach(id => {
      if (this.map.has(id)) updated.push();
      else added.push(id);
    });
    this.map.forEach((val, id) => {
      if (!updated.includes(id)) removed.push(id);
    });
    // save results
    this.idsAdded = added;
    this.idsRemoved = removed;
    this.idsUpdated = updated;
    // return results
    return { added, removed, updated };
  }

  /**
   * @param {*} id - array value to compare
   * @returns {boolean} - true if id exists in the map
   */
  Has(id) {
    return this.map.has(id);
  }

  /**
   * Retrieve
   * @param {string} id - key
   * @returns {string} - the object associated with the key
   */
  Get(id) {
    return this.map.get(id);
  }

  /**
   * @param {string} id - key
   * @param {string} element - element
   */
  Set(id, element) {
    this.map.set(id, element);
  }
}

/// STATIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DataMap.DBKEYS = DBKEYS;
DataMap.DBCMDS = DBCMDS;
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** returns an array of valid TOP LEVEL collections
 */
DataMap.Collections = () => {
  return DBKEYS.filter(el => !el.includes('.'));
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** validate that keyName is a valid DBKEY
 * @param {string} keyName - extract from the DBSYNC data props
 */
DataMap.ValidateKey = keyName => {
  return DBKEYS.includes(keyName);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** validate command is valid
 * @param {string} command - extract from the DBSYNC data.cmd prop
 */
DataMap.ValidateCommand = command => DBCMDS.has(command);
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** lookup server message
 * @param {string} command - a valid key
 */
DataMap.GetCommandMessage = command => DBCMDS.get(command);
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** used to parse a data object (such as returned from pkt.Data() for collections
 * to modify or update.
 * @param {Object} data - object with properties matching DBKEY contain array of values
 * @returns {Array} - an array of {collection,propkey,docs} for each matching DBKEY
 */
DataMap.ExtractCollections = data => {
  let collections = [];
  // the colKey might be a compound key (e.g. pmcData.entities)
  Object.keys(data).forEach(foundKey => {
    // only return keys that match a collection name
    if (!DataMap.ValidateKey(foundKey)) return;
    let docs = data[foundKey]; // can be an obj or array of objs
    if (!Array.isArray(docs)) docs = [docs]; // wrap all non arrays in array
    const [colKey, subKey] = foundKey.split('.');
    const entry = { colKey, subKey, docs };
    collections.push(entry);
  });
  // returned undefined if no collections
  return collections;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** validate that data has valid keys DB keys. Returns number of found keys
 * that conform to type
 * @param {string} data - data object
 */
DataMap.ValidateCollections = data => {
  const { cmd } = data;
  let count = 0;
  Object.keys(data).forEach(colKey => {
    // only return colKey that match a collection name
    if (!DataMap.ValidateKey(colKey)) return;
    // extract the collection
    const values = data[colKey];
    if (Array.isArray(values)) {
      // make sure values of type array contains only valid types
      let ok = true;
      values.forEach(element => {
        switch (cmd) {
          case 'add':
            ok &= f_validateAdd(element, colKey);
            break;
          case 'update':
            ok &= f_validateUpdate(element, colKey);
            break;
          case 'remove':
            ok &= f_validateRemove(element, colKey);
            break;
          default:
            console.log(cmd);
            throw Error(`${colKey} unknown command ${cmd}`);
        }
        // if code hasn't returned, then this is an error
        if (!ok) throw Error(`${colKey}.${cmd} array mystery error`);
      }); // values foreach
      // successful processing! increment collection count
      count++;
    } else {
      // if we got this far, then the colKey contained a non-array
      let ok = true;
      switch (cmd) {
        case 'add':
          ok &= f_validateAdd(values, colKey);
          break;
        case 'update':
          ok &= f_validateUpdate(values, colKey);
          break;
        case 'remove':
          ok &= f_validateRemove(values, colKey);
          break;
        default:
          console.log(cmd);
          throw Error(`${colKey} unknown command ${cmd}`);
      } // single value
      if (!ok) throw Error(`${key}.${cmd} single value mystery error`);
      // sucessful processing
      count++;
    }
  }); // foreach colKey...loop to next one

  // finished processing everything, return the count of processed collection
  // if we dont' get this far, an error had been thrown
  return count;
};

function f_validateAdd(el, key = '') {
  const etype = typeof el;
  if (etype !== 'object') throw Error(`${key}.add: requires OBJECTS with no id`);
  if (el.id) throw Error(`${key}.add: object can not have an id; it will be assigned`);
  return true;
}
function f_validateUpdate(el, key = '') {
  const etype = typeof el;
  if (etype !== 'object') throw Error(`${key}.update: requires OBJECTS with an id, not ${etype}`);
  if (el.id === undefined) throw Error(`${key}.update: object must have an id`);
  const idtype = typeof el.id;
  if (idtype !== 'number')
    throw Error(`${key}.update: object.id <${el.id}> must be an integer, not ${idtype}`);
  if (Number.parseInt(el.id) !== el.id)
    throw Error(`${key}.update: object.id ${el} is not an integer`);
  return true;
}
function f_validateRemove(num, key = '') {
  const etype = typeof num;
  console.log(num, etype);
  if (etype !== 'number')
    throw Error(`${key}.remove: only provide an integer id (typeof=${etype})`);
  if (Number.parseInt(num) !== num) throw Error(`${key}.remove: ${num} isn't an integer`);
  return true;
}

/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = DataMap;
