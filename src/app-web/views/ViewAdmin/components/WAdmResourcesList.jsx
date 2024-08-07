/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Resources List View

All resources are available for all classrooms.
Each classroom can define its own subset of resources to display.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import '../../../components/MEMEStyles.css';
import './WAdmResourcesList.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
const IcnTrash = <FontAwesomeIcon icon={faTrashCan} />;

/// Change eto pull from the same array as being used elsewhere (resourceView and resourceItem)
const resourceTypeList = 'report, simulation, idea, assuption, question, or other';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../../../system/ursys';
import ADM from '../../../modules/data';
import ADMObj from '../../../modules/adm-objects';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class WResourcesList extends React.Component {
  constructor(props) {
    super(props);
    this.DoClassroomSelect = this.DoClassroomSelect.bind(this);
    this.DoADMDataUpdate = this.DoADMDataUpdate.bind(this);
    this.DoEditResource = this.DoEditResource.bind(this);
    this.DoDeleteResource = this.DoDeleteResource.bind(this);
    this.OnResourceCheck = this.OnResourceCheck.bind(this);
    this.OnAddClick = this.OnAddClick.bind(this);
    this.OnLabelChange = this.OnLabelChange.bind(this);
    this.OnNotesChange = this.OnNotesChange.bind(this);
    this.OnTypeChange = this.OnTypeChange.bind(this);
    this.OnURLChange = this.OnURLChange.bind(this);
    this.OnUpdateResource = this.OnUpdateResource.bind(this);
    this.OnDialogCloseClick = this.OnDialogCloseClick.bind(this);

    this.state = {
      classroomResources: [],
      classroomId: '',
      showDialog: false,
      dialogId: -1,
      dialogLabel: '',
      dialogNotes: '',
      dialogType: '',
      dialogURL: ''
    };

    UR.Subscribe('CLASSROOM_SELECT', this.DoClassroomSelect);
    UR.Subscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate); // Broadcast when a resource is updated.
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubscribe('CLASSROOM_SELECT', this.DoClassroomSelect);
    UR.Unsubscribe('ADM_DATA_UPDATED', this.DoADMDataUpdate);
  }

  DoClassroomSelect(data) {
    this.setState({
      classroomResources: ADM.GetResourcesForClassroom(data.classroomId),
      classroomId: data.classroomId
    });
  }

  // Update the groups list from ADMData in case a new group was added
  DoADMDataUpdate(data) {
    const classroomId = this.state.classroomId;
    if (classroomId) {
      this.setState({
        classroomResources: ADM.GetResourcesForClassroom(classroomId)
      });
    } else if (data.resources) {
      // Resources were update, so force render to load latest resources
      this.forceUpdate();
    }
  }

  DoEditResource(id) {
    const res = ADM.Resource(id);
    this.setState({
      showDialog: true,
      dialogId: id,
      dialogLabel: res.label,
      dialogNotes: res.notes,
      dialogType: res.type,
      dialogURL: res.url
    });
  }

  DoDeleteResource(rsrcId) {
    ADM.DB_ResourceDelete(rsrcId);
  }

  OnResourceCheck(rsrcId, checked) {
    ADM.DB_ClassroomResourceSet(rsrcId, checked, this.state.classroomId);
  }

  OnAddClick() {
    const resource = ADMObj.Resource();
    this.setState({
      showDialog: true,
      dialogId: resource.id,
      dialogLabel: resource.label,
      dialogNotes: resource.notes,
      dialogType: resource.type,
      dialogURL: resource.url
    });
  }

  OnLabelChange(e) {
    this.setState({ dialogLabel: e.target.value });
  }

  OnNotesChange(e) {
    this.setState({ dialogNotes: e.target.value });
  }

  OnTypeChange(e) {
    this.setState({ dialogType: e.target.value });
  }

  OnURLChange(e) {
    this.setState({ dialogURL: e.target.value });
  }

  OnUpdateResource(e) {
    e.preventDefault();
    e.stopPropagation();
    const resource = ADMObj.Resource({
      id: this.state.dialogId,
      label: this.state.dialogLabel,
      notes: this.state.dialogNotes,
      type: this.state.dialogType,
      url: this.state.dialogURL
    });
    if (resource.id === undefined) {
      // Add new resource
      ADM.DB_ResourceAdd(resource);
    } else {
      // Update existing resource
      ADM.DB_ResourceUpdate(resource);
    }
    this.OnDialogCloseClick();
  }

  OnDialogCloseClick() {
    this.setState({
      showDialog: false
    });
  }

  render() {
    const {
      classroomResources,
      classroomId,
      showDialog,
      dialogLabel,
      dialogNotes,
      dialogType,
      dialogURL
    } = this.state;
    const resources = ADM.AllResources();
    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const DIALOG = showDialog && (
      <div className="dialog-container">
        <div className="dialog">
          <h3>Edit Resource</h3>
          <p>Instructions</p>
          <ol>
            <li>Copy the resource file into the `/resources` folder</li>
            <li>Add a label and notes</li>
            <li>
              Enter {resourceTypeList} for the type. Or you can enter a custom value.
            </li>
            <li>
              Enter the URL. e.g. if your resource file name is `myReport.pdf', enter
              'myReport.pdf'. For a resource file located within a sub-directory,
              enter 'subdirectory/myReport.pdf'. It is important to use the '/' slash
              and right upper/lowercase!
            </li>
            <li>Don't forget to enable the resource for a classroom!</li>
          </ol>
          <p>IMPORTANT: Make sure you test your resource!</p>
          <form onSubmit={this.OnUpdateResource}>
            <div className="labelbox">
              <label htmlFor="label">Label</label>
              <input
                autoFocus
                type="text"
                id="label"
                placeholder="Fish in a Tank Simulation"
                value={dialogLabel}
                onChange={this.OnLabelChange}
              />
            </div>
            <div className="labelbox">
              <label htmlFor="notes">Notes</label>
              <input
                type="text"
                id="notes"
                placeholder="Five to ten word description."
                value={dialogNotes}
                onChange={this.OnNotesChange}
              />
            </div>
            <div className="labelbox">
              <label htmlFor="type">Type</label>
              <input
                type="text"
                id="type"
                placeholder={resourceTypeList}
                value={dialogType}
                onChange={this.OnTypeChange}
              />
            </div>
            <div className="labelbox">
              <label htmlFor="url">URL</label>
              <input
                type="text"
                id="url"
                placeholder="filename.ext"
                value={dialogURL}
                onChange={this.OnURLChange}
              />
            </div>
            <div className="controlbar">
              <button className="close" onClick={this.OnDialogCloseClick}>
                Cancel
              </button>
              <button className="primary" type="submit">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    return (
      <div className="WAdmResourcesList dialog">
        <h3>Resources (Evidence)</h3>
        <table>
          <thead>
            <tr>
              <th>INCL. FOR CLASSROOM</th>
              <th />
              <th>ID</th>
              <th>LABEL</th>
              <th>NOTES</th>
              <th>TYPE</th>
              <th>URL</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {resources.map(resource => (
              <tr key={resource.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={
                      classroomResources.find(res => res.id === resource.id)
                        ? true
                        : false
                    }
                    onChange={e =>
                      this.OnResourceCheck(resource.id, e.target.checked)
                    }
                    disabled={classroomId === ''}
                  />
                </td>
                <td>
                  <button
                    className="transparent"
                    onClick={() => this.DoEditResource(resource.id)}
                  >
                    Edit
                  </button>
                </td>
                <td>{resource.id}</td>
                <td>{resource.label}</td>
                <td>{resource.notes}</td>
                <td>{resource.type}</td>
                <td>{resource.url}</td>
                <td>
                  <button
                    className="transparent"
                    onClick={() => this.DoDeleteResource(resource.id)}
                  >
                    {IcnTrash}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={this.OnAddClick}>Add Resource</button>
        {DIALOG}
      </div>
    );
  }
}

WResourcesList.propTypes = {};

WResourcesList.defaultProps = {};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WResourcesList;
