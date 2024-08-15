/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Sentence Starters

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import '../../../components/MEMEStyles.css';
import './WAdmSentenceStarters.css';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '../../../../system/ursys';
import ADM from '../../../modules/data';
import ADMObj from '../../../modules/adm-objects';

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'AdmSentenceStarters';
const defaultSentenceStarter =
  "I think this is a good idea because...\nI don't think this makes sense because...";

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class WSentenceStarters extends React.Component {
  constructor(props) {
    super(props);
    this.DoClassroomSelect = this.DoClassroomSelect.bind(this);
    this.DoLoadSentences = this.DoLoadSentences.bind(this);
    this.OnEditClick = this.OnEditClick.bind(this);
    this.OnSaveClick = this.OnSaveClick.bind(this);
    this.OnTextChange = this.OnTextChange.bind(this);

    this.state = {
      id: '',
      sentences: '',
      isInEditMode: false,
      classroomId: ''
    };

    UR.Subscribe('CLASSROOM_SELECT', this.DoClassroomSelect);
    UR.Subscribe('ADM_DATA_UPDATED', this.DoLoadSentences);
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubscribe('CLASSROOM_SELECT', this.DoClassroomSelect);
    UR.Unsubscribe('ADM_DATA_UPDATED', this.DoLoadSentences);
  }

  DoClassroomSelect(data) {
    this.setState(
      {
        classroomId: data.classroomId
      },
      () => {
        this.DoLoadSentences();
      }
    );
  }

  DoLoadSentences() {
    const { classroomId } = this.state;
    if (classroomId == undefined) return;

    let sentenceStarter = ADM.GetSentenceStartersByClassroom(classroomId);

    // Create default sentence starters if none have been defined.
    if (sentenceStarter === undefined) {
      ADM.DB_SentenceStarterNew({ classroomId });
      return;
    }
    const { id, sentences } = sentenceStarter;
    this.setState({
      id,
      sentences
    });
  }

  OnEditClick() {
    this.setState(state => {
      return {
        isInEditMode: true,
        sentences: state.sentences === '' ? defaultSentenceStarter : state.sentences
      };
    });
  }

  OnSaveClick() {
    const { id, sentences, classroomId } = this.state;
    const sentenceStarter = ADMObj.SentenceStarter({
      id,
      classroomId,
      sentences
    });
    ADM.DB_SentenceStarterUpdate(sentenceStarter);
    this.setState({
      isInEditMode: false
    });
  }

  OnTextChange(e) {
    this.setState({
      sentences: e.target.value
    });
  }

  render() {
    const { sentences, isInEditMode, classroomId } = this.state;

    return (
      <div className="WAdmSentenceStarters dialog">
        <h3>SENTENCE STARTERS</h3>
        <input
          type="text"
          value={sentences}
          onChange={this.OnTextChange}
          disabled={!isInEditMode}
        />
        <button
          onClick={this.OnEditClick}
          hidden={isInEditMode}
          disabled={classroomId === ''}
        >
          Edit Sentence Starters
        </button>
        <button className="primary" onClick={this.OnSaveClick} hidden={!isInEditMode}>
          Save
        </button>
      </div>
    );
  }
}

WSentenceStarters.propTypes = {};

WSentenceStarters.defaultProps = {};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default WSentenceStarters;
