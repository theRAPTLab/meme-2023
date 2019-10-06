/*/

  A Selection Manager for ADM DATA
  This allows us to access settings from outside of ADM DATA,
  optionally making it a global self-managing class instance.

/*/

import DEFAULTS from './defaults';
import UR from '../../system/ursys';
import SESSION from '../../system/common-session';

/// SETTINGS //////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class ADMSettings {
  constructor() {
    this.clear();
  }
  // utility
  clear() {
    this.sTeacherId = '';
    this.sClassroomId = '';
    this.sStudentId = '';
    this.sModelId = '';
  }
  // getters
  get selectedTeacherId() {
    return this.sTeacherId;
  }
  get selectedClassroomId() {
    return this.sClassroomId;
  }
  get selectedStudentId() {
    return this.sStudentId;
  }
  get selectedModelId() {
    return this.sModelId;
  }
  // setters
  set selectedTeacherId(id) {
    this.sTeacherId = id;
  }
  set selectedClassroomId(id) {
    this.sClassroomId = id;
  }
  set selectedStudentId(id) {
    this.sStudentId = id;
  }
  set selectedModelId(id) {
    this.sModelId = id;
  }
} // class

/// CREATE INSTANCE ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const ASET = new ADMSettings();

/// EXPORT ////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default ASET;
