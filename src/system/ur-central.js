/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  UR-CENTRAL manages common settings across all modules, their derived data,
  changes to network data, in one place.

  the key can be namespaced by using a period

  design document here:
  https://gitlab.com/inq-seeds/boilerplate/wikis/design-settings-manager

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/**
 * Central is a common settings manager.
 * @module URCentral
 */
import ValueBinding from './common-valuebinding';

/// MODULE DECLARATIONS ///////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const m_keymap = new Map(); // stores BoundValue objects

/// HELPER FUNCTIONS //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// return detected errors in key format
function u_CheckKey(key) {
  // check for bad input
  if (!key) return `key must be defined`;
  if (typeof key !== 'string') return `key must be a string, not ${typeof key}`;
  // check for non-conforming key names
  const stripped = key.replace(/[^a-zA-Z0-9._]/g, '');
  if (stripped !== key) return `only use characters, '_' and '.' in key, (got '${key}')`;
  if (stripped !== stripped.toLowerCase()) return `key '${key}' must be all lowercase`;
  // now try to store it
  return ''; // emptystring no error detected
} // u_CheckKey()

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * define a value in the settings map
 * can use the form .
 * @memberof URCentral
 */
const Define = (key, value) => {
  let err = u_CheckKey(key);
  if (err) throw Error(err);
  if (m_keymap.has(key)) throw Error(`key '${key}' already exists`);
  const binding = new ValueBinding(key, value);
  console.log(`defined '${key}'`);
  m_keymap.set(key, binding);
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * return binding of key
 * @memberof URCentral
 * @returns {ValueBinding}
 */
const GetBinding = key => {
  let err = u_CheckKey(key);
  if (err) throw Error(err);
  const binding = m_keymap.get(key);
  if (!binding) throw Error(`key '${key}' not defined before using GetBinding()`);
  return binding;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * return value of key
 * @memberof URCentral
 */
const GetVal = key => {
  let err = u_CheckKey(key);
  if (err) throw Error(err);
  const binding = m_keymap.get(key);
  if (!binding) throw Error(`key '${key}' not defined before using GetVal()`);
  return binding.getValue();
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * set value of key
 * @memberof URCentral
 */
const SetVal = (key, value) => {
  let err = u_CheckKey(key);
  if (err) throw Error(err);
  const binding = m_keymap.get(key);
  if (!binding) throw Error(`key ${key} must be Defined before using SetVal()`);
  binding.setValue(value);
};

/// TESTS /////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Define('bananafried', 'bananasplit');
// console.log('getval', GetVal('bananafried'));
// SetVal('bananafried', 'pika');
// console.log('getval', GetVal('bananafried'));
// SetVal('bananafried', 'error');
// const bananaBinding = GetBinding('bananafried');
// bananaBinding.setValue('hola');

/// INITIALIZE UR PARAMS //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// URSYS parameters are defined in the startup html.
/// Copy them into URCENTRAL officially
if (window.URSESSION) {
  Define('ur_session', window.URSESSION);
}
/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default { Define, GetBinding, GetVal, SetVal };
