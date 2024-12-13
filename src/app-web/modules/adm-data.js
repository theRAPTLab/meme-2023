import DEFAULTS from './defaults';
import UR from '../../system/ursys';
import SESSION from '../../system/common-session';
import UTILS from './utils';
import DATAMAP from '../../system/common-datamap';
import PMCData from './pmc-data'; // this is a bit problematicn (circular ref)
import ADMObj from './adm-objects';
import ASET from './adm-settings';

const rfdc = require('rfdc')();

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'ADMDATA'; // prefix for console.log

/// MODULE DECLARATION ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @module ADMData
 * @desc
 * A centralized data manager for classroom administration.
 */
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const ADMData = {}; // module object to export

/// MODULE-WIDE DATA //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let adm_db; // set in InitializeData

/// URSYS HOOKS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
UR.Hook(__dirname, 'LOAD_ASSETS', () => {
  // return promise to enable asynchronous loading. This ensures
  // that LOAD_ASSETS phase completes before allowing subsequent
  // phases to run
  return new Promise((resolve, reject) => {
    console.log(PKG, 'LOAD_ASSETS');
    UR.NetCall('NET:SRV_DBGET', {}).then(data => {
      if (data.error) {
        reject(new Error(`server says '${data.error}'`));
        return;
      }
      ADMData.InitializeData(data);
      resolve();
    });
  });
});

/// MODULE DECLARATION ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

ADMData.InitializeData = data => {
  /*/
  All ids are now integers.
  We used to have to scrub them manually, but we were able
  to monkey-patch @dagre/graphlib (which is really old) to
  not convert numeric keys to string keys
  See PMCData.InitializeModel() to see how it's added to the
  m_graph instance.
  /*/
  adm_db = data;
  // clear settings
  ASET.clear();

  // Listener
  UR.Subscribe('ADM_MODEL_MODIFIED', ADMData.OnModelModificationUpdate);

  // dbg info
  if (DBG) console.log('DBG:INITIALIZE: adm_db', adm_db);
};

/// PRIVATE METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// FIXME: This really oought to check to makes ure the id is unique
const GenerateUID = (prefix = '', suffix = '') => {
  return prefix + Math.trunc(Math.random() * 10000000000).toString() + suffix;
};

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** URSYS: DATABASE SYNC
 * Receive a list of ONLY changed objects to the specified collections so
 * adm_db can be updated in a single place. Afterwards, fire any necessary
 * UPDATE or BUILD or SELECT.
 * See common-datamap.js for the collection keys itemized in DBKEYS. Called from
 * data.js.
 * @param {Object} data - a collection object
 */
