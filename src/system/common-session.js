/* eslint-disable no-param-reassign */
/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

    Session Utilities
    collection of session-related data structures

    For student logins, we just need to encode the groupId, which will give
    us the classroomId. We also need the name, which is not encoded, but
    can be checked against the groups database.

    <NAME>-HASHED_DATA
    where HASHED_DATA encodes groupId, classroomId

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

const HashIds = require('hashids').default;
const PROMPTS = require('../system/util/prompts');

/// DEBUGGING /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PR = PROMPTS.Pad('SESSUTIL');

/// SYSTEM LIBRARIES //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// MODULE DEFS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let SESUTIL = {};
const HASH_ABET = 'ABCDEFGHIJKLMNPQRSTVWXYZ23456789';
const HASH_MINLEN = 3;
const HASH_SALT = 'MEMESALT/2019';
let m_current_name = undefined;
let m_current_idsobj = {};

/// SESSION ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ Given a token of form NAME-HASHED_DATA, return an object
    containing as many decoded values as possible. Check isValid for
    complete decode succes. groupId is also set if successful
/*/
SESUTIL.DecodeToken = token => {
  if (token === undefined) return {};
  let tokenBits = token.split('-');
  let studentName, hashedData; // token
  let groupId, classroomId; // decoded data
  let isValid;
  // optimistically set valid flag to be negated on failure
  isValid = true;
  // check for missing dash
  if (token.substr(-1) === '-') {
    isValid = false;
    return { isValid, token, error: 'missing - in token' };
  }
  // token is of form NAME-HASHEDID
  // (1) check student name
  if (tokenBits[0]) studentName = tokenBits[0].toUpperCase();
  if (studentName.length < 3) {
    isValid = false;
    return { isValid, token, error: 'student name must have 3 or more letters' };
  }

  // (2) check hashed data
  if (tokenBits[1]) hashedData = tokenBits[1].toUpperCase();
  // initialize hashid structure
  let hashids = new HashIds(HASH_SALT, HASH_MINLEN, HASH_ABET);
  // try to decode the groupId
  const dataIds = hashids.decode(hashedData);
  // invalidate if couldn't decode
  if (dataIds.length === 0) {
    isValid = false;
    return { isValid, token, error: 'invalid token' };
  }
  // invalidate if couldn't decode
  dataIds.forEach(id => {
    if (id === undefined) isValid = false;
    if (!Number.isInteger(id)) isValid = false;
    if (id < 0) isValid = false;
  });
  if (!isValid) return { isValid, studentName, token, error: 'invalid range' };

  // at this point groupId is valid (begins with ID, all numeric)
  // check for valid subgroupId
  [groupId, classroomId] = dataIds;
  return { isValid, studentName, token, groupId, classroomId };
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ Return TRUE if the token decodes into an expected range of values
/*/
SESUTIL.IsValidToken = token => {
  let decoded = SESUTIL.DecodeToken(token);
  return decoded && Number.isInteger(decoded.groupId) && typeof decoded.studentName === 'string';
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * Returns a token string of form NAME-HASHED_DATA
 * @param {String} studentName
 * @param {Object} dataIds
 * @param {Number} dataIds.groupId
 * @param {Number} dataIds.classroomId
 */
SESUTIL.MakeToken = (studentName, dataIds = {}) => {
  // type checking
  if (typeof studentName !== 'string') throw Error(`classId arg1 '${studentName}' must be string`);
  let err;
  if ((err = f_checkIdValue(dataIds))) {
    console.warn(`Could not make token. ${err}`);
    return undefined;
  }

  // initialize hashid structure
  studentName = studentName.toUpperCase();
  const { groupId, classroomId } = dataIds;
  let hashids = new HashIds(HASH_SALT, HASH_MINLEN, HASH_ABET);
  let hashedId = hashids.encode(groupId, classroomId);
  return `${studentName}-${hashedId}`;

  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /// support function
  function f_checkIdValue(idsObj) {
    const ids = Object.keys(idsObj);
    let error = '';
    ids.forEach(key => {
      const val = idsObj[key];
      if (!Number.isInteger(val)) {
        error += `'${key}' is not an integer. `;
        return;
      }
      if (val < 0) {
        error += `'${key}' must be non-negative integer. `;
        return;
      }
      if (val > Number.MAX_SAFE_INTEGER) {
        error += `'${key}' exceeds MAX_SAFE_INTEGER. `;
        return;
      }
    });
    return error;
  }
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ Set the global GROUPID, which is included in all NetMessage
    packets that are sent to server.
/*/
SESUTIL.DecodeAndSet = token => {
  const decoded = SESUTIL.DecodeToken(token);
  const { isValid, studentName, groupId, classroomId } = decoded;
  if (isValid) {
    m_current_name = studentName;
    m_current_idsobj = {
      groupId,
      classroomId
    };
  }
  return isValid;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
SESUTIL.StudentName = () => {
  return m_current_name;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
SESUTIL.Ids = () => {
  return m_current_idsobj;
};

/// EXPORT MODULE /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = SESUTIL;
