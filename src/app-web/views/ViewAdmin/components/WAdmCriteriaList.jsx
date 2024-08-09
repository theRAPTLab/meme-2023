/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Criteria List

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import '../../../components/MEMEStyles.css';
import './WAdmCriteriaList.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
const IcnTrash = <FontAwesomeIcon icon={faTrashCan} />;

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../../../system/ursys';
import MDReactComponent from 'react-markdown';

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'WCriteriaList';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class WCriteriaList extends React.Component {
  render() {
    const { Criteria, IsInEditMode, UpdateField, OnDeleteCriteriaClick } = this.props;

    const VIEWMODE = (
      <div className="view">
        <div className="heading">
          <div>LABEL</div>
          <div>DESCRIPTION</div>
        </div>
        {Criteria.map(crit => (
          <div className="item" key={crit.id}>
            <div>{crit.label}</div>
            <MDReactComponent>{crit.description}</MDReactComponent>
          </div>
        ))}
      </div>
    );

    const EDITMODE = (
      <div className="edit">
        <div className="heading">
          <div>LABEL</div>
          <div>DESCRIPTION</div>
          <div></div>
        </div>
        {Criteria.map(crit => (
          <div className="item" key={crit.id}>
            <input
              value={crit.label}
              placeholder="Label"
              onChange={e => UpdateField(crit.id, 'label', e.target.value)}
            />
            <input
              value={crit.description}
              placeholder="Description"
              onChange={e => UpdateField(crit.id, 'description', e.target.value)}
            />
            <button
              className="transparent"
              onClick={() => OnDeleteCriteriaClick(crit.id)}
            >
              {IcnTrash}
            </button>
          </div>
        ))}
      </div>
    );

    return <div className="WCriteriaList">{IsInEditMode ? EDITMODE : VIEWMODE}</div>;
  }
}

WCriteriaList.propTypes = {
  Criteria: PropTypes.array,
  IsInEditMode: PropTypes.bool,
  UpdateField: PropTypes.func,
  OnDeleteCriteriaClick: PropTypes.func
};

WCriteriaList.defaultProps = {
  Criteria: [],
  IsInEditMode: false,
  UpdateField: () => {
    console.error('Missing UpdateField handler');
  },
  OnDeleteCriteriaClick: () => {
    console.error('Missing OnDeleteCriteriaClick handler');
  }
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WCriteriaList;
