/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  DATA

  A wrapper for the ADM DATA and PMC DATA structures

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import ADM from './adm-data';
import PMC from './pmc-data';
import UR from '../../system/ursys';
import DATAMAP from '../../system/common-datamap';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// clone ADMData
const MOD = Object.assign({ ...ADM }, { ...PMC });
const MIR = {};

/// OVERRIDE SELECT ADM DATA METHODS //////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MIR.AddTeacher = name => {
  return new Promise((resolve, reject) => {
    UR.NetCall('NET:SRV_DBADD', {
      teachers: { name }
    })
      .then(rdata => resolve(rdata))
      .catch(error => reject(error));
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MIR.SetClassesModelVisibility = isVisible => {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MIR.AddClassroom = name => {
  // FIRES 'CLASSROOM_SELECT' classroomId, needsUpdating
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MIR.AddGroup = groupName => {
  // FIRES 'ADM_DATA_UPDATED'
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MIR.UpdateGroup = (groupId, group) => {
  return new Promise((resolve, reject) => {
    const groupData = Object.assign({}, group, { id: groupId });
    UR.NetCall('NET:SRV_DBUPDATE', {
      groups: [groupData]
    })
      .then(rdata => resolve(rdata))
      .catch(error => reject(error));
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MIR.AddStudents = (groupId, students) => {
  // Update the group
  if (!Array.isArray(students)) students = [students];
  let group = MOD.GetGroup(groupId);
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
  // Now update groups, returning promise
  return new Promise((resolve, reject) => {
    MIR.UpdateGroup(groupId, group)
      .then(rdata => {
        resolve(rdata);
      })
      .catch(err => reject(err));
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MIR.DeleteStudent = (groupId, student) => {
  // Update the group
  if (typeof student !== 'string') {
    console.error('DeleteStudent arg2 must be string');
    return;
  }
  let group = MOD.GetGroup(groupId);
  if (group === undefined) {
    console.error('DeleteStudent could not find group', groupId);
    return;
  }
  // Remove the student
  group.students = group.students.filter(stu => student !== stu);
  // Now update groups, returning promise
  return new Promise((resolve, reject) => {
    MIR.UpdateGroup(groupId, group)
      .then(rdata => {
        resolve(rdata);
      })
      .catch(err => reject(err));
  });
};
// FIRES 'ADM_DATA_UPDATED'
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MIR.Login = loginId => {
  // FIRES 'ADM_DATA_UPDATED'
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MIR.Logout = () => {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MIR.ModelTitleUpdate = (modelId, title) => {
  // FIRES 'MODEL_TITLE_UPDATED' title
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MIR.NewModel = groupId => {
  // FIRES 'ADM_DATA_UPDATED'
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MIR.UpdateCriteria = criteria => {}; //
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MIR.UpdateCriteriaList = criteria => {}; //
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MIR.UpdateSentenceStarter = sstarter => {}; //
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
MIR.UpdateRatingsDefinitions = (classId, rateDef) => {}; //

/// PMC DATA MOD METHODS //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// MODULE HELPERS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// debug
window.mdat = MIR;
// test update group
window.mdat.tupg = id => {
  const g = ADM.GetGroup(id);
  g.name = `${g.name}${g.name}`;
  MIR.UpdateGroup(id, g).then(data => {
    console.log('updategroup', data);
  });
};
// test add teacher
window.mdat.taddt = name => {
  MIR.AddTeacher(name).then(data => {
    console.log('addteacher', data);
    UR.Publish('TEACHER_SELECT', { teacherId: teacher.id });
  });
};
// test add students to group
window.mdat.tadds = (groupId, students) => {
  MIR.AddStudents(groupId, students).then(data => {
    console.log('addstudents', data);
    // FIRES 'ADM_DATA_UPDATED'
    UR.Publish('ADM_DATA_UPDATED');
  });
};
// test delete student from group
window.mdat.tdels = (groupId, student) => {
  MIR.DeleteStudent(groupId, student).then(data => {
    console.log('deletestudent', data);
    // FIRES 'ADM_DATA_UPDATED'
    UR.Publish('ADM_DATA_UPDATED');
  });
};

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default MOD;
/// export default MODULE; // import MOD from './module'
/// export default MyClass; // import MyClass from  './module'
/// export { A, B }; // import { A, B } from './module'
/// export { A as B }; // import { B } from './module'
