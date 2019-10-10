/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  DATA

  A wrapper for the ADM DATA and PMC DATA structures

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import ADM from './adm-data';
import PMC from './pmc-data';
import VM from './vm-data';
import UR from '../../system/ursys';
import DATAMAP from '../../system/common-datamap';
import SESSION from '../../system/common-session';
import ASET from './adm-settings';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const ULINK = UR.NewConnection('data');
const DBG = false;

/// URSYS HOOKS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
UR.Hook(__dirname, 'INITIALIZE', () => {
  console.log('*** INITIALIZING DATA ***');
  //
  ULINK.NetSubscribe('NET:SYSTEM_DBSYNC', data => {
    const cmd = data.cmd;
    if (!cmd) throw Error('SYSTEM_DBSYNC packet missing cmd property');
    if (!DATAMAP.ValidateCommand(cmd)) throw Error(`SYSTEM_DBSYNC unrecognized command '${cmd}'`);
    switch (cmd) {
      case 'add':
        ADM.SyncAddedData(data);
        PMC.SyncAddedData(data);
        break;
      case 'update':
        ADM.SyncUpdatedData(data);
        PMC.SyncUpdatedData(data);
        break;
      case 'remove':
        ADM.SyncRemovedData(data);
        PMC.SyncRemovedData(data);
        break;
      default:
        console.error('unrecognized command', cmd);
    }
    if (DBG) console.log(`SYSTEM_DBSYNC '${cmd}'\n`, data);
  });
});

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// clone ADMData, PMC, VM into $ object
const $$$ = Object.assign({ ...ADM }, { ...PMC }, { ...VM });
const NEW = {};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NEW.Login = loginToken => {
  const urs = window.URSESSION;
  if (!urs) throw Error('unexpected missing URSESSION global');
  return UR.NetCall('NET:SRV_SESSION_LOGIN', { token: loginToken }).then(rdata => {
    if (DBG) console.log('login', rdata);
    if (rdata.error) throw Error(rdata.error);
    if (DBG) console.log('updating URSESSION with session data');
    urs.SESSION_Token = rdata.token;
    urs.SESSION_Key = rdata.key;
    // also save globally
    SESSION.DecodeAndSet(rdata.token);
    SESSION.SetAccessKey(rdata.key);
    //
    ADM.GetSelectedStudentId();
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NEW.Logout = () => {
  const urs = window.URSESSION;
  if (!urs) throw Error('unexpected missing URSESSION global');
  if (!urs.SESSION_Key) throw Error('missing URSESSION session key');
  return UR.NetCall('NET:SRV_SESSION_LOGOUT', { key: urs.SESSION_Key }).then(rdata => {
    console.log('logout', rdata);
    if (rdata.error) throw Error(rdata.error);
    console.log('removing session data from URSESSION');
    if (urs.SESSION_Token && urs.SESSION_Key) {
      urs.SESSION_Token = '';
      urs.SESSION_Key = '';
      SESSION.Clear();
    } else throw Error('URSESSION key or token was not set');
  });
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\
                                A D M - D A T A
                                O V E R R I D E
\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NEW.AddTeacher = name => {
  console.log('addTeacher', name, typeof name);
  if (typeof name !== 'string') throw Error('AddTeacher requires a single name');
  return UR.DBQuery('add', {
    teachers: { name }
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NEW.SetClassesModelVisibility = isVisible => {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NEW.AddClassroom = name => {
  // FIRES 'CLASSROOM_SELECT' classroomId, needsUpdating
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NEW.AddGroup = groupName => {
  // FIRES 'ADM_DATA_UPDATED'
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// this is a test routine; no ADMData routines require a delete group
/// so this is here to just provide a stub.
NEW.DeleteGroup = groupData => {
  return UR.DBQuery('remove', {
    groups: groupData
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NEW.UpdateGroup = (groupId, group) => {
  const groupData = Object.assign({}, group, { id: groupId });
  return UR.DBQuery('update', {
    groups: groupData
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NEW.AddStudents = (groupId, students) => {
  // Update the group
  if (!Array.isArray(students)) students = [students];
  let group = $$$.GetGroup(groupId);
  if (group === undefined) {
    console.error('AddStudent could not find group', groupId);
    return;
  }
  students.forEach(student => {
    if (student === undefined || student === '') {
      console.error('AddStudent adding blank student', groupId);
    }
    group.students.push(student);
  });
  return NEW.UpdateGroup(groupId, group);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NEW.DeleteStudent = (groupId, student) => {
  // Update the group
  if (typeof student !== 'string') {
    console.error('DeleteStudent arg2 must be string');
    return;
  }
  let group = $$$.GetGroup(groupId);
  if (group === undefined) {
    console.error('DeleteStudent could not find group', groupId);
    return;
  }
  // Remove the student
  group.students = group.students.filter(stu => student !== stu);
  // Now update groups, returning promise
  return NEW.UpdateGroup(groupId, group);
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\
                                P M C - D A T A
                                O V E R R I D E
\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

NEW.PMC_PropAdd = name => {
  // FIXME
  // Temporarily insert a random numeric prop id
  // This will get replaced with a server promise once that's implemented
  const propId = Math.trunc(Math.random() * 10000000000).toString();
  m_graph.setNode(propId, { name });
  $$$.BuildModel();
  UTILS.RLog('PropertyAdd', name);
  return `added node:name ${name}`;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NEW.PMC_PropUpdate = (nodeId, newData) => {
  const prop = m_graph.node(nodeId);
  // make a copy of the prop with overwritten new data
  // local data will be updated on DBSYNC event, so don't write it here
  const propData = Object.assign({ id: nodeId }, prop, newData);
  console.log('prop', prop, 'newdata', newData, 'propdata', propData);
  const modelId = ASET.selectedModelId;
  // we need to update pmcdata which looks like
  // { id, entities:[ { id, name } ] }
  return UR.DBQuery('update', {
    'pmcData.entities': {
      id: modelId,
      entities: propData
    }
  })
    .then(rdata => {
      $$$.BuildModel();
    })
    .catch(err => {
      console.error(PR, err);
    });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NEW.PMC_PropDelete = propId => {
  // largely this has to just send the message
  const modelId = ASET.selectedModelId;
  return UR.DBQuery('remove', {
    'pmcData.entities': {
      id: modelId,
      entities: [propId]
    }
  })
    .then(rdata => {
      if (rdata.error) console.log(rdata.error);
      else {
        console.log('got', rdata);
        $$$.BuildModel();
      }
    })
    .catch(err => {
      console.error(err);
    });
  /*/
  // Unlink any evidence
  const evlinks = $$$.PMC_GetEvLinksByPropId(propId);
  if (evlinks)
    evlinks.forEach(evlink => {
      $$$.SetEvidenceLinkPropId(evlink.id, undefined);
    });
  // Delete any children nodes
  const children = $$$.Children(propId);
  if (children)
    children.forEach(cid => {
      $$$.PMC_SetPropParent(cid, undefined);
    });
  // Then remove propId
  m_graph.removeNode(propId);
  $$$.BuildModel();
  UTILS.RLog('PropertyDelete', propId);
  /*/
  return `deleted propId ${propId}`;
}; // m_graph.removeNode(propid)

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NEW.PMC_SetPropParent = (node, parent) => {}; // m_graph.setParent(node, parent)
NEW.PMC_MechAdd = (sourceId, targetId, label) => {}; // m_graph.setEdge
NEW.PMC_MechUpdate = (origMech, newMech) => {}; // m_graph.setEdge()
NEW.PMC_MechDelete = mechId => {}; // m_graph.removeEdge()
NEW.PMC_AddEvidenceLink = (rsrcId, note) => {}; // a_evidence.push()
NEW.PMC_DeleteEvidenceLink = evId => {}; // a_evidence.splice()
NEW.SetEvidenceLinkPropId = (evId, propId) => {}; // a_evidence.find() evidence
NEW.SetEvidenceLinkMechId = (evId, mechId) => {}; // a_evidence.find() evidence

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// STATE CALLS
/// $$$.SelectTeacher(teacherId)
/// $$$.SelectClassroom(classroomId = GetClassroomIdByStudent)
/// $$$.Login sets .selectedStudentId

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\
                                   O T H E R
                                O V E R R I D E
\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NEW.ModelTitleUpdate = (modelId, title) => {
  // FIRES 'MODEL_TITLE_UPDATED' title
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NEW.NewModel = groupId => {
  // FIRES 'ADM_DATA_UPDATED'
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NEW.UpdateCriteria = criteria => {}; //
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NEW.UpdateCriteriaList = criteria => {}; //
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NEW.UpdateSentenceStarter = sstarter => {}; //
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NEW.UpdateRatingsDefinitions = (classId, rateDef) => {}; //

/// MODULE HELPERS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// DEBUG /////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
if (!window.ur) window.ur = {};
window.ur.DATATEST = NEW;
// - - - - - - - - - - - - - - - - - - - - -
// test update group
window.ur.tupg = id => {
  const g = ADM.GetGroup(id);
  g.name = `${g.name}${g.name}`;
  NEW.UpdateGroup(id, g).then(data => {
    console.log('updategroup', data);
  });
};
// test add teacher
window.ur.taddt = name => {
  NEW.AddTeacher(name).then(data => {
    console.log('addteacher', data);
    const teacher = data.teachers[0];
    UR.Publish('TEACHER_SELECT', { teacherId: teacher.id });
  });
};
// test add students to group
window.ur.tadds = (groupId, students) => {
  NEW.AddStudents(groupId, students).then(data => {
    console.log('addstudents', data);
    // FIRES 'ADM_DATA_UPDATED'
    UR.Publish('ADM_DATA_UPDATED');
  });
  return `adding ${JSON.stringify(students)} to group ${groupId}`;
};
// test delete student from group
window.ur.tdels = (groupId, student) => {
  NEW.DeleteStudent(groupId, student).then(data => {
    console.log('deletestudent', data);
    // FIRES 'ADM_DATA_UPDATED'
    UR.Publish('ADM_DATA_UPDATED');
  });
  return `deleting student  ${student} from group ${groupId}`;
};
// test remove group
window.ur.trmg = groupId => {
  NEW.DeleteGroup(groupId).then(data => {
    console.log('deletegroup', data);
    // FIRES 'ADM_DATA_UPDATED'
    UR.Publish('ADM_DATA_UPDATED');
  });
  return `deleting group ${groupId}`;
};
// - - - - - - - - - - - - - - - - - - - - -
// test pmc entity delete
window.ur.tpropd = propId => {
  NEW.PMC_PropDelete(propId).then(data => {
    console.log('deleteprop', data);
  });
  return `deleting pmc prop`;
};
// - - - - - - - - - - - - - - - - - - - - -
// test login
window.ur.tlogin = token => {
  $$$.Login(token).then(() => {
    window.ur.clientinfo();
  });
  return 'logging in...';
};
// test logout
window.ur.tlogout = () => {
  $$$.Logout().then(() => {
    window.ur.clientinfo();
  });
  return 'logging out...';
};

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// $ is the combined ADM, PMC, VM plus overrides
export default $$$;
/// export default MODULE; // import $ from './module'
/// export default MyClass; // import MyClass from  './module'
/// export { A, B }; // import { A, B } from './module'
/// export { A as B }; // import { B } from './module'
