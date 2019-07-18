import DEFAULTS from './defaults';
import UR from '../../system/ursys';

/// MODULE DECLARATION ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @module ADMData
 * @desc
 * A centralized data manager for classroom administration.
 */
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const ADMData = {};

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'adm-data';

/// MODEL /////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let adm_db = {}; // server database object by reference
let adm_settings = {}; // local settings, state of the admin view (current displayed class/teacher)

UR.DB_Subscribe = () => { }; // FIXME: Cover for now. Remove when implemented.
UR.DB_Subscribe('ADMIN:UPDATED', ADMData.AdmDataUpdated); // active
ADMData.AdmDataUpdated = data => {
  adm_db = data.adm_db;
};

/// MODULE DECLARATION ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/
lifecycle position: "configuration" LOAD_ASSETS (URSYS Lifecycle)

Server Use Model is a shared laptop between a couple of teachers. data is local
to who the user. The need for editing teachers, class periods is as yet
undwefined.

The admin interface is accessed from LOCALHOST ONLY, so no need for network
sync. However, it should implement a UR.Message-style REACTIVE RENDER:

1. React subscribes to data changes, and only then rerenders (no forced renders)
2. React changes its internal data-dependent display elements by publishing data
   and letting 1. actually trigger the rerender

TODO:
o Resources LIst into ADMDATA here.
o How to represent 
o A "stickynote" is a container for comments, "linked" to a PMC element

