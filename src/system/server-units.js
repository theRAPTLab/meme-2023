/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  UR server units manager

  Units are defined in the /units folder as subfolders, each with a
  unit.yaml file.  Each unit can contain any number of other resource
  files, such as images, pdfs, text files, etc.
  The unit manager loads and parses the unit.yaml files, and makes the
  unit definitions available to the rest of the server application.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

///	LOAD LIBRARIES ////////////////////////////////////////////////////////////
///	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const LOGGER = require('./server-logger');
const UNET = require('./server-network');

/// CONSTANTS /////////////////////////////////////////////////////////////////
///	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PROMPTS = require('./util/prompts');
const { TERM_UNITS: CS, CCRIT: CC, CR, TR } = PROMPTS;
const LPR = 'UNITS';
const PR = `${CS}${PROMPTS.Pad(LPR)}${CR}`;
///	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const unitPath = path.join(__dirname, '../../units');

const UNITSMAP = new Map(); // unitId -> unit object

/// API CREATE MODULE /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const UNITMGR = {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
UNITMGR.InitializeUnits = async function () {
  LOGGER.Write(LPR, `Initializing Units Manager`);
  await LoadUnits();

  // register handlers
  UNET.NetSubscribe('NET:SRV_UNITSGET', PKT_GetUnits);
};

/// INITIALIZATION METHODS ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
async function LoadUnits() {
  try {
    const unitIds = await LoadUnitIds();

    UNITSMAP.clear();

    for (const unitId of unitIds) {
      const unitDir = path.join(unitPath, unitId);

      try {
        const files = await fs.promises.readdir(unitDir);
        const yamlFiles = files.filter(
          file => file.endsWith('.yaml') || file.endsWith('.yml')
        );

        if (yamlFiles.length > 0) {
          const yamlFilePath = path.join(unitDir, yamlFiles[0]);
          const unitData = await LoadYAMLFile(yamlFilePath);
          if (unitData) {
            UNITSMAP.set(unitId, unitData);
            console.log(PR, `Loaded unit: ${unitId} from ${yamlFiles[0]}`);
          }
        } else {
          console.log(PR, `${CC}No YAML file found for: ${unitId}${CR}`);
        }
      } catch (error) {
        console.error(PR, `Error loading unit ${unitId}:`, error.message);
      }
    }

    LOGGER.Write(LPR, `Loaded ${UNITSMAP.size} units total`);
    console.log(PR, `Loaded ${UNITSMAP.size} units total`);
    return Array.from(UNITSMAP.keys());
  } catch (error) {
    console.error(PR, `Error loading units:`, error.message);
    return [];
  }
}

/// MESSAGE HANDLERS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** MESSAGE HANDLER: 'NET:SRV_UNITSGET'
 *  Return the units as an object map of unitId -> unit definition.
 *  Used when initializing client app.
 */
function PKT_GetUnits(pkt) {
  LOGGER.Write(pkt.Info(), `getunits`);
  return Object.fromEntries(UNITSMAP);
}
/// YAML LOAD METHODS //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
async function LoadYamlFileAsync(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(
          new Error(`Failed to read YAML file
   ${filePath}: ${err.message}`)
        );
        return;
      }

      try {
        const parsed = yaml.load(data);
        resolve(parsed);
      } catch (parseError) {
        reject(
          new Error(`Failed to parse YAML
  file ${filePath}: ${parseError.message}`)
        );
      }
    });
  });
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
async function LoadUnitIds() {
  try {
    const items = await fs.promises.readdir(unitPath, { withFileTypes: true });
    const unitIds = items
      .filter(item => item.isDirectory() && !item.name.startsWith('.'))
      .map(item => item.name);
    return unitIds;
  } catch (error) {
    throw new Error(`Failed to read units directory: ${error.message}`);
  }
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
async function LoadYAMLFile(filePath) {
  try {
    const data = await LoadYamlFileAsync(filePath);
    return data;
  } catch (error) {
    console.error(PR, `Error loading YAML file: ${error.message}`);
    return null;
  }
}

/// EXPORT MODULE DEFINITION //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = UNITMGR;
