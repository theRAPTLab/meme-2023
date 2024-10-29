import DEFAULTS from './defaults';
const { SVGDEFS } = DEFAULTS;

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const RATINGS_ICONS = [];
RATINGS_ICONS[-2] = 'ratingsDisagreeStrongly';
RATINGS_ICONS[-1] = 'ratingsDisagree';
RATINGS_ICONS[0] = 'ratingsNone';
RATINGS_ICONS[1] = 'ratingsAgree';
RATINGS_ICONS[2] = 'ratingsAgreeStrongly';
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const RATINGS = {};

RATINGS.getSVGIcon = rating => {
  return SVGDEFS.get(RATINGS_ICONS[rating === undefined ? 0 : rating]).clone();
};

export default RATINGS;
