/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Resource Item

For each Resource in the Evidence Library, this component displays the
list of EVLink items associated with the Resource.


\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import './MEMEStyles.css';
import './EVResourceItem.css';

import EVResourceItemTitleBar from './EVResourceItemTitleBar';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../system/ursys';
import DATA from '../modules/data';
import DEFAULTS from '../modules/defaults';
import EVList from './EVList';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'EVResourceItem:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class EVResourceItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: true,
      hideAddButton: false
    };

    this.DoToggleExpanded = this.DoToggleExpanded.bind(this);
    this.DoEvidenceLinkOpen = this.DoEvidenceLinkOpen.bind(this);
    this.DoEvidenceEditStateUpdate = this.DoEvidenceEditStateUpdate.bind(this);
    this.DoDataUpdate = this.DoDataUpdate.bind(this);
    this.OnResourceClick = this.OnResourceClick.bind(this);
    this.OnCreateEvidence = this.OnCreateEvidence.bind(this);
    this.DoCollapseAll = this.DoCollapseAll.bind(this);
    this.evt_OnExpand = this.evt_OnExpand.bind(this);

    UR.Subscribe('SHOW_EVIDENCE_LINK', this.DoEvidenceLinkOpen);
    UR.Subscribe('EVIDENCE_EDIT_STATE', this.DoEvidenceEditStateUpdate);
    UR.Subscribe('DATA_UPDATED', this.DoDataUpdate);
    UR.Subscribe('RESOURCES:COLLAPSE_ALL', this.DoCollapseAll);
    // FIXME: Resource is getting closed before selection, force it open again
    UR.Subscribe('SET_EVIDENCE_LINK_WAIT_FOR_SOURCE_SELECT', this.DoEvidenceLinkOpen);
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubscribe('SHOW_EVIDENCE_LINK', this.DoEvidenceLinkOpen);
    UR.Unsubscribe('EVIDENCE_EDIT_STATE', this.DoEvidenceEditStateUpdate);
    UR.Unsubscribe('DATA_UPDATED', this.DoDataUpdate);
    UR.Unsubscribe('RESOURCES:COLLAPSE_ALL', this.DoCollapseAll);
    UR.Unsubscribe(
      'SET_EVIDENCE_LINK_WAIT_FOR_SOURCE_SELECT',
      this.DoEvidenceLinkOpen
    );
  }

  DoToggleExpanded(event) {
    event.stopPropagation();
    event.preventDefault();
    if (DBG) console.log(PKG, 'expansion clicked');
    this.setState(prevState => {
      return {
        isExpanded: !prevState.isExpanded
      };
    });
  }

  DoDataUpdate() {}

  DoEvidenceLinkOpen(data) {
    if (this.props.resource.id === data.rsrcId) {
      if (DBG)
        console.log(PKG, 'OPENING Resource', data.rsrcId, ' data.evId is', data);
      this.setState(
        {
          isExpanded: true
        },
        () => {
          // First open resource list, then open evidence Link
          UR.Publish('SHOW_EVIDENCE_LINK_SECONDARY', data);
        }
      );
    }
  }

  DoEvidenceEditStateUpdate(data) {
    this.setState({ hideAddButton: data.isBeingEdited });
  }

  OnResourceClick(rsrcId) {
    if (DBG) console.log(PKG, 'Resource clicked', rsrcId);
    UR.Publish('RESOURCEVIEW:OPEN', { rsrcId });
  }

  OnCreateEvidence(rsrcId) {
    if (DBG) console.log(PKG, 'create new evidence:', rsrcId);
    DATA.PMC_AddEvidenceLink({ rsrcId }, id =>
      UR.Publish('SHOW_EVIDENCE_LINK', { evId: id, rsrcId })
    );
  }

  DoCollapseAll() {
    if (this) {
      this.setState({ isExpanded: false });
    }
  }

  evt_OnExpand() {
    const { isExpanded } = this.state;
    this.setState({ isExpanded: !isExpanded });
  }

  render() {
    const { resource } = this.props;
    const { isExpanded, hideAddButton } = this.state;

    return (
      <div
        className={`EVResourceItem ${isExpanded ? 'expanded' : ''}`}
          onClick={() => this.OnResourceClick(resource.id)}
        >
        <EVResourceItemTitleBar resource={resource} onExpand={this.evt_OnExpand} />
        {isExpanded && (
          <div className="ev-list">
            <EVList rsrcId={resource.id} />
            <div className="emulate-evlink">
              <div>
                <button
              onClick={() => this.OnCreateEvidence(resource.id)}
              hidden={DATA.IsViewOnly() || hideAddButton}
            >
                  + {DEFAULTS.TEXT.ADD_EVIDENCE}
                </button>
          </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default EVResourceItem;
