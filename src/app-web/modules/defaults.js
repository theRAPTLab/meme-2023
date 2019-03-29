/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\
\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

const GAP = 15;
const VPROP = {
  MIN_WIDTH: 200,
  MIN_HEIGHT: 30
};
const VMECH = {
  STROKE: 5
};
const PAD = {
  MIN: GAP,
  MIN2: GAP * 2
};

// construct string id from sourceId, targetId for use in storing edge ids.
// v = source, w = target in dagrejs/graphlib
function VPathId(vso, ws) {
  let [v, w] = ArrayFromABO(vso, ws);
  if (typeof v !== 'string') throw Error(`arg1 must be string id`);
  if (typeof w !== 'string') throw Error(`arg2 must be string id`);
  return `${v}:${w}`;
}
// deconstruct a single pathId into edgeObj
// const eobj = EdgeObjFromPathId(pathId))
function EdgeObjFromPathId(pathId, delimiter = ':') {
  if (typeof pathId !== 'string') throw Error('arg must be string');
  let bits = pathId.split(delimiter);
  if (bits.length !== 2) throw Error(`pathId has too many ${delimiter} chars`);
  return { v: bits[0], w: bits[1] };
}
// deeconstruct either int,int or object with keys into array
// const [ a, b] = ArrayFromABO(x,y) or ArrayFromABO(obj)
// used by code for move() that could get a point x,y or x,y
function ArrayFromABO(aObj, bNum) {
  if (typeof aObj === 'object') {
    if (bNum === undefined) return Object.values(aObj);
    throw Error(`can't normalize aObj ${aObj}, bNum ${bNum}`);
  }
  return [aObj, bNum];
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export { VPROP, VMECH, PAD, VPathId, ArrayFromABO, EdgeObjFromPathId };
