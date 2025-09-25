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
const VALIDATION = require('./server-units-validation');

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
          const unitData = await LoadAndMergeYAMLFiles(unitDir, yamlFiles, unitId);
          if (unitData) {
            // Validate unit data structure
            try {
              VALIDATION.ValidateUnit(unitData, unitId);
              UNITSMAP.set(unitId, unitData);
              console.log(PR, `Loaded unit: ${unitId} from ${yamlFiles.length} YAML file(s)`);
            } catch (validationError) {
              console.error(
                PR,
                `${CC}Validation failed for unit ${unitId}: ${validationError.message}${CR}`
              );
            }
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
function LoadYamlFileAsync(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(new Error(`Failed to read YAML file ${filePath}: ${err.message}`));
        return;
      }

      try {
        // Load with schema: SAFE_SCHEMA
        // prevents loading of unsafe types like !!js/function, !!js/regexp
        // !!binary, !!timestamp
        const parsed = yaml.load(data, { schema: yaml.SAFE_SCHEMA });
        resolve(parsed);
      } catch (parseError) {
        reject(
          new Error(`Failed to parse YAML file ${filePath}: ${parseError.message}`)
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
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
async function LoadAndMergeYAMLFiles(unitDir, yamlFiles, unitId) {
  let mergedData = {};

  for (const yamlFile of yamlFiles) {
    const yamlFilePath = path.join(unitDir, yamlFile);
    const data = await LoadYAMLFile(yamlFilePath);

    if (data) {
      console.log(PR, `  Loading ${yamlFile} for unit: ${unitId}`);
      mergedData = MergeUnitData(mergedData, data, yamlFile, unitId);
    }
  }

  return Object.keys(mergedData).length > 0 ? mergedData : null;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function MergeUnitData(target, source, fileName, unitId) {
  const merged = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (key === 'label') {
      // Only set label if not already set (first file wins)
      if (!merged.label) {
        merged.label = value;
      }
    } else if (Array.isArray(value)) {
      // Merge arrays (resources, ratings, commentTypes, criteria)
      if (!merged[key]) {
        merged[key] = [];
      }
      merged[key] = [...merged[key], ...value];
    } else if (typeof value === 'object' && value !== null) {
      // Merge objects recursively
      if (!merged[key]) {
        merged[key] = {};
      }
      merged[key] = { ...merged[key], ...value };
    } else {
      // Simple values - source wins (later files override)
      merged[key] = value;
    }
  }

  return merged;
}

/// EXPORT MODULE DEFINITION //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = UNITMGR;
