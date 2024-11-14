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
function m_getSVGDefKey(rating) {
  // use the current definition, but fall back to default definition if key is not found
  // When migrating from older versions of MEME, the svgdefKey may not be defined
  // The original version relied on <img> tags. It's been replaced by SVG icons.
  // If svgdefKey is not defined, try to use the DEFAULT_DEFINITIONS svgdefKey
  // If that also fails, use the default rating svgdefKey
  let svgdefKey;
  const def = m_getDefinition(rating);
  if (def && def.svgdefKey) {
    // rating is defined and svgdefKey is defined, use it
    console.log('___found valid svgdefKey for rating:', rating, 'svgdefKey:', def.svgdefKey);
    svgdefKey = def.svgdefKey;
  } else {
    // rating is defined, but svgdefKey is not defined
    const defDefault = m_getDefaultDefinition(rating);
    if (defDefault && defDefault.svgdefKey) {
      // fall back to default rating's svgdefKey
      console.warn('___falling back to default svgdefKey for rating:', rating, 'svgdefKey:', defDefault.svgdefKey);
      svgdefKey = defDefault.svgdefKey;
    }
  }
  // still cannot find a valid svgdefKey, use the default rating
  if (!svgdefKey) {
    console.error('___default rating also fails -- back to default default:', rating, 'svgdefKey:', m_getDefaultDefinition(DEFAULT_RATING).svgdefKey);
    svgdefKey = m_getDefaultDefinition(DEFAULT_RATING).svgdefKey;
  }
  if (!svgdefKey) throw error(`No default svgdefKey found for rating: ${rating}`);
  return svgdefKey;
};


/// MODULE EXPORTS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const RATINGS = {};

RATINGS.getDefinitions = () => DEFINITIONS;
RATINGS.getDefaultDefinitions = () => DEFAULT_DEFINITIONS;

RATINGS.updateDefinitions = newDefs => {
  DEFINITIONS = [];
  console.log('...updating definitions', JSON.stringify(newDefs));
  newDefs.forEach(def => DEFINITIONS.push(def));
};

RATINGS.getSVGIcon = rating => {
  const svgdefKey = m_getSVGDefKey(rating);
  const def = SVGDEFS.get(svgdefKey);
  if (!def) console.error('No SVG definition found for rating:', rating, 'svgdefKey:', svgdefKey);
  return SVGDEFS.get(svgdefKey).clone();
};

RATINGS.getLabel = rating => {
  const def = m_getDefinition(rating);
  return def ? def.label : m_getDefinition(DEFAULT_RATING).label;
};

RATINGS.getListOrder = () => {
  return DEFINITIONS.map(def => def.rating);
}

export default RATINGS;
