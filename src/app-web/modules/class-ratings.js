import DEFAULTS from './defaults';
const { SVGDEFS } = DEFAULTS;

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const RATINGS_LABELS = [];
RATINGS_LABELS[-2] = 'Strongly Disagrees';
RATINGS_LABELS[-1] = 'Disagrees';
RATINGS_LABELS[0] = 'None';
RATINGS_LABELS[1] = 'Agrees';
RATINGS_LABELS[2] = 'Strongly Agrees';

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

RATINGS.getLabel = rating => {
  return RATINGS_LABELS[rating] || RATINGS_LABELS[0]; // default to 'None'
};

RATINGS.getListOrder = () => {
  return [2, 1, 0, -1, -2];
}

export default RATINGS;