ADMData.SyncAddedData = data => {
  // the syncitems iterating way
  const syncitems = DATAMAP.ExtractSyncData(data);
  syncitems.forEach(item => {
    const { colkey, subkey, value } = item;
    if (DBG) console.log('SyncAddedData: added', colkey, subkey || '', value);

    switch (colkey) {
      case 'teachers': {
        const teacher = ADMObj.Teacher(value);
        adm_db.teachers.push(teacher);
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      }
      case 'classrooms': {
        const classroom = ADMObj.Classroom(value);
        adm_db.classrooms.push(classroom);
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      }
      case 'groups': {
        const group = ADMObj.Group(value);
        adm_db.groups.push(group);
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      }
      case 'models':
        // Only add it if it doesn't already exist
        // This is necessary because a local call to
        // DB_NewModel will also update adm_db.models.
        if (!ADMData.GetModelById(value.id)) {
          const model = ADMObj.Model(value);
          adm_db.models.push(model);
          UR.Publish('ADM_DATA_UPDATED', data);
        } else {
          // Usually this fires before DB_NewModel's then() so the model is already added
          if (DBG) console.error(`SyncAddedData: Model ${value.id} already added, skipping`);
        }
        break;
      case 'criteria': {
        const crit = ADMObj.Criterion(value);
        adm_db.criteria.push(crit);
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      }
      case 'sentenceStarters': {
        const ss = ADMObj.SentenceStarter(value);
        adm_db.sentenceStarters.push(ss);
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      }
      case 'resources': {
        const resource = ADMObj.Resource(value);
        adm_db.resources.push(resource);
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      }
      case 'classroomResources': {
        const res = ADMObj.ClassroomResource(value);
        adm_db.classroomResources.push(res);
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      }
      case 'ratingsDefinitions': {
        const ratingsDefinition = ADMObj.RatingsDefinition(value);
        adm_db.ratingsDefinitions.push(ratingsDefinition);
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      }
      case 'pmcData':
        // ignore pmcData updates
        // console.log('SyncAddedData got pmcData', value);
        break;
      default:
      // ignore any other updates
      // throw Error('unexpected colkey', colkey);
    }
  });
  /** Old code
  // the manual inspection way (more HACKY)
  if (data.teachers) {
    const teacherId = data.teachers[0];
    adm_db.teachers.push(teacherId);
    ASET.selectedTeacherId = teacherId;
    UR.Publish('ADM_DATA_UPDATED', data);
  }
  // can add better logic to avoid updating too much
   */
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.SyncUpdatedData = data => {
  const syncitems = DATAMAP.ExtractSyncData(data);
  syncitems.forEach(item => {
    const { colkey, subkey, value } = item;
    if (DBG) console.log('updated', colkey, subkey || '', value);
    switch (colkey) {
      case 'teachers': {
        const teacher = ADMData.GetTeacher(value.id);
        teacher.name = value.name;
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      }
      case 'classrooms': {
        const classroom = ADMData.GetClassroom(value.id);
        classroom.name = value.name;
        classroom.canViewOthers = value.canViewOthers;
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      }
      case 'groups': {
        const group = ADMData.GetGroup(value.id);
        group.name = value.name;
        group.students = value.students;
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      }
      case 'models': {
        const model = ADMData.GetModelById(value.id);
        model.dateModified = value.dateModified;
        model.groupId = value.groupId;
        model.deleted = value.deleted;
        UR.Publish('ADM_DATA_UPDATED', data);
        if (model.title !== value.title) {
          model.title = value.title;
          UR.Publish('MODEL_TITLE_UPDATED', { id: value.id, title: value.title });
        }
        break;
      }
      case 'criteria': {
        // criteria always updates the whole object, so we can just replace it
        const crit = ADMObj.Criterion(value);
        const criti = adm_db.criteria.findIndex(c => c.id === crit.id);
        adm_db.criteria.splice(criti, 1, crit);
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      }
      case 'sentenceStarters': {
        // sentenceStarters always updates the whole object, so we can just replace it
        const ss = ADMObj.SentenceStarter(value);
        const ssi = adm_db.sentenceStarters.findIndex(c => c.id === ss.id);
        adm_db.sentenceStarters.splice(ssi, 1, ss);
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      }
      case 'resources': {
        const updatedData = ADMObj.Resource(value);
        const origres = ADMData.Resource(updatedData.id);
        const newres = Object.assign({}, origres, updatedData);
        const resourcei = adm_db.resources.findIndex(c => c.id === updatedData.id);
        adm_db.resources.splice(resourcei, 1, newres);
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      }
      case 'classroomResources': {
        // classroomResources always updates the whole object, so we can just replace it
        const res = ADMObj.ClassroomResource(value);
        const resi = adm_db.classroomResources.findIndex(c => c.id === res.id);
        adm_db.classroomResources.splice(resi, 1, res);
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      }
      case 'ratingsDefinitions': {
        const index = adm_db.ratingsDefinitions.findIndex(r => r.classroomId === value.id);
        const ratingsDefinition = ADMObj.RatingsDefinition(value);
        adm_db.ratingsDefinitions.splice(index, 1, ratingsDefinition);
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      }
      case 'pmcData':
        // ignore pmcData updates
        // console.log('SyncUpdatedData got pmcData', value);
        break;
      default:
      // ignore any other updates
      // throw Error('unexpected colkey', colkey);
    }
  });
  // can add better logic to avoid updating too much
  // UR.Publish('ADM_DATA_UPDATED', data);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.SyncRemovedData = data => {
  const syncitems = DATAMAP.ExtractSyncData(data);
  syncitems.forEach(item => {
    const { colkey, subkey, value } = item;
    if (DBG) console.log('removed', colkey, subkey || '', value);
    switch (colkey) {
      case 'criteria':
        // for some reason value is an array?
        value.forEach(val => {
          const i = adm_db.criteria.findIndex(c => c.id === val.id);
          adm_db.criteria.splice(i, 1);
        });
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      case 'resources': {
        value.forEach(val => {
          const i = adm_db.resources.findIndex(r => r.id === val.id);
          adm_db.resources.splice(i, 1);
        });
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      }
      case 'classroomResources': {
        value.forEach(val => {
          const i = adm_db.classroomResources.findIndex(r => r.id === val.id);
          adm_db.classroomResources.splice(i, 1);
        });
        UR.Publish('ADM_DATA_UPDATED', data);
        break;
      }
      default:
    }
  });
  // can add better logic to avoid updating too much
  // UR.Publish('ADM_DATA_UPDATED', data);
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// TEACHERS //////////////////////////////////////////////////////////////////
///
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Creates a new teacher and then selects the teacher
 *  @param {String} name - New teacher name
 */
ADMData.DB_AddTeacher = name => {
  return UR.DBQuery('add', {
    teachers: { name }
  }).then(rdata => {
    if (rdata.error) throw Error(rdata.error);
    ADMData.SelectTeacher(rdata.teachers[0].id);
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Creates a new teacher and then selects the teacher
 *  @param {String} name - New teacher name
 */
ADMData.DB_UpdateTeacher = teacher => {
  return UR.DBQuery('update', { teachers: teacher }).then(rdata => {
    if (rdata.error) throw Error(rdata.error);
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.GetAllTeachers = () => {
  return adm_db.teachers;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @return {object} Teacher Object, undefined if not found
 */
ADMData.GetTeacher = (teacherId = ASET.selectedTeacherId) => {
  return adm_db.teachers.find(tch => tch.id === teacherId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @param {string} [classroomId = current selected classroomId]
 * @return {object} Teacher Object, undefined if not found
 */
ADMData.GetTeacherByClassroomId = (classroomId = ASET.selectedClassroomId) => {
  const classroom = ADMData.GetClassroom(classroomId);
  if (classroom === undefined || classroom.teacherId === undefined) return undefined;
  return ADMData.GetTeacher(classroom.teacherId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @param {string} [teacherId = current selected teacherId]
 * @return {string} Teacher name, '' if not found
 */
ADMData.GetTeacherName = (teacherId = ASET.selectedTeacherId) => {
  let teacher = ADMData.GetTeacher(teacherId);
  return teacher ? teacher.name : '';
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @param {string} [studentId = current selected studentId]
 * @return {string} Teacher name, '' if not found
 */
ADMData.GetTeacherNameByStudent = (studentId = ASET.selectedStudentId) => {
  if (studentId === undefined || studentId === '') return '';
  const classroomId = ADMData.GetClassroomIdByStudent(studentId);
  const teacher = ADMData.GetTeacherByClassroomId(classroomId);
  return teacher ? teacher.name : '';
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.SelectTeacher = teacherId => {
  ASET.selectedTeacherId = teacherId;
  UR.Publish('TEACHER_SELECT', { teacherId });
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// CLASSROOMS ////////////////////////////////////////////////////////////////
///
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Creates a new classroom and then selects the classroom
 *  @param {String} name - New classroom name
 */
ADMData.DB_AddClassroom = name => {
  const classroom = ADMObj.Classroom({
    teacherId: ASET.selectedTeacherId,
    name
  });
  return UR.DBQuery('add', { classrooms: classroom }).then(rdata => {
    if (rdata.error) throw Error(rdata.error);
    UR.Publish('CRITERIA_SET_DEFAULTS', rdata.classrooms[0].id); // Add default criteria to db
    ADMData.SelectClassroom(rdata.classrooms[0].id);
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Updates existing classroom
 *  Primarily used to set the CanViewOthersModels property
 *  @param {String} data - New teacher name
 */
ADMData.DB_UpdateClassroom = (id, data) => {
  const classroom = Object.assign(ADMData.GetClassroom(id), data, { id }); // make sure id doens't get clobbered
  return UR.DBQuery('update', { classrooms: classroom });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Retrieves the classroom by classoomId or the currently selected classroom
 * @param {string} [classroomId = current selected classroomId]
 * @return {object} Clasroom Objectm, undefined if not found
 */
ADMData.GetClassroom = (classroomId = ASET.selectedClassroomId) => {
  return adm_db.classrooms.find(cls => cls.id === classroomId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Retrieve currently selected teacher's classrooms by default if no teacherId is defined
 * @param {string} [teacherId = current selected teacherId]
 * @return {Array} Array of Classroom objects, [] if not found
 */
ADMData.GetClassroomsByTeacher = (teacherId = ASET.selectedTeacherId) => {
  return adm_db.classrooms.filter(cls => cls.teacherId === teacherId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @param {string} groupId
 * @return {string} classroomId, undefined if not found
 */
ADMData.GetClassroomIdByGroup = groupId => {
  let group = ADMData.GetGroup(groupId);
  return group ? group.classroomId : undefined;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @param {string} groupId
 * @return {string} classroom name, "" if not found
 */
ADMData.GetClassroomNameByGroup = groupId => {
  const classroomId = ADMData.GetClassroomIdByGroup(groupId);
  const classroom = ADMData.GetClassroom(classroomId);
  return classroom ? classroom.name : '';
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @param {string} [studentId = current selected studentId]
 * @return {string} classroomId, undefined if not found
 */
ADMData.GetClassroomIdByStudent = (studentId = ASET.selectedStudentId) => {
  const groupId = ADMData.GetGroupIdByStudent(studentId);
  return ADMData.GetClassroomIdByGroup(groupId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @param {string} [studentId = current selected studentId]
 * @return {string} classroomId, undefined if not found
 */
ADMData.GetClassroomNameByStudent = (studentId = ASET.selectedStudentId) => {
  const classroomId = ADMData.GetClassroomIdByStudent(studentId);
  const classroom = ADMData.GetClassroom(classroomId);
  return classroom ? classroom.name : '';
};
/* replaced by DB_Classroomupdate
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @param isVisible - bool
 * /
ADMData.SetClassesModelVisibility = isVisible => {
  const classroom = ADMData.GetClassroom();
  classroom.canViewOthers = isVisible;
  console.log('setting visibility to ', isVisible);
  return isVisible;
};
*/
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Students in this classroom are a allowed to view the models of their
 *  fellow classmates.  Used for commenting.
 */
ADMData.CanViewOthers = () => {
  const classroom = ADMData.GetClassroom();
  return classroom ? classroom.canViewOthers : false;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.SelectClassroom = (classroomId = ADMData.GetClassroomIdByStudent()) => {
  ASET.selectedClassroomId = classroomId;
  UR.Publish('CLASSROOM_SELECT', { classroomId });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.GetSelectedClassroomId = () => {
  return ASET.selectedClassroomId;
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// GROUPS ////////////////////////////////////////////////////////////////////
///
/**
 *  Creates a new group object and saves it to the db
 */
ADMData.DB_AddGroup = groupName => {
  const group = ADMObj.Group({
    classroomId: ASET.selectedClassroomId,
    name: groupName
  });
  return UR.DBQuery('add', { groups: group });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Updates the db with the group info
 *  Allows partial update of group data
 */
ADMData.DB_UpdateGroup = (groupId, group) => {
  const groupData = Object.assign(ADMData.GetGroup(groupId), group, { id: groupId });
  return UR.DBQuery('update', { groups: groupData });
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Returns a group object
 */
ADMData.GetGroup = groupId => {
  return adm_db.groups.find(group => {
    return group.id === groupId;
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Returns array of group objects associated the classroom e.g.
 *    [
 *       { id: 'gr01', name: 'Blue', students: 'Bob, Bessie, Bill', classroomId: 'cl01' },
 *       { id: 'gr02', name: 'Green', students: 'Ginger, Gail, Greg', classroomId: 'cl01' },
 *       { id: 'gr03', name: 'Red', students: 'Rob, Reese, Randy', classroomId: 'cl01' },
 *    ]
 */
ADMData.GetGroupsByClassroom = classroomId => {
  return adm_db.groups.filter(grp => grp.classroomId === classroomId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Returns array of group ids associated with the classroom, e.g.
 *    [ 'gr01', 'gr02', 'gr03' ]
 *  This is primarily used by ADMData.GetModelsByClassroom to check if
 *  a model is from a particular classsroom.
 */
ADMData.GetGroupIdsByClassroom = classroomId => {
  const groups = ADMData.GetGroupsByClassroom(classroomId);
  return groups.map(grp => grp.id);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Finds the first group with for provided student id
 *  NOTE `studentId` is a token
 *  Used to look up models associated with student.
 */
ADMData.GetGroupByStudent = (studentId = ASET.selectedStudentId) => {
  if (studentId === '' || adm_db.groups === undefined) return undefined;
  const { groupId } = SESSION.DecodeToken(studentId);
  if (groupId) return adm_db.groups.find(grp => grp.id === groupId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.GetGroupIdByStudent = studentId => {
  let group = ADMData.GetGroupByStudent(studentId);
  return group ? group.id : undefined;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @param {string} groupId
 * @return {string} Group Name, '' if not found
 */
ADMData.GetGroupName = groupId => {
  let group = ADMData.GetGroup(groupId);
  return group ? group.name : '';
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.GetGroupNameByStudent = studentId => {
  let group = ADMData.GetGroupByStudent(studentId);
  return group ? group.name : '';
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.GetSelectedGroupId = () => {
  const studentId = ADMData.GetAuthorId();
  return ADMData.GetGroupIdByStudent(studentId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.GetSelectedGroupName = () => {
  const group = ADMData.GetSelectedGroupId();
  return group ? group.name : '';
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Adds new students to the existing array of students
 */
ADMData.AddStudents = (groupId, students) => {
  // convert to array if necessary
  const studentsArr = typeof students === 'string' ? [students] : students;

  // remove empty students
  const cleanedArr = studentsArr.filter(s => s !== '');

  const group = ADMData.GetGroup(groupId);
  if (group === undefined) throw Error(`${PKG}.AddStudent could not find group ${groupId}`);
  const oldStudents = group.students;

  const newStudents = oldStudents.concat(cleanedArr);

  ADMData.DB_UpdateGroup(groupId, { students: newStudents });

  /* old code
    // Update the group
  // const group = { students: [] };
  // let group = ADMData.GetGroup(groupId);
  // if (group === undefined) {
  //   console.error(PKG, 'AddStudent could not find group', groupId);
  //   return;
  // }
  // studentsArr.forEach(student => {
  //   if (student === undefined || student === '') {
  //     console.error(PKG, 'AddStudent adding blank student', groupId);
  //   }
  //   group.students.push(student);
  // });
  */
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.DeleteStudent = (groupId, student) => {
  const group = ADMData.GetGroup(groupId);
  if (group === undefined) throw Error(`${PKG}.AddStudent could not find group ${groupId}`);
  const updatedStudents = group.students.filter(stu => student !== stu);
  ADMData.DB_UpdateGroup(groupId, { students: updatedStudents });

  /** old code
  // Get the group
  const group = ADMData.GetGroup(groupId);
  if (group === undefined) {
    console.error(PKG, 'AddStudent could not find group', groupId);
    return;
  }
  const students = group.students;
  if (students === undefined) {
    console.error(PKG, 'AddStudent could not find any students in group', groupId);
    return;
  }
  // Remove the student
  const filteredStudents = students.filter(stu => student !== stu);
  group.students = filteredStudents;
  // Now update a_groups
  ADMData.DB_UpdateGroup(groupId, group);
  /*/

  /*/
  // Tell components to update
  UR.Publish('ADM_DATA_UPDATED');
  */
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// STUDENTS //////////////////////////////////////////////////////////////////
///
/**
 *  Call with no 'studentName' to get the group token
 */
ADMData.GetToken = (groupId, studentName) => {
  const classroomId = ADMData.GetClassroomIdByGroup(groupId);
  const token = SESSION.MakeToken(studentName, { groupId, classroomId });
  return `${token}\n`;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.Login = hashedToken => {
  const urs = window.URSESSION;
  if (!urs) throw Error('unexpected missing URSESSION global');
  return UR.NetCall('NET:SRV_SESSION_LOGIN', { token: hashedToken }).then(rdata => {
    if (DBG) console.log('login', rdata);
    if (rdata.error) throw Error(rdata.error);
    if (DBG) console.log('updating URSESSION with session data');
    urs.SESSION_Token = rdata.token;
    urs.SESSION_Key = rdata.key;
    // also save globally
    SESSION.DecodeAndSet(rdata.token);
    SESSION.SetAccessKey(rdata.key);

    // This assumes we already did validation
    const lprops = SESSION.LoggedInProps();
    if (lprops.studentName) ASET.selectedStudentId = rdata.token.toUpperCase(); // force upper
    if (lprops.teacherName) ASET.selectedTeacherId = rdata.token.toUpperCase(); // force upper
    // After logging in, we need to tell ADM what the default classroom is
    ADMData.SelectClassroom();
    UR.Publish('ADM_DATA_UPDATED');
    UR.Publish('MODEL_SELECT_OPEN');
    return rdata;
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.Logout = () => {
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
      ASET.selectedStudentId = '';
      ADMData.SelectClassroom('');
      UR.Publish('ADM_DATA_UPDATED');
      return rdata;
    }
    throw Error('URSESSION key or token was not set');
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.IsLoggedOut = () => {
  return !SESSION.IsStudent() && !SESSION.IsTeacher();
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.IsValidLogin = hashedToken => {
  return SESSION.IsValidToken(hashedToken);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Returns true of user has write priviledges as the author of the model
 *  The user's group grants the priviledges
 */
ADMData.IsViewOnly = () => {
  // viewonly mode if SESSION is set
  if (ADMData.IsDBReadOnly()) return true;
  // otherwise, see if we're readonly based on credentials
  const authorId = ADMData.GetAuthorId();
  const authorGroup = ADMData.GetGroupByStudent(authorId); // selectedStudentId
  const authorGroupId = authorGroup ? authorGroup.id : '';
  const model = ADMData.GetModelById(); // Current model
  const modelGroupId = model ? model.groupId : '';
  return authorGroupId !== modelGroupId;
};
ADMData.IsDBReadOnly = () => SESSION.IsDBReadOnly();
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Returns studentId or teacheId depending on who's logged in.
 */
ADMData.GetAuthorId = () => {
  if (SESSION.IsStudent()) return ASET.selectedStudentId;
  if (SESSION.IsTeacher()) return ASET.selectedTeacherId;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Returns logged in user name, normalizing the case to initial caps.
 *  @return {string} Name of student, or '' if not found
 */
ADMData.GetLoggedInUserName = () => {
  // return just the first part of the studentid without the hash
  // note SESSION.LoggedInName() is also an option
  let authorId = ADMData.GetAuthorId();
  if (authorId === undefined) return ''; // if user logged out
  let name = authorId.split('-')[0];
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Returns logged in user's group
 *  @return {string} Name of group, or '' if not found
 */
ADMData.GetLoggedInGroupName = () => {
  if (SESSION.IsTeacher()) return 'Teacher';
  const grp = ADMData.GetGroupByStudent(ASET.selectedStudentId);
  return grp ? grp.name : '';
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.GetSelectedStudentId = () => {
  return ASET.selectedStudentId;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Returns student name, normalizing the case to initial caps.
 *  @param {string} [studentId = currently selected studentId]
 *  @return {string} Name of student, or '' if not found
 */
ADMData.GetStudentName = (studentId = ASET.selectedStudentId) => {
  // return just the first part of the studentid without the hash
  // note SESSION.LoggedInName() is also an option
  let name = studentId.split('-')[0];
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.GetStudentGroupName = (studentId = ASET.selectedStudentId) => {
  const grp = ADMData.GetGroupByStudent(studentId);
  return grp ? grp.name : '';
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.IsTeacher = () => {
  return SESSION.IsTeacher();
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// MODELS ////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Creates a new empty db model
 *  @param {Object} data - ADMObj.Model object.  groupID MUST be defined
 *  @param {Function} cb - A callback function
 */
ADMData.DB_NewModel = (data, cb) => {
  return UR.DBQuery('add', {
    pmcData: ADMObj.ModelPMCData()
  }).then(rdata => {
    if (rdata.error) throw Error(rdata.error);
    const mdata = {};
    mdata.groupId = data.groupId;
    mdata.pmcDataId = rdata.pmcData[0].id;
    mdata.title = data.title;
    const model = ADMObj.Model(mdata); // set creation date
    UR.DBQuery('add', {
      models: model // db will set id
    }).then(rdata2 => {
      if (rdata2.error) throw Error(rdata2.error);
      const model = rdata2.models[0];
      if (!ADMData.GetModelById(model.id)) {
        adm_db.models.push(model);
      } else {
        // Usually SyncAddedData fires before this so the model is already added
        if (DBG) console.error(`DB_NewModel model id ${model.id} already exits. Skipping add.`);
      }
      UTILS.RLog('ModelCreate');
      cb(rdata2);
    });
  });

  /* old
  return UR.DBQuery('add', {
    'models': {
      ...data
    }
  }).then(rdata => {
    UTILS.RLog('ModelCreate');
    cb(rdata);
  });
  */
}; /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Handles modification date updates for the model
 * This is called by pmc-data via a UR 'ADM_MODEL_MODIFIED' message
 * whenver it updates objects in the model, e.g. props, comments
 *
 * FIX ME: The new date should be generated and saved on the server side, not client.
 *
 * @param {string} date
 */
ADMData.OnModelModificationUpdate = data => {
  if (DBG) console.log('%cADM_MODEL_MODIFIED', 'background-color: #66F', data);
  if (data === undefined || data.modelId === undefined)
    throw Error('ADM_MODEL_MODIFIED called with no modelId');
  ADMData.DB_ModelModificationUpdate(data.modelId);
};
ADMData.DB_ModelModificationUpdate = (modelId, date = new Date()) => {
  return UR.DBQuery('update', {
    models: {
      id: modelId,
      dateModified: date
    }
  }).then(() => {
    // No RLog for model date update
    // UTILS.RLog('ModelUpdate', `id "${modelId}" to "${title}"`);
  });
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Handles text input updates for the model title
 * @param {string} title
 */
ADMData.DB_ModelTitleUpdate = (modelId, title) => {
  return UR.DBQuery('update', {
    models: {
      id: modelId,
      title,
      dateModified: new Date()
    }
  }).then(() => {
    UTILS.RLog('ModelRename', `id "${modelId}" to "${title}"`);
  });

  /** Old CODE
  const model = ADMData.GetModelById(modelId);
  UTILS.RLog('ModelRename', `from "${model.title}" to "${title}"`);
  model.title = title;
  UR.Publish('MODEL_TITLE_UPDATED', { title });
   */
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Called by ModelSelect when user requests a new model
 *  This will add a new model to the db and then open the new model
 *  It uses the currently selected GroupID.
 *  See Whimsical diagram for call chain: https://whimsical.com/QrZ56UaiRq1nyxbJDawywy
 *  @param {Function} cb - Callback function
 */
ADMData.NewModel = cb => {
  const data = {
    groupId: ADMData.GetSelectedGroupId()
  };
  ADMData.DB_NewModel(data, rdata => {
    if (rdata && rdata.models && rdata.models.length > 0) {
      // grab the first model returned
      const model = rdata.models[0];
      ADMData.LoadModel(model.id);
    }
    cb();
  });

  //** OLD CODE */
  // adm_db.models.push(model);
  // UR.Publish('ADM_DATA_UPDATED');
  // ADMData.LoadModel(model.id, groupId);
  // UTILS.RLog('ModelCreate');
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * This is a series of asynchronous calls:
 * 1. DB_RefreshPMCData, then
 * 2. DBQuery add pmcData, then
 * 3. DBQuery add model, then
 * 4. Update adm_db
 * @param {String} sourceModelId modelId of the source model to clone from
 * @param {String} clonedGroupId owner of the cloned model
 * @param {function} cb Callback function
 */
ADMData.CloneModel = (sourceModelId, clonedGroupId, cb) => {
  // 1. Set PMC Data
  // -- Get the original
  //    adm_db's pmcData might be out of date, so we need to refresh it first.
  if (DBG) console.log(PKG, '...trying to clone sourceModelId', sourceModelId);
  ADMData.DB_RefreshPMCData(data => {
    if (DBG) console.log(PKG, '...refreshedPMCData is', data);

    const sourceModel = data.models.find(m => m.id === sourceModelId);
    if (sourceModel === undefined)
      throw new Error(`ADMData.CloneModel could not find the source model ${sourceModelId}`);

    const sourcePMCDataId = sourceModel.pmcDataId;
    const sourcePMCData = data.pmcData.find(d => d.id === sourcePMCDataId);
    if (sourcePMCData === undefined)
      throw new Error(`ADMData.CloneModel could not find the sourcePMCData ${sourcePMCDataId}`);
    if (DBG) console.log(PKG, '...sourcePMCData is', sourcePMCData);

    // -- Create the new pmcData
    const clonedPMCData = ADMObj.ModelPMCData();
    // -- Copy data over
    clonedPMCData.entities = rfdc(sourcePMCData.entities);
    clonedPMCData.visuals = rfdc(sourcePMCData.visuals);
    clonedPMCData.comments = rfdc(sourcePMCData.comments);
    clonedPMCData.markedread = rfdc(sourcePMCData.markedread);
    clonedPMCData.urcomments = rfdc(sourcePMCData.urcomments);
    clonedPMCData.urcomments_readby = rfdc(sourcePMCData.urcomments_readby);
    // -- Check for missing resources
    ADMData.AnnounceMissingResources(sourceModelId, clonedGroupId);

    if (DBG) console.log(PKG, '...cloned pmcData is', clonedPMCData);
    // 2. Create a new model with the cloned pmcData
    // -- This emulates ADMData.DB_NewModel
    UR.DBQuery('add', {
      // First update `pmcData`
      pmcData: clonedPMCData // db will set id
    }).then(rdata => {
      if (rdata.error) throw Error(rdata.error);

      // Then update `model` data
      // -- Get the original model
      const origModel = ADMData.GetModelById(sourceModelId);
      // -- Create a new model and copy over the values
      const model = ADMObj.Model({
        groupId: clonedGroupId,
        pmcDataId: rdata.pmcData[0].id,
        title: ADMData.GenerateModelTitle(origModel.title, clonedGroupId)
      }); // set creation date
      if (DBG) console.log(PKG, '...cloned pmcDataId is', rdata.pmcData[0].id);
      UR.DBQuery('add', {
        models: model // db will set id
      }).then(rdata2 => {
        if (rdata2.error) throw Error(rdata2.error);
        const rdataModel = rdata2.models[0];
        if (DBG) console.log(PKG, '...cloned model is', rdataModel);
        if (!ADMData.GetModelById(rdataModel.id)) {
          adm_db.models.push(rdataModel);
        } else if (DBG) {
          // Usually SyncAddedData fires before this so the model is already added
          console.error(`CloneModel model id ${rdataModel.id} already exits. Skipping add.`);
        }
        UTILS.RLog('ModelClone');
        if (DBG) console.log(PKG, '... => cloned to', clonedGroupId);
        if (cb) cb(rdata2);
      });
    });
  });
};
ADMData.PromiseCloneModel = (modelId, groupId) => {
  return new Promise(resolve => ADMData.CloneModel(modelId, groupId, resolve));
};
ADMData.CloneModelBulk = async (modelId, selections) => {
  if (selections.selectedGroupId !== '') {
    // A group was selected, so just do a regular clone
    ADMData.CloneModel(modelId, selections.selectedGroupId);
  } else {
    // Bulk clone!
    const groups = ADMData.GetGroupIdsByClassroom(selections.selectedClassroomId);
    if (DBG) console.log(PKG, 'cloning to', groups);
    groups.forEach(async gId => {
      if (DBG) console.log(PKG, 'cloning to', gId);
      await ADMData.PromiseCloneModel(modelId, gId);
      if (DBG) console.log(PKG, '...cloning to', gId, 'done');
    });
  }
};
/**
 * This will display a dialog listing any resources used in the sourceModel's classroom
 * that are missing from the targetGroup's classroom.
 * @param {String} sourceModelId
 * @param {String} targetGroupId
 */
ADMData.AnnounceMissingResources = (sourceModelId, targetGroupId) => {
  const sourceModel = ADMData.GetModelById(sourceModelId);
  const missingResources = ADMData.GetMissingResources(sourceModel.groupId, targetGroupId);
  if (missingResources.length > 0) {
    const targetClassroomName = ADMData.GetClassroomNameByGroup(targetGroupId);
    let missingResourceTitles = '';
    missingResources.forEach(r => {
      missingResourceTitles += `* id: "${r.id}" label: "${r.label}"\n`;
    });
    UR.Publish('DIALOG_OPEN', {
      text: `Model is cloned/moved, but note that the following resources need to be activated for classroom "${targetClassroomName}":\n\n ${missingResourceTitles}`
    });
  }
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *
 * @param {String} modelId The model to move
 * @param {Object} selections The target { selectedTeacherId, selectedClassroomId, selectedGroupId }
 */
ADMData.MoveModel = (modelId, selections) => {
  if (selections.selectedGroupId === undefined)
    console.error('ADM.MoveModel: No target group selected.');
  ADMData.AnnounceMissingResources(modelId, selections.selectedGroupId);
  // -- Update the DB
  ADMData.DB_RefreshPMCData(data => {
    UR.DBQuery('update', {
      models: {
        id: modelId,
        groupId: selections.selectedGroupId,
        deleted: false
      }
    });
  });
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.DeleteModel = modelId => {
  ADMData.DB_RefreshPMCData(data => {
    UR.DBQuery('update', {
      models: {
        id: modelId,
        deleted: true
      }
    });
  });
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * return the model meta data
 *  @param {Integer} modelId
 */
ADMData.GetModelById = (modelId = ASET.selectedModelId) => {
  return adm_db.models.find(model => model.id === modelId);
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.GetModelsByClassroom = classroomId => {
  const groupIdsInClassroom = ADMData.GetGroupIdsByClassroom(classroomId);
  return adm_db.models.filter(mdl => groupIdsInClassroom.includes(mdl.groupId));
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @param {string} [studentId = current selected studentId]
 * @return {Array} Array of models, [] if not found
 */
ADMData.GetModelsByStudent = (studentId = ASET.selectedStudentId) => {
  const group = ADMData.GetGroupByStudent(studentId);
  if (group === undefined) return [];
  return adm_db.models.filter(mdl => mdl.groupId === group.id);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Gets the models for a teacher
ADMData.GetModelsByTeacher = (token = ASET.selectedTeacherId) => {
  // handle special
  const { groupId, classroomId } = SESSION.DecodeToken(token);
  if (groupId !== 0) {
    console.error(`${token} is not a teacher token`);
    return [];
  }
  // the teacherId embedded in the token via the classroomId
  const teacherId = classroomId;
  return adm_db.models.filter(mdl => {
    const cid = ADMData.GetClassroomIdByGroup(mdl.groupId);
    if (!cid) {
      console.log('classroom error', cid, 'from', mdl);
      return false;
    }
    const teacher = ADMData.GetTeacherByClassroomId(cid);
    if (!teacher) {
      console.log('teacher error', teacher);
      return false;
    }
    return teacherId === teacher.id;
  });
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Gets the groupId of the currently selected Student ID
ADMData.GetModelsByGroup = (group = ADMData.GetGroupByStudent()) => {
  return adm_db.models.filter(mdl => mdl.groupId === group.id);
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Used by ADMData.CloneModel to determine if there are duplicate model names
 * @param {String} groupId
 */
ADMData.GetModelTitlesByGroup = groupId => {
  const groupModels = adm_db.models.filter(m => m.groupId === groupId);
  return groupModels.map(m => m.title);
};

/**
 * Returns `title` if there isn't already a model by with the same name
 * else, returns `title COPY`
 * @param {String} title
 * @param {String} groupId
 */
ADMData.GenerateModelTitle = (title, groupId) => {
  const existingTitles = ADMData.GetModelTitlesByGroup(groupId);
  // make sure 'COPY' doesn't already exist as well.  recurse if necessary.
  let newtitle = existingTitles.includes(title) ? `${title} COPY` : title;
  if (existingTitles.includes(newtitle)) newtitle = ADMData.GenerateModelTitle(newtitle, groupId);
  return newtitle;
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Returns models from the class EXCLUDING those from the group.
 * This is used by ModelSelect.jsx to allow students to select models from
 * their classmates to view.
 * @param {string} classroomId
 * @param {string} studentId
 * @return {Array} Array of model objects, [] if not found
 */
ADMData.GetMyClassmatesModels = (classroomId, studentId) => {
  const classroomModels = ADMData.GetModelsByClassroom(classroomId);
  const groupId = ADMData.GetGroupIdByStudent(studentId);
  return classroomModels.filter(mdl => {
    return mdl.groupId !== groupId;
  });
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @param {string} [modelId = current selected modelId]
 * @return {string} Model name, or '' if not found
 */
ADMData.GetModelTitle = (modelId = ASET.selectedModelId) => {
  const model = ADMData.GetModelById(modelId);
  return model ? model.title : '';
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Retrieves the latest pmcData object from the database.
 *  This is necessary because adm_db's pmcData array is not
 *  updated with SyncAdd and SyncUpdate.
 *  @param {Function} cb - A callback function
 */
ADMData.DB_RefreshPMCData = cb => {
  UR.NetCall('NET:SRV_DBGET', {}).then(data => {
    if (data.error) {
      reject(`server says '${data.error}'`);
      return;
    }
    adm_db.pmcData = data.pmcData;
    cb(data);
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.LoadModel = modelId => {
  let model = ADMData.GetModelById(modelId);
  if (model === undefined)
    throw Error(`${PKG}.LoadModel could not find a valid modelId ${modelId}`);
  PMCData.ClearModel();
  UR.Publish('SVG_PANZOOM_RESET');
  ADMData.SetSelectedModelId(modelId, model.pmcDataId); // Remember the selected modelId locally
  ADMData.DB_RefreshPMCData(data => PMCData.InitializeModel(model, data));
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// This does not load the model, it just sets the currently selected model id
ADMData.SetSelectedModelId = (modelId, pmcDataId) => {
  // verify it's valid
  if (adm_db.models.find(mdl => mdl.id === modelId) === undefined) {
    console.error(PKG, 'SetSelectedModelId could not find valid modelId', modelId);
  }
  ASET.selectedModelId = modelId;
  ASET.selectedPMCDataId = pmcDataId;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.GetSelectedModelId = () => {
  return ASET.selectedModelId;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.CloseModel = () => {
  ASET.selectedModelId = '';
  UR.Publish('ADM_DATA_UPDATED');
  UR.Publish('MODEL_SELECT_OPEN');
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// CRITERIA //////////////////////////////////////////////////////////////////
///
/**
 *  Creates a new empty criteria object with a unqiue ID.
 *  If data.classroomId is not defined, we use the current selected classroomId
 *
 *  @param {Object} data - a ADMObj.Criterion-like data object
 *  @param {Function} cb - callback function will be called
 */
ADMData.DB_NewCriteria = (data, cb) => {
  const crit = ADMObj.Criterion({
    classroomId: data.classroomId || ASET.selectedClassroomId,
    label: data.label,
    description: data.description
  });
  return UR.DBQuery('add', { criteria: crit }).then(rdata => {
    if (rdata.error) throw Error(rdata.error);
    if (typeof cb === 'function') {
      cb();
    }
  });

  /* OLD CODE
  const id = GenerateUID('cr');
  if (classroomId === undefined) {
    console.error(PKG, 'NewCriteria called with bad classroomId:', classroomId);
    return undefined;
  }
  const crit = {
    id,
    label: '',
    description: '',
    classroomId
  };
  // Don't add it to a_criteria -- user might cancel the edit
  // a_criteria.push(crit);
  return crit; */
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.GetCriteriaByClassroom = (classroomId = ASET.selectedClassroomId) => {
  return adm_db.criteria.filter(crit => crit.classroomId === classroomId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.GetCriteriaByGroup = groupId => {
  const classroomId = ADMData.GetClassroomIdByGroup(groupId);
  return ADMData.GetCriteriaByClassroom(classroomId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.GetCriteriaByModel = (modelId = ASET.selectedModelId) => {
  const model = ADMData.GetModelById(modelId);
  if (model === undefined) return []; // No model loaded
  return ADMData.GetCriteriaByGroup(model.groupId);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.GetCriteriaLabel = (criteriaId, classroomId = ADMData.GetSelectedClassroomId()) => {
  let criteriaArr = ADMData.GetCriteriaByClassroom(classroomId);
  let criteria = criteriaArr.find(crit => crit.id === criteriaId);
  return criteria ? criteria.label : '';
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.DB_UpdateCriterion = criterion => {
  return UR.DBQuery('update', {
    criteria: criterion
  });

  /*
  const i = adm_db.criteria.findIndex(cr => cr.id === criteria.id);
  if (i < 0) {
    // Criteria not found, so it must be a new criteria.  Add it.
    adm_db.criteria.push(criteria);
    return;
  }
  adm_db.criteria.splice(i, 1, criteria);
  */
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.DB_UpdateCriteriaList = criteriaList => {
  criteriaList.forEach(crit => {
    ADMData.DB_UpdateCriterion(crit);
  });

  /* OLD
  // Remove any deleted criteria
  const updatedCriteriaIds = criteriaList.map(criteria => criteria.id);
  adm_db.criteria = adm_db.criteria.filter(
    crit => crit.classroomId !== ASET.selectedClassroomId || updatedCriteriaIds.includes(crit.id)
  );
  // Update existing criteria
  criteriaList.forEach(criteria => ADMData.UpdateCriteria(criteria));
  */
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.DB_CriteriaDelete = critId => {
  return UR.DBQuery('remove', { criteria: { id: critId } });
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// SENTENCE STARTERS
///
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Creates a new empty sentenceStarter with a unqiue ID.
 *  If data.classroomId is not defined, we use the current selected classroomId
 *
 *  @param {Object} data - a ADMObj.SentenceStarter-like data object
 */
ADMData.DB_SentenceStarterNew = data => {
  const ss = ADMObj.SentenceStarter({
    classroomId: data.classroomId || ASET.selectedClassroomId,
    sentences: data.sentences
  });
  return UR.DBQuery('add', { sentenceStarters: ss });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *
 *  @param {Object} sentenceStarter - a ADMObj.SentenceStarter-like data object
 */
ADMData.DB_SentenceStarterUpdate = sentenceStarter => {
  return UR.DBQuery('update', {
    sentenceStarters: sentenceStarter
  });

  /* old code
  const i = adm_db.sentenceStarters.findIndex(ss => ss.id === sentenceStarter.id);
  if (i < 0) {
    // Sentence starter not found, so it must be new.  Add it.
    adm_db.sentenceStarters.push(sentenceStarter);
    return;
  }
  adm_db.sentenceStarters.splice(i, 1, sentenceStarter);
  */
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Returns a single sentenceStarter object, if not found, undefined
// (We used to support multiple sentence starters per classroom)
ADMData.GetSentenceStartersByClassroom = (classroomId = ADMData.GetSelectedClassroomId()) => {
  const sentenceStarter = adm_db.sentenceStarters.filter(ss => ss.classroomId === classroomId);
  let result;
  if (Array.isArray(sentenceStarter)) {
    result = sentenceStarter[0];
  } else {
    console.error(
      PKG,
      'GetSentenceSTarterByClassroom: Sentence starter for classroomId',
      classroomId,
      'not found!'
    );
  }
  return result;
};
// Returns a single sentenceStarter object for the current classroom, if not found ''
ADMData.GetSentenceStarter = () => {
  const sentenceStarter = ADMData.GetSentenceStartersByClassroom();
  if (sentenceStarter === undefined || sentenceStarter.sentences === undefined) {
    return '';
  }
  return sentenceStarter.sentences;
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// RATINGS DEFINITIONS
///
/// For now Ratings Definitions are shared across all classrooms.
/// We may need to allow teachers to customize this in th e future.

/**
 *  @param {Integer} classroomId - The classroom this rating belongs to
 *  @param {Object} ratingsDefObj - A AMDObj.RatingsDefinition
 */
ADMData.DB_RatingsAdd = (classroomId, ratingsDefObj) => {
  return UR.DBQuery('add', { ratingsDefinitions: ratingsDefObj });
};

/**
 *  @param {Integer} classroomId - The classroom this rating belongs to
 *  @param {Object} ratingsDefObj - A AMDObj.RatingsDefinition-like object, can be partial
 */
ADMData.DB_RatingsUpdate = (classroomId, ratingsDef) => {
  const ratingsDefinition = Object.assign(
    {},
    adm_db.ratingsDefinitions.find(r => r.classroomId === classroomId),
    { definitions: ratingsDef }
  );
  // replace existing ratings
  return UR.DBQuery('update', { ratingsDefinitions: ratingsDefinition });

  /** old code
  const ratings = adm_db.ratingsDefinitions.find(ratings => ratings.classroomId === classroomId);
  if (ratings) {
    ratings.definitions = ratingsDef;
  } else {
    console.error(
      PKG,
      '.DB_RatingsUpdate could not find ratings definition for classroomId',
      classroomId
    );
  } */
};

/**
 * @param {Integer} classroomId
 * @return {Array} [ratingsDefition] -- Array of ratings definition objects,
 *                                      Returns [] if not found
 */
ADMData.GetRatingsDefinitionObject = classroomId => {
  return adm_db.ratingsDefinitions.find(ratings => ratings.classroomId === classroomId);
};

/**
 * @param {Integer} classroomId
 * @return {Array} [ratingsDefition] -- Array of ratings defintion objects,
 * e.g.{ label: 'Really disagrees!', rating: -3 },
 * Returns [] if not found
 */
ADMData.GetRatingsDefinition = classroomId => {
  const ratingsObject = ADMData.GetRatingsDefinitionObject(classroomId);
  return ratingsObject ? ratingsObject.definitions : [];
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// RESOURCES
///
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  @param {Object} data - ADMObj.ClassroomResource-like object
 */
ADMData.DB_ResourceAdd = data => {
  const res = ADMObj.Resource(data);
  return UR.DBQuery('add', { resources: res }).then(rdata => {
    // Set the referenceLabel to match the id
    const referenceLabel = rdata.resources[0].id;
    // And save it
    ADMData.DB_ResourceUpdate({
      id: rdata.resources[0].id,
      referenceLabel
    });
    return rdata;
  });
};
/**
 *
 *  @param {Object} respource - ADMObj.Resource object
 */
ADMData.DB_ResourceUpdate = resource => {
  return UR.DBQuery('update', {
    resources: resource
  });
};
/**
 *  @param {Integer} resourceId
 */
ADMData.DB_ResourceDelete = resourceId => {
  // First remove the resource from all classrooms
  adm_db.classrooms.forEach(c => {
    ADMData.DB_ClassroomResourceSet(resourceId, false, c.id);
  });
  // Then remove the resource completely
  return UR.DBQuery('remove', { resources: { id: resourceId } });
};

// Returns all of the resource objects.
ADMData.AllResources = () => {
  return adm_db.resources;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Returns the resource object matching the rsrccId.
ADMData.Resource = rsrcId => {
  return adm_db.resources.find(item => {
    return item.id === rsrcId;
  });
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Returns an array of the subset of all resources that have been made available to the classroom
 * returns `resources` not `classroomResources`
 * @param {string} classroomId
 * @return {Array} Array of classroom resource ids, e.g. `['rs1', 'rs2']`, [] if not found
 */
ADMData.GetResourcesForClassroom = classroomId => {
  const classroomResource = adm_db.classroomResources.find(
    rsrc => rsrc.classroomId === classroomId
  );
  const classroomResourceIds = classroomResource ? classroomResource.resources : [];
  const classroomResources = classroomResourceIds.map(rsrcId => {
    return ADMData.Resource(rsrcId);
  });
  return classroomResources || [];
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Returns an array of resource titles present in origGroupId's classroom that are
 * missing from the newGroupId's classroom.
 * This is generally used by ADMData.CloneModel to note when a model is
 * being moved to a classroom that does not have the same set of resources
 * activated.
 * @param {String} origGroupId if of the clone source model's group
 * @param {String} newGroupId group id of the cloned model destination
 * @return {Array} Array of classroom resource objects
 */
ADMData.GetMissingResources = (origGroupId, newGroupId) => {
  const origClassroomId = ADMData.GetClassroomIdByGroup(origGroupId);
  const newClassroomId = ADMData.GetClassroomIdByGroup(newGroupId);
  const originalResources = ADMData.GetResourcesForClassroom(origClassroomId);
  const clonedResources = ADMData.GetResourcesForClassroom(newClassroomId);
  const clonedResourceIds = clonedResources.map(r => r.id);
  let missingResources = originalResources.filter(r => !clonedResourceIds.includes(r.id));
  return missingResources;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  @param {Object} data - ADMObj.ClassroomResource-like object
 */
ADMData.DB_ClassroomResourceAdd = data => {
  const res = ADMObj.ClassroomResource({
    classroomId: data.classroomId || ASET.selectedClassroomId,
    resources: data.resources
  });
  return UR.DBQuery('add', { classroomResources: res });
};
/**
 *
 *  @param {Object} classroomResource - ADMObj.ClassroomResource object
 */
ADMData.DB_ClassroomResourceUpdate = classroomResource => {
  return UR.DBQuery('update', {
    classroomResources: classroomResource
  });
};
/**
 *  @param {Integer} rsrcId - id of the parent resources
 *  @param {Boolean} checked - Whether the resource is selected or unselected
 *  @param {INteger} classroomId - The classroom this resource is being enabled/disabled for
 */
ADMData.DB_ClassroomResourceSet = (rsrcId, checked, classroomId) => {
  let classroomResource = adm_db.classroomResources.find(rsrc => rsrc.classroomId === classroomId);
  if (classroomResource === undefined) {
    // New Classrooms don't have a classroomResource defined by default.
    classroomResource = ADMObj.ClassroomResource({ classroomId });
  }

  // Update the resource list
  if (checked) {
    // Add resource
    classroomResource.resources.push(rsrcId);
  } else {
    // Remove resource
    classroomResource.resources = classroomResource.resources.filter(rsrc => rsrc !== rsrcId);
  }

  // Update the DB
  if (classroomResource.id !== undefined) {
    ADMData.DB_ClassroomResourceUpdate(classroomResource);
  } else {
    // new classroomResource
    ADMData.DB_ClassroomResourceAdd(classroomResource);
  }

  /* old code
  UR.Publish('ADM_DATA_UPDATED');
  */
};

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
if (!window.ur) window.ur = {};
window.ur.getadmdb = () => adm_db;
window.ur.getpmcdata = () => adm_db.pmcData;
window.ur.getmodel = id => {
  if (typeof id === 'number') return adm_db.pmcData.find(el => el.id === id);
  return adm_db.pmcData(ASET.selectedModelId);
};
window.ur.ADM = ADMData;
export default ADMData;
