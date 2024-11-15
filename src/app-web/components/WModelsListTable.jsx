/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Models List Table

Displays a list of all the models in a table format.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import './MEMEStyles.css';
import './WModelsListTable.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
const IcnTrash = <FontAwesomeIcon icon={faTrashCan} />;

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import URTable from '../../system/table/URTable';
import SESSION from '../../system/common-session';
import ADM from '../modules/data';

/// UTILITY METHODS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function HumanDate(timestamp) {
  if (timestamp === undefined || timestamp === '') return '<no date>';
  const date = new Date(timestamp);
  const timestring = date.toLocaleTimeString('en-Us', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const datestring = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  return `${datestring} ${timestring}`;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function RenderTableButton(value, fn) {
  return (
    <button className="transparent" onClick={fn}>
      {value}
    </button>
  );
}

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class WModelsListTable extends React.Component {
  constructor() {
    super();
    this.RendererTitle = this.RendererTitle.bind(this);
    this.RendererAction = this.RendererAction.bind(this);
    this.OnSortClick = this.OnSortClick.bind(this);
  }

  componentDidMount() {}

  componentWillUnmount() {}

  /**
   * Click on the title to open the model
   * @param {object} value { id, title }
   */
  RendererTitle(value) {
    const { isAdmin, OnModelSelect } = this.props;
    if (isAdmin) return value.title;
    else
      return RenderTableButton(value.title + value.id, e => OnModelSelect(value.id));
  }

  /**
   * Displays "Move", "Clone", and "Delete" buttons
   * @param {number} value model.id
   */
  RendererAction(value) {
    const { isAdmin, OnModelMove, OnModelClone, OnModelDelete } = this.props;
    const showAdminOnlyView = SESSION.IsTeacher() || isAdmin;
    return (
      <>
        {showAdminOnlyView && RenderTableButton('MOVE', e => OnModelMove(value))}
        {RenderTableButton('CLONE', e => OnModelClone(value))}
        {showAdminOnlyView &&
          value &&
          RenderTableButton(IcnTrash, e => OnModelDelete(value))}
      </>
    );
  }

  OnSortClick(id) {
    this.setState(state => ({
      order: state.orderBy === id && state.order === 'asc' ? 'desc' : 'asc',
      orderBy: id
    }));
  }

  render() {
    const {
      models,
      isAdmin,
      showGroup,
      OnModelSelect,
      OnModelMove,
      OnModelClone,
      OnModelDelete
    } = this.props;
    const showAdminOnlyView = SESSION.IsTeacher() || isAdmin;

    const COLUMNDEFS = [
      {
        title: 'TITLE',
        renderer: this.RendererTitle,
        columnSorting: {
          compareFunctionFactory: (sortOrder, columnMeta) => {
            const order = sortOrder === 'asc' ? 1 : -1;
            return (a, b) => {
              if (a.title < b.title) return order * -1;
              if (a.title > b.title) return order;
              return 0;
            };
          }
        },
        data: 'title'
      },
      {
        title: 'UPDATED',
        type: 'text',
        data: 'dateModified'
      },
      {
        title: 'CREATED',
        type: 'text',
        data: 'dateCreated'
      },
      {
        title: '-',
        renderer: this.RendererAction,
        columnSorting: {
          headerAction: false
        },
        data: 'id'
      }
    ];
    if (showAdminOnlyView) {
      COLUMNDEFS.splice(1, 0, {
        title: 'CLASSROOM:GROUP',
        type: 'text',
        data: 'groupLabel'
      });
    } else if (showGroup) {
      COLUMNDEFS.splice(1, 0, {
        title: 'GROUP',
        type: 'text',
        data: 'groupLabel'
      });
    }

    const COLWIDTHS = [200, 110, 110, 200];
    if (showAdminOnlyView || showGroup) COLWIDTHS.splice(1, 0, 110);

    const modelsWithGroupLabels = models.map(m => {
      return Object.assign(
        {}, // make a copy of the model otherwise we're modifying the original by reference
        m,
        {
          // stuff `id` into `title` for the button renderer
          title: { id: m.id, title: m.title }
        },
        {
          // in showAdminOnlyView, also show Classrooms
          groupLabel: showAdminOnlyView
            ? `${ADM.GetClassroomNameByGroup(m.groupId)}:${ADM.GetGroupName(m.groupId)}`
            : ADM.GetGroupName(m.groupId)
        }
      );
    });
    const TABLEDATA = modelsWithGroupLabels.map(model => {
      return {
        id: model.id,
        title: model.title,
        groupLabel: model.groupLabel,
        dateModified: HumanDate(model.dateModified),
        dateCreated: HumanDate(model.dateCreated)
      };
    });

    return (
      <div className="WModelsListTable">
        <URTable isOpen={true} data={TABLEDATA} columns={COLUMNDEFS} />
      </div>
    );
  }
}

WModelsListTable.propTypes = {
  models: PropTypes.array,
  isAdmin: PropTypes.bool,
  showGroup: PropTypes.bool,
  OnModelSelect: PropTypes.func,
  OnModelMove: PropTypes.func,
  OnModelClone: PropTypes.func,
  OnModelDelete: PropTypes.func
};

WModelsListTable.defaultProps = {
  models: [],
  isAdmin: false,
  showGroup: false,
  OnModelSelect: () => {
    console.error('Missing OnModeSelect handler');
  },
  OnModelMove: () => {
    console.error('Missing OnModelMove handler');
  },
  OnModelClone: () => {
    console.error('Missing OnModelClone handler');
  },
  OnModelDelete: () => {
    console.error('Missing OnModelDelete handler');
  }
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WModelsListTable;
