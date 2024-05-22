const PATH = require('path');
const FS = require('fs-extra');

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
const m_codebase = PATH.resolve(__dirname, `..`);
console.log(PR, `codebase located at: ${m_codebase}`);

// Check whether the application is running within the context of an electron shell; if it is
//  navigate out of folder
//  Unpackaged codebase: <application root>/src or <application root>/built
//  Packaged codebase (Linux): <application root>/meme.app/resources/app
//  Packaged codebase (MacOS): <application root>/meme.app/Contents/Resources/app

let relativeRootPath = PATH.join(m_codebase, '..');
if (PATH.basename(m_codebase) === 'app') {
  // Packaged codebase
  relativeRootPath = PATH.join(relativeRootPath, '..', '..');

  // On MacOS in particular, Electron will distribute the application in a folder called
  //  'Contents', if this is the case, bypass the folder
  // Note: platform is known at compile time when packaged; could consume a webpack variable rather
  //  than resolve this at runtime
  if (PATH.basename(relativeRootPath).toLowerCase() === 'meme.app') {
    relativeRootPath = PATH.join(relativeRootPath, '..');
  }
}

const m_rootFolder = relativeRootPath;
console.log(PR, `meme root folder located at: ${m_rootFolder}`);
const m_dataFolder = PATH.join(m_rootFolder, 'data');

const MEME_TEMPLATES = {
  blank: '$blank$',
  init: '$init$'
};

const PATHS = {
  Resources: PATH.join(m_rootFolder, 'resources'),
  Database: (dataset = 'meme') => PATH.join(m_dataFolder, 'db', `${dataset}.loki`),
  DatabaseBackups: PATH.join(m_dataFolder, 'db', 'backups'),
  Template: template => {
    if (template === MEME_TEMPLATES.blank) {
      template = '_blank';
    } else if (template === MEME_TEMPLATES.init) {
      template = 'meme';
    }

    return PATH.join(m_rootFolder, 'templates', template);
  },
  Log: PATH.join(m_dataFolder, 'logs'),
  Screenshot: PATH.join(m_dataFolder, 'screenshots')
};

// Ensure certain directories exist (others are created dynamically/by other routines)
FS.ensureDirSync(PATHS.Resources);

/// EXPORT MODULE DEFINITION //////////////////////////////////////////////////
/// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
module.exports = { PATHS, MEME_TEMPLATES };
