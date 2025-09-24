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
ADMUnits.SetUnits = units => {
  if (typeof units !== 'object') throw Error('SetUnits requires an object!');
  UNITS = rfdc(units);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ADMUnits.GetUnit = unitId => {
  if (unitId === undefined) throw Error('GetUnit requires a unitId!');
  if (!UNITS[unitId]) throw Error(`GetUnit: unknown unitId '${unitId}'`);
  return rfdc(UNITS[unitId]);
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
  if (!unit) throw Error(`GetResources: unknown unitId '${unitId}'`);
  return rfdc(unit.ratings || []);
};

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default ADMUnits;
