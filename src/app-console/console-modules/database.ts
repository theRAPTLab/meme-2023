// renderer process
// not full NODE environment

const Loki = require('lokijs');

const PR = 'DB:';
const DBNAME = 'MEME_BrowserTestLoki';

let m_options: any; // saved initialization options
let m_db: any; // loki database
let PROPS: any; // loki "properties" collection
let MECHS: any; // loki "mechanisms" collection

function Start() {
  console.log('Start() Electron Console App / Renderer Process');
  InitializeDatabase();
}

function InitializeDatabase(options = {}) {
  let ropt = {
    autoload: true,
    autoloadCallback: f_DatabaseInitialized,
    autosave: true,
    autosaveCallback: f_AutosaveStatus,
    autosaveInterval: 4000 // save every four seconds
  };
  ropt = Object.assign(ropt, options);
  console.log(PR, `Opening database ${DBNAME}`);
  m_db = new Loki(DBNAME, ropt);
  m_options = ropt;

  // UTILITY FUNCTION
  function f_DatabaseInitialized() {
    console.log(PR, 'Checking database PROPS and MECHS');
    // on the first load of (non-existent database), we will have no
    // collections so we can detect the absence of our collections and
    // add (and configure) them now.
    PROPS = m_db.getCollection('properties');
    if (PROPS === null) {
      PROPS = m_db.addCollection('properties');
      console.log(PR, '...adding PROPS');
    }
    MECHS = m_db.getCollection('mechanisms');
    if (MECHS === null) {
      MECHS = m_db.addCollection('mechanisms');
      console.log(PR, '...adding MECHS');
    }
    // save the database aftercreation
    m_db.saveDatabase();
    // execute callback if it was set
    if (typeof m_options.onLoadComplete === 'function') {
      m_options.onLoadComplete();
    }
  }
  // UTILITY FUNCTION
  function f_AutosaveStatus() {
    const propCount = PROPS.count();
    const mechCount = MECHS.count();
    console.log(PR, `AUTOSAVING! ${propCount} PROPS / ${mechCount} MECHS <3`);
  }
}

module.exports = { Start, InitializeDatabase };
