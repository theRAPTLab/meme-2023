/* eslint-disable no-param-reassign */
/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\
\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const AdmZip = require('adm-zip');
const DATESTR = require('./util/datestring');
const PATHS = require('./common-paths').PATHS;

/// HELPERS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const AssetPath = asset => path.join(__dirname, 'static', asset);
const TempDir = prefix => fs.mkdtempSync(path.join(os.tmpdir(), prefix || TMP_PREFIX));

/// DEBUG /////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const EXT = 'MEME';
const TMP_PREFIX = `MZIP-`;

/// API ///////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function MakeManifest(dbName) {
  if (!dbName) throw Error('<arg1> dbName is required');
  let today = new Date();
  return {
    db: dbName,
    date: Date.now(),
    localDate: today.toDateString(),
    localTime: today.toTimeString(),
    iso8601: today.toISOString()
  };
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function GetManifest(archivePath) {
  let buffer;
  let manifest;
  // read the file
  try {
    buffer = fs.readFileSync(`${archivePath}/00-manifest.json`);
    manifest = JSON.parse(buffer);
  } catch (error) {
    return { error: error.toString };
  }
  return manifest;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function MakeJSONFile(obj) {
  if (obj === undefined) throw Error('<arg1> can not be undefined');
  const jstr = JSON.stringify(obj);
  return Buffer.alloc(jstr.length, jstr);
}

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function MakeDBArchive(dbName = 'meme') {
  if (DBG) console.log('*** MAKING DB ARCHIVE ***');
  // create a zip archive in memory
  let zip = new AdmZip();
  // add manifest file
  const fileBlob = MakeJSONFile(MakeManifest(dbName));
  zip.addFile('00-manifest.json', fileBlob);
  // add loki file
  const rpath = PATHS.Database(dbName);
  if (DBG) console.log('*** RPATH', rpath);
  if (!fs.existsSync(rpath)) {
    console.log(`server-archive: dataset does not exist yet`);
    return undefined;
  }

  let err = zip.addLocalFile(rpath, '/');
  
  // write zip archive to os temp folder
  if (err) console.log('addLocalFile error', err);
  //
  if (DBG) console.log('*** creating dirs');
  let tmpDir = TempDir();
  let zipName = DATESTR.DatedFilename(`${EXT}DB`);
  let zipPath = path.join(tmpDir, `${zipName}.${EXT}.ZIP`);
  if (DBG) console.log('*** creating zip archive', zipName);
  zip.writeZip(zipPath);
  if (DBG) console.log('*** wrote zip to path', zipPath);
  // return path to zip archive
  return zipPath;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function ExtractDBArchive(zipPath) {
  let zip = new AdmZip(zipPath);
  let zipEntries = zip.getEntries();
  if (DBG) {
    //
    zipEntries.forEach(entry => console.log('entry', entry.name));
  }
  if (DBG) console.log('*** extracting', zipPath);
  let tmpDir = TempDir();
  zip.extractAllTo(tmpDir, true);
  return tmpDir;
}

/// EXPORT MODULE DEFINITION //////////////////////////////////////////////////
/// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
module.exports = { MakeDBArchive, ExtractDBArchive, GetManifest };
