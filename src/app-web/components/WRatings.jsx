/// DEPRECATED
/// This is the old ratings system that used multiple +/- icons to represent
/// customizable ratings.
///
/// This has been replaced by `class-ratings.js`, which uses svg emoticons.

import React from 'react';

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const DEFINITIONS = [
  {
    label: 'Strongly Agrees',
    rating: 2,
    icon: <img src="/static/rating_strongly_agrees_16px.svg" alt="Strongly Agrees" />
  },
  {
    label: 'Agrees',
    rating: 1,
    icon: <img src="/static/rating_agrees_16px.svg" alt="Agrees" />
  },
  {
    label: 'None',
    rating: 0,
    icon: <img src="/static/rating_none_16px.svg" alt="None" />
  },
  {
    label: 'Disagrees',
    rating: -1,
    icon: <img src="/static/rating_disagrees_16px.svg" alt="Disgrees" />
  },
  {
    label: 'Strongly Disagrees',
    rating: -2,
    icon: (
      <img
        src="/static/rating_strongly_disagrees_16px.svg"
        alt="Strongly Disagrees"
      />
    )
  }
];

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const RATINGS = {};

RATINGS.getDefinitions = () => DEFINITIONS;

RATINGS.getIcon = rating => {
  const result = DEFINITIONS.find(r => r.rating === Number(rating));
  return result ? result.icon : '';
};

export default RATINGS;