/*/
ADMData.Load = () => {
  // NO UI YET (see use model above)
  adm_db.a_teachers = [
    { id: 'brown', name: 'Ms Brown' },
    { id: 'smith', name: 'Mr Smith' },
    { id: 'gordon', name: 'Ms Gordon' }
  ];
  // NO UI YET (see use model above)
  adm_db.a_classrooms = [
    { id: 'cl01', name: 'Period 1', teacherId: 'brown' },
    { id: 'cl02', name: 'Period 3', teacherId: 'brown' },
    { id: 'cl03', name: 'Period 2', teacherId: 'smith' },
    { id: 'cl04', name: 'Period 3', teacherId: 'smith' }
  ];
  // SAVED IN ELECTRON/LOKI, EDITABLE BY TEACHERS
  adm_db.a_groups = [
    { id: 'gr01', name: 'Blue', students: ['Bob', 'Bessie', 'Bill'], classroomId: 'cl01' },
    { id: 'gr02', name: 'Green', students: ['Ginger', 'Gail', 'Greg'], classroomId: 'cl01' },
    { id: 'gr03', name: 'Red', students: ['Rob', 'Reese', 'Randy'], classroomId: 'cl01' },
    { id: 'gr04', name: 'Purple', students: ['Peter', 'Paul', 'Penelope'], classroomId: 'cl02' },
  ];
  // LIST SAVED IN ELECTRON/LOKI, EDITABLE BY TEACHERS AND STUDENTS
  // ids here are relevant to PMCData / SVGView operation
  adm_db.a_models = [
    { id: 'mo01', title: 'Fish Sim', groupId: 'gr01', dateCreated: '', dateModified: '', data: '' },
    { id: 'mo02', title: 'Tank Sim', groupId: 'gr01', dateCreated: '', dateModified: '', data: '' },
    { id: 'mo03', title: 'Ammonia', groupId: 'gr01', dateCreated: '', dateModified: '', data: '' },
    { id: 'mo04', title: 'Fish Sim', groupId: 'gr02', dateCreated: '', dateModified: '', data: '' },
    { id: 'mo05', title: 'Tank Sim', groupId: 'gr02', dateCreated: '', dateModified: '', data: '' },
    { id: 'mo06', title: 'Fish Sim', groupId: 'gr04', dateCreated: '', dateModified: '', data: '' },
    { id: 'mo07', title: 'No Sim', groupId: 'gr04', dateCreated: '', dateModified: '', data: '' }
  ];
  // SAVED IN ELECTRON/LOKI, EDITABLE BY TEACHERS
  // ViewMain will eventually show a link that shows criteria
  adm_db.a_criteria = [
    {
      id: 'cr01',
      label: 'Clarity',
      description: 'How clear is the explanation?',
      classroomId: 'cl01'
    },
    {
      id: 'cr02',
      label: 'Visuals',
      description: 'Does the layout make sense?',
      classroomId: 'cl01'
    },
    {
      id: 'cr03',
      label: 'Clarity',
      description: 'How clear is the evidence link?',
      classroomId: 'cl02'
    },
    {
      id: 'cr04',
      label: 'Layout',
      description: 'Does the layout make sense?',
      classroomId: 'cl02'
    }
  ];
  // SAVED IN ELECTRON/LOKI, EDITABLE BY TEACHERS
  adm_db.a_classroomResources = [
    { classroomId: 'cl01', resources: ['rs1', 'rs2'] }, // PMCData Rsources
    { classroomId: 'cl02', resources: ['rs2', 'rs3'] },
    { classroomId: 'cl03', resources: ['rs4', 'rs5'] },
    { classroomId: 'cl04', resources: ['rs6', 'rs7'] }
  ];

  adm_settings = {};
};

/// PRIVATE METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// FIXME: This really oought to check to makes ure the id is unique
const GenerateUID = (prefix = '', suffix = '') => {
  return prefix + Math.trunc(Math.random() * 10000000000).toString() + suffix;
}

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API.MODEL:
 *  Return array of all the properties of the PMC model. Note that a PMC
 *  component is just a property that isn't a child of any other property.
 *  @returns {array} - array of nodeId strings
 */

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// TEACHERS
ADMData.GetAllTeachers = () => {
  return adm_db.a_teachers;
};
ADMData.GetTeacherName = teacherId => {
  let teacher = adm_db.a_teachers.find(tch => {
    return tch.id === teacherId;
  });
  return teacher ? teacher.name : '';
};
ADMData.SelectTeacher = teacherId => {
  adm_settings.selectedTeacherId = teacherId;
  UR.Publish('TEACHER_SELECT', { teacherId });
};
ADMData.AddTeacher = name => {
  const teacher = {};
  teacher.id = GenerateUID('tc');
  teacher.name = name;
  adm_db.a_teachers.push(teacher);
  // Select the new teacher
  adm_settings.selectedTeacherId = teacher.id;
  UR.Publish('TEACHER_SELECT', { teacherId: teacher.id });
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// CLASSROOMS
// Retreive currently selected teacher's classrooms by default if no teacherId is defined
ADMData.GetClassroomsByTeacher = (teacherId = adm_settings.selectedTeacherId) => {
  return adm_db.a_classrooms.filter(cls => cls.teacherId === teacherId);
};
ADMData.SelectClassroom = classroomId => {
  adm_settings.selectedClassroomId = classroomId;
  UR.Publish('CLASSROOM_SELECT', { classroomId });
};
ADMData.AddClassroom = name => {
  const classroom = {};
  classroom.id = GenerateUID('tc');
  classroom.name = name;
  classroom.teacherId = adm_settings.selectedTeacherId;
  adm_db.a_classrooms.push(classroom);
  // Select the new classroom
  adm_settings.selectedClassroomId = classroom.id;
  // Special case of CLASSROOM_SELECT: We need to update the list of classrooms
  // when a new classroom is added, so we pass the flag and let the component
  // do the updating.
  UR.Publish('CLASSROOM_SELECT', {
    classroomId: classroom.id,
    classroomListNeedsUpdating: true
  });
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// GROUPS
/**
 *  Add a new group
 */
ADMData.AddGroup = groupName => {
  let group = {};
  group.id = GenerateUID('gr');
  group.name = groupName;
  group.students = [];
  group.classroomId = adm_settings.selectedClassroomId;

  adm_db.a_groups.push(group);

  UR.Publish('ADM_DATA_UPDATED');
};

/**
 *  Returns a group object
 */
ADMData.GetGroup = groupId => {
  return adm_db.a_groups.find(group => {
    return group.id === groupId;
  });
};
/**
 *  Returns array of group objects associated the classroom e.g.
 *    [
 *       { id: 'gr01', name: 'Blue', students: 'Bob, Bessie, Bill', classroomId: 'cl01' },
 *       { id: 'gr02', name: 'Green', students: 'Ginger, Gail, Greg', classroomId: 'cl01' },
 *       { id: 'gr03', name: 'Red', students: 'Rob, Reese, Randy', classroomId: 'cl01' },
 *    ]
 */
ADMData.GetGroupsByClassroom = classroomId => {
  return adm_db.a_groups.filter(grp => grp.classroomId === classroomId);
};
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
/**
 *  Updates a_groups with latest group info
 */
ADMData.UpdateGroup = (groupId, group) => {
  let i = adm_db.a_groups.findIndex(grp => grp.id === groupId);
  if (i < 0) {
    console.error(PKG, '.UpdateGroup could not find group with id', groupId);
    return;
  }
  adm_db.a_groups.splice(i, 1, group);
};
ADMData.AddStudents = (groupId, students) => {
  let studentsArr;
  if (typeof students === 'string') {
    studentsArr = [students];
  } else {
    studentsArr = students;
  }
  // Update the group
  let group = ADMData.GetGroup(groupId);
  if (group === undefined) {
    console.error('ADMData.AddStudent could not find group', groupId);
    return;
  }
  studentsArr.map(student => {
    if (student === undefined || student === '') {
      console.error('ADMData.AddStudent adding blank student', groupId);
      return;
    }
    group.students.push(student);
  });
  // Now update a_groups
  ADMData.UpdateGroup(groupId, group);
  // Tell components to update
  UR.Publish('ADM_DATA_UPDATED');
};
ADMData.DeleteStudent = (groupId, student) => {
  // Get the group
  const group = ADMData.GetGroup(groupId);
  if (group === undefined) {
    console.error('ADMData.AddStudent could not find group', groupId);
    return;
  }
  const students = group.students;
  if (students === undefined) {
    console.error('ADMData.AddStudent could not find any students in group', groupId);
    return;
  }
  // Remove the student
  const filteredStudents = students.filter(stu => student !== stu);
  group.students = filteredStudents;
  // Now update a_groups
  ADMData.UpdateGroup(groupId, group);
  /*/

  /*/
  // Tell components to update
  UR.Publish('ADM_DATA_UPDATED');
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// MODELS
ADMData.GetModelsByClassroom = classroomId => {
  const groupIdsInClassroom = ADMData.GetGroupIdsByClassroom(classroomId);
  return adm_db.a_models.filter(mdl => groupIdsInClassroom.includes(mdl.groupId));
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// CRITERIA
/**
 *  NewCriteria
 *  1. Creates a new empty criteria object with a unqiue ID.
 *  2. Returns the criteria object.
 * 
 *  Calling `NewCriteria()` will automatically use the currently
 *  selectedClassssroomId as the classroomId.
 * 
 *  Call `NewCriteria('xxId')` to set the classroomId manually.
 */
ADMData.NewCriteria = (classroomId = adm_settings.selectedClassroomId) => {
  const id = GenerateUID('cr');
  if (classroomId === undefined) {
    console.error(PKG, '.NewCriteria called with bad classroomId:', classroomId);
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
  return crit;
};
ADMData.GetCriteriaByClassroom = classroomId => {
  return adm_db.a_criteria.filter(crit => crit.classroomId === classroomId);
};
ADMData.UpdateCriteria = criteria => {
  const i = adm_db.a_criteria.findIndex(cr => cr.id === criteria.id);
  if (i < 0) {
    // Criteria not found, so it must be a new criteria.  Add it.
    adm_db.a_criteria.push(criteria);
    return;
  }
  adm_db.a_criteria.splice(i, 1, criteria);
};
ADMData.UpdateCriteriaList = criteriaList => {
  // Remove any deleted criteria
  const updatedCriteriaIds = criteriaList.map(criteria => criteria.id);
  adm_db.a_criteria = adm_db.a_criteria.filter(
    crit =>
      crit.classroomId !== adm_settings.selectedClassroomId || updatedCriteriaIds.includes(crit.id)
  );
  // Update existing criteria
  criteriaList.forEach(criteria => ADMData.UpdateCriteria(criteria));
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// RESOURCES
ADMData.GetResourcesByClassroom = classroomId => {
  let classroomResources = adm_db.a_classroomResources.find(
    rsrc => rsrc.classroomId === classroomId
  );
  return classroomResources ? classroomResources.resources : [];
};

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default ADMData;
