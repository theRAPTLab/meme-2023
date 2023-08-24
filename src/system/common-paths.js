const path = require('path');
const fs = require('fs-extra');

/// LOAD LIBRARIES ////////////////////////////////////////////////////////////
/// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const PROMPTS = require('./util/prompts');

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const { TERM_DB: CLR, TR, CCRIT: CC } = PROMPTS;
const LPR = PROMPTS.Pad('PATH');
const PR = `${CLR}${PROMPTS.Pad(LPR)}${TR}`;

/// MODULE-WIDE VARS //////////////////////////////////////////////////////////
/// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const codebase = path.resolve(__dirname, `..`);
console.log(PR, `codebase located at: ${codebase}`);

// Check whether the application is running within the context of an electron shell; if it is
//  navigate out of folder
//  Unpackaged codebase: <application root>/src or <application root>/built
//  Packaged codebase (Linux): <application root>/meme.app/resources/app
//  Packaged codebase (MacOS): <application root>/meme.app/Contents/Resources/app

let relativeRootPath = path.join(codebase, '..');
if (path.basename(codebase) === 'app') {
  // Packaged codebase
  relativeRootPath = path.join(relativeRootPath, '..', '..');

  // On MacOS in particular, Electron will distribute the application in a folder called
  //  'Contents', if this is the case, bypass the folder
  // Note: platform is known at compile time when packaged; could consume a webpack variable rather 
  //  than resolve this at runtime
  if (path.basename(relativeRootPath).toLowerCase() === 'contents') {
    relativeRootPath = path.join(relativeRootPath, '..');
  }
}

const rootFolder = relativeRootPath;
console.log(PR, `meme root folder located at: ${rootFolder}`);
const dataFolder = path.join(rootFolder, 'data');

const MEME_TEMPLATES = {
  blank: '$blank$',
  init: '$init$'
};

const PATHS = {
  Resources: path.join(rootFolder, 'resources'),
  Database: (dataset = 'meme') => path.join(dataFolder, 'db', `${dataset}.loki`),
  DatabaseBackups: path.join(dataFolder, 'db', 'backups'),
  Template: (template) => {
    if (template === MEME_TEMPLATES.blank) {
      template = '_blank';
    }
    else if (template === MEME_TEMPLATES.init) {
      template = 'meme'; 
    }

    return path.join(rootFolder, 'templates', template);
  },
  Log: path.join(dataFolder, 'logs'),
  Screenshot: path.join(dataFolder, 'screenshots')
};

// Ensure certain directories exist (others are created dynamically/by other routines)
fs.ensureDirSync(PATHS.Resources);

/// EXPORT MODULE DEFINITION //////////////////////////////////////////////////
/// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
module.exports = { PATHS, MEME_TEMPLATES };