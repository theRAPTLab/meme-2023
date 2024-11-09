import DEFAULTS from './defaults';
const { SVGDEFS } = DEFAULTS;

/// MODULE CONSTANTS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DEFAULT_RATING = 0;
const DEFAULT_DEFINITIONS = [
  {
    label: 'code', // 'Strongly Agrees',
    rating: 2,
    svgdefKey: 'ratingsAgreeStrongly'
  },
  {
    label: 'Agrees',
    rating: 1,
    svgdefKey: 'ratingsAgree'
  },
  {
    label: 'None',
    rating: 0,
    svgdefKey: 'ratingsNone'
  },
  {
    label: 'Disagrees',
    rating: -1,
    svgdefKey: 'ratingsDisagree'
  },
  {
    label: 'Strongly Disagrees',
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
  const def = m_getDefinition(rating);
  // use the current definition, but fall back to default definition if key is not found
  let svgdefKey;
  if (def && def.svgdefKey) {
    svgdefKey = def.svgdefKey;
  } else {
    const defDefault = m_getDefaultDefinition(rating);
    if (defDefault && defDefault.svgdefKey) {
      svgdefKey = defDefault.svgdefKey;
    } else {
      m_getDefinition(DEFAULT_RATING).svgdefKey;
    }
  }
  return svgdefKey;
  // = def ? def.svgdefKey : null;
  // return def ? def.svgdefKey : m_getDefinition(DEFAULT_RATING).svgdefKey;
};


/// MODULE EXPORTS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const RATINGS = {};

RATINGS.getDefinitions = () => DEFINITIONS;
RATINGS.getDefaultDefinitions = () => DEFAULT_DEFINITIONS;

RATINGS.updateDefinitions = newDefs => {
  DEFINITIONS = [];
  newDefs.map(def => DEFINITIONS.push(def));
};

RATINGS.getSVGIcon = rating => {
  const svgdefKey = m_getSVGDefKey(rating);
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
