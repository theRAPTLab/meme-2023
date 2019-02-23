import React from 'react';
import PropTypes from 'prop-types';
import ViewMain from '../ViewMain';
import ViewBasic from '../ViewBasic';

// declare main view routes here
// list more specific routes first
// url format is host:3000/#dev
const SystemRoutes = [
  {
    path: '/basic',
    exact: true,
    component: ViewBasic
  },
  {
    path: '/',
    exact: true,
    component: ViewMain
  },
  {
    path: '*',
    restricted: false,
    component: NoMatch
  }
];

function NoMatch(props) {
  const hash = props.location.pathname.substring(1);
  return (
    <div>
      ViewNoMatch: route no match <tt>#{hash}</tt>
    </div>
  );
}
NoMatch.propTypes = {
  // eslint and proptypes interact poorly and this is OK
  // eslint-disable-next-line react/forbid-prop-types
  location: PropTypes.object
};
NoMatch.defaultProps = {
  // this disables another eslint complaint
  location: null
};

export default SystemRoutes;
