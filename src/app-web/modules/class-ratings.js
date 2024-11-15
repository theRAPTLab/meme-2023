import DEFAULTS from './defaults';
const { SVGDEFS } = DEFAULTS;

/// MODULE CONSTANTS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DEFAULT_RATING = 0;
// `svgdefKey` is the key used to retrieve the SVG icon definition from the SVGDEFS
// Make sure DEFAULT_DEFINITIONS[DEFAULT_RATING] returns a valid svgdefKey!!!
const DEFAULT_DEFINITIONS = [
  {
    label: 'Default Strongly Agrees',
    rating: 2,
    svgdefKey: 'ratingsAgreeStrongly'
  },
  {
    label: 'Default Agrees',
    rating: 1,
    svgdefKey: 'ratingsAgree'
  },
  {
    label: 'Default None',
    rating: 0,
    svgdefKey: 'ratingsNone'
  },
  {
    label: 'Default Disagrees',
    rating: -1,
    svgdefKey: 'ratingsDisagree'
  },
  {
    label: 'Default Strongly Disagrees',
    rating: -2,
    svgdefKey: 'ratingsDisagreeStrongly'
  }
];
let DEFINITIONS = [...DEFAULT_DEFINITIONS];

/// MODULE HELPERS /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_getDefinition(rating) {
  return DEFINITIONS.find(r => r.rating === Number(rating));
}
function m_getDefaultDefinition(rating) {
  return DEFAULT_DEFINITIONS.find(r => r.rating === Number(rating));
}
// safely retrieve a value from definitions
// fall back to the DEFAULT_DEFINITIONS if not found
// fall back to the default rating if still not found
function m_getDefinitionByKey(rating, key) {
  const def = m_getDefinition(rating);
  if (def && def[key]) return def[key];
  const defDefault = m_getDefaultDefinition(rating);
  if (defDefault && defDefault[key]) return defDefault[key];
  const fallback = m_getDefaultDefinition(DEFAULT_RATING)[key];
  if (!fallback) throw error(`No default value found for rating: '${rating}; key: '${key}'`);
  return fallback;
}

function m_getSVGDefKey(rating) {
  // use the current definition, but fall back to default definition if key is not found
  // When migrating from older versions of MEME, the svgdefKey may not be defined
  // The original version relied on <img> tags. It's been replaced by SVG icons.
  // If svgdefKey is not defined, try to use the DEFAULT_DEFINITIONS svgdefKey
  // If that also fails, use the default rating svgdefKey
  return m_getDefinitionByKey(rating, 'svgdefKey');
};


/// MODULE EXPORTS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const RATINGS = {};

RATINGS.getDefinitions = () => DEFINITIONS;
RATINGS.getDefaultDefinitions = () => DEFAULT_DEFINITIONS;

RATINGS.updateDefinitions = newDefs => {
  DEFINITIONS = [];
  newDefs.forEach(def => DEFINITIONS.push(def));
};

RATINGS.getSVGIcon = rating => {
  const svgdefKey = m_getSVGDefKey(rating);
  const def = SVGDEFS.get(svgdefKey);
  if (!def) console.error('No SVG definition found for rating:', rating, 'svgdefKey:', svgdefKey);
  return SVGDEFS.get(svgdefKey).clone();
};

RATINGS.getLabel = rating => {
  return m_getDefinitionByKey(rating, 'label');
};

RATINGS.getListOrder = () => {
  return DEFINITIONS.map(def => def.rating);
}

export default RATINGS;
