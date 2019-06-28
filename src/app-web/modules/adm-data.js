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

/// MODEL /////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let a_teachers = []; // all properties (strings)
let a_classrooms = []; // all mechanisms (pathId strings)
let a_groups = [];
let a_models = [];
let a_criteria = [];
let a_classroomResources = []; // List of resources enabled for each classroom

/// MODULE DECLARATION ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.Load = () => {
  a_teachers = [
    { id: 'brown', name: 'Ms Brown' },
    { id: 'smith', name: 'Mr Smith' },
    { id: 'gordon', name: 'Ms Gordon' }
  ];
  a_classrooms = [
    { id: 'cl01', name: 'Period 1', teacherId: 'brown' },
    { id: 'cl02', name: 'Period 3', teacherId: 'brown' },
    { id: 'cl03', name: 'Period 2', teacherId: 'smith' },
    { id: 'cl04', name: 'Period 3', teacherId: 'smith' }
  ];
  a_groups = [
    { id: 'gr01', name: 'Blue', students: 'Bob, Bessie, Bill', classroomId: 'cl01' },
    { id: 'gr02', name: 'Green', students: 'Ginger, Gail, Greg', classroomId: 'cl01' },
    { id: 'gr03', name: 'Red', students: 'Rob, Reese, Randy', classroomId: 'cl01' },
    { id: 'gr04', name: 'Purple', students: 'Peter, Paul, Penelope', classroomId: 'cl02' },
  ];
  a_models = [
    { id: 'mo01', title: 'Fish Sim', groupId: 'gr01', dateCreated: '', dateModified: '', data: '' },
    { id: 'mo02', title: 'Tank Sim', groupId: 'gr01', dateCreated: '', dateModified: '', data: '' },
    { id: 'mo03', title: 'Ammonia', groupId: 'gr01', dateCreated: '', dateModified: '', data: '' },
    { id: 'mo04', title: 'Fish Sim', groupId: 'gr02', dateCreated: '', dateModified: '', data: '' },
    { id: 'mo05', title: 'Tank Sim', groupId: 'gr02', dateCreated: '', dateModified: '', data: '' },
    { id: 'mo06', title: 'Fish Sim', groupId: 'gr04', dateCreated: '', dateModified: '', data: '' },
    { id: 'mo07', title: 'No Sim', groupId: 'gr04', dateCreated: '', dateModified: '', data: '' }
  ]
};

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
  return a_teachers;
};
ADMData.GetTeacherName = teacherId => {
  let teacher = a_teachers.find(tch => {
    return tch.id === teacherId;
  });
  return teacher ? teacher.name : '';
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// CLASSROOMS
ADMData.GetClassroomsByTeacher = teacherId => {
  return a_classrooms.filter(cls => cls.teacherId === teacherId);
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// GROUPS
/**
 *  Returns array of group objects associated the classroom e.g.
 *    [
 *       { id: 'gr01', name: 'Blue', students: 'Bob, Bessie, Bill', classroomId: 'cl01' },
 *       { id: 'gr02', name: 'Green', students: 'Ginger, Gail, Greg', classroomId: 'cl01' },
 *       { id: 'gr03', name: 'Red', students: 'Rob, Reese, Randy', classroomId: 'cl01' },
 *    ]
 */
ADMData.GetGroupsByClassroom = classroomId => {
  return a_groups.filter(grp => grp.classroomId === classroomId);
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

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// MODELS
ADMData.GetModelsByClassroom = classroomId => {
  const groupIdsInClassroom = ADMData.GetGroupIdsByClassroom(classroomId);
  return a_models.filter(mdl => groupIdsInClassroom.includes(mdl.groupId));
};

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default ADMData;
