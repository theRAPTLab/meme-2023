const rfdc = require('rfdc')();

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const PKG = 'ADMUnits'; // prefix for console.log

/// MODULE DECLARATION ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * @module ADMUnits
 * @desc
 * A centralized object factory for classroom administration.
 */
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const ADMUnits = {}; // module object to export
let UNITS = {}; // unitId -> unit object

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMUnits.GetUnits = () => {
  return Object.UNITS;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// Return [{id, label}] of all units
ADMUnits.GetUnitsList = () => {
  const list = Object.keys(UNITS).map(id => {
    return { id, label: UNITS[id].label || id };
  });
  return list;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// Return the first unitId in the list
ADMUnits.GetUnitDefaultId = () => {
  if (Object.keys(UNITS).length === 0) {
    throw Error('GetUnitDefaultId: no units defined!');
  }
  return Object.keys(UNITS)[0];
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMUnits.SetUnits = units => {
  if (typeof units !== 'object') throw Error('SetUnits requires an object!');
  UNITS = rfdc(units);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMUnits.GetUnit = unitId => {
  if (unitId === undefined) throw Error('GetUnit requires a unitId!');
  if (!UNITS[unitId])
    throw Error(`GetUnit: unknown unitId '${unitId}' UNITS: ${Object.keys(UNITS)}`);
  return rfdc(UNITS[unitId]);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMUnits.HasUnit = unitId => {
  if (unitId === undefined) throw Error('HasUnit requires a unitId!');
  return UNITS[unitId] !== undefined;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMUnits.GetUnitLabel = unitId => {
  if (unitId === undefined) throw Error('GetUnitLabel requires a unitId!');
  // Display the "Unit Not Found" if no label is defined so errors can be displayed
  if (!UNITS[unitId]) return `Unit '${unitId}' Not Found`;
  else return UNITS[unitId].label;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMUnits.GetResources = unitId => {
  const unit = ADMUnits.GetUnit(unitId);
  if (!unit) throw Error(`GetResources: unknown unitId '${unitId}'`);
  return rfdc(unit.resources || []);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMUnits.GetResource = (unitId, resourceId) => {
  const unit = ADMUnits.GetUnit(unitId);
  if (!unit) throw Error(`GetResource: unknown unitId '${unitId}'`);
  return rfdc(unit.resources.find(item => item.id === resourceId));
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMUnits.GetRatings = unitId => {
  const unit = ADMUnits.GetUnit(unitId);
  if (!unit) throw Error(`GetRatings: unknown unitId '${unitId}'`);
  return rfdc(unit.ratings || []);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMUnits.GetCommentTypes = unitId => {
  const unit = ADMUnits.GetUnit(unitId);
  if (!unit) throw Error(`GetCommentTypes: unknown unitId '${unitId}'`);
  return rfdc(unit.commentTypes || []);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMUnits.GetPreferences = unitId => {
  if (!unitId || !ADMUnits.HasUnit(unitId)) return { noValidUnitId: true };
  const unit = ADMUnits.GetUnit(unitId);
  return rfdc(unit.preferences || { noPreferences: true });
};

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default ADMUnits;
