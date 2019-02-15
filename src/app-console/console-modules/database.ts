/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  dWIP database class - running in the context of the electron renderer process

  What kind of things go into the database class?
  AddProp

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/

/// LIBRARIES ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import { CProp, CMech } from './classes-pmc';

const Loki = require('lokijs');

/// CONSTANTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PR = 'DB:';
const DBNAME = 'MEME_BrowserTestLoki';

/// MODULE GLOBALS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let m_options: any; // saved initialization options
let m_db: any; // loki database
let PROPS: any; // loki "properties" collection
let MECHS: any; // loki "mechanisms" collection

/// EXTERNAL METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function Start() {
  (async () => {
    console.log(PR, 'DATABASE.Start');
    await PromiseInitializeDatabase();
    console.log(PR, 'DATABASE.Start Complete');
  })();
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function NewProp(label: string): CProp {
  return new CProp({
    label
  });
}

/// SUPPORT METHODS /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function PromiseInitializeDatabase(options = {}) {
  return new Promise((resolve, reject) => {
    let ropt = {
      autoload: true,
      autoloadCallback: f_DatabaseLoaded,
      autosave: true,
      autosaveCallback: f_AutosaveStatus,
      autosaveInterval: 4000 // save every four seconds
    };

    ropt = Object.assign(ropt, options);
    console.log(PR, `Opening database ${DBNAME}`);
    m_db = new Loki(DBNAME, ropt);
    m_options = ropt;
    // UTILITY FUNCTION
    function f_DatabaseLoaded() {
      console.log(PR, 'Database loaded!');
      f_InitializeDatabase();
      // execute callback if it was set
      if (typeof m_options.onLoadComplete === 'function') {
        m_options.onLoadComplete();
      }
      resolve();
    }
  });

  // UTILITY FUNCTION
  function f_InitializeDatabase() {
    console.log(PR, 'Checking database PROPS and MECHS');
    // on the first load of (non-existent database), we will have no
    // collections so we can detect the absence of our collections and
    // add (and configure) them now.
    PROPS = m_db.getCollection('properties');
    if (PROPS === null) {
      PROPS = m_db.addCollection('properties');
      console.log(PR, '...adding PROPS');
    } else {
      console.log(PR, '...PROPS already exist');
    }
    MECHS = m_db.getCollection('mechanisms');
    if (MECHS === null) {
      MECHS = m_db.addCollection('mechanisms');
      console.log(PR, '...adding MECHS');
    } else {
      console.log(PR, '...MECHS already exist');
    }
    // save the database aftercreation
    m_db.saveDatabase();
  }
  // UTILITY FUNCTION
  function f_AutosaveStatus() {
    const propCount = PROPS.count();
    const mechCount = MECHS.count();
    console.log(PR, `AUTOSAVING! ${propCount} PROPS / ${mechCount} MECHS <3`);
  }
}

/// EXPORTS /////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// commonJS style export
// module.exports = { Start, PromiseInitializeDatabase };
// es6 style export
export { Start };
