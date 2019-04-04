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

// construct string id from source and target OR edge object
// vso = sourceId or edgeObject, ws = targetId
function CoerceToPathId(vso, ws) {
  // assume this is an edgeObj
  const vtype = typeof vso;
  const wtype = typeof ws;
  if (vtype === 'object') {
    const { v, w } = vso;
    if (!(v && w)) {
      console.warn('error edgeObj', vso);
      throw Error(`missing v and w prop_set in arg`);
    }
    return `${v}:${w}`;
  }
  // Maybe a string was passed in and its a pathId already?
  if (vtype === 'string' && ws === undefined) return vso;

  //
  if (wtype !== 'string') throw Error(`arg2 '${ws}' must be string id (arg1 was '${vso}')`);
  return `${vso}:${ws}`;
}
// deconstruct a single pathId into edgeObj. Accepts v,w and edgeobjs too
// const eobj = CoerceToEdgeObj(pathId))
function CoerceToEdgeObj(pathId, ws) {
  const ptype = typeof pathId;
  const wtype = typeof ws;
  if (ptype === 'string') {
    if (ws === undefined) {
      // this is probably a regular pathid
      let bits = pathId.split(':');
      if (bits.length !== 2) throw Error(`pathId parse error. Check delimiter char`);
      return { v: bits[0], w: bits[1] };
    }
    // this might be v,w
    return { v: pathId, w: ws };
  }
  if (ptype === 'object' && pathId.v && pathId.w) {
    return pathId; // this is already an edgeobj
  }
  throw Error('can not conform');
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
export { VPROP, VMECH, PAD, CoerceToPathId, ArrayFromABO, CoerceToEdgeObj };
