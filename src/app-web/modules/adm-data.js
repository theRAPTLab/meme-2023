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
let a_criteria = [];
let a_groups = [];
let a_models = [];
let a_classroomResources = []; // List of resources enabled for each classroom

/// MODULE DECLARATION ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMData.Load = () => {
  a_teachers = [
    { id: 'brown', name: 'Ms Brown' },
    { id: 'smith', name: 'Mr Smith' },
    { id: 'gordon', name: 'Ms Gordon' }
  ];

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

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default ADMData;