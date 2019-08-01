import ADM from './adm-data';
import DATA from './pmc-data';
import { cssalert, cssinfo } from './console-styles';
import DEFAULTS from './defaults';
import UR from '../../system/ursys';

const { VPROP, PAD } = DEFAULTS;

/// MODULE DECLARATION ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const m_minWidth = VPROP.MIN_WIDTH;
const m_minHeight = VPROP.MIN_HEIGHT;
const m_pad = PAD.MIN;
//
const DBG = true;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * The visual representation of "a badge" that represents a link to a piece
 * of evidence in the resource list.
 *
 *
 */
class VBadge {
  /** create a VBadge
   * @param {number} badgeId
   * @param {SVGJSElement} svg root element
   */
  constructor(badgeId, svgRoot) {
    if (DATA.VM_VBadge(badgeId)) throw Error(`${badgeId} is already allocated`);
    if (svgRoot.constructor.name !== 'Svg') throw Error(`arg2 must be SVGJS draw instance`);

    // Find my corresponding VProp
    const evlink = DATA.EvidenceLinkByEvidenceId(badgeId) || {};
    // save minimum props
    this.id = badgeId;
    this.evlink = evlink;

    if (evlink === undefined) throw Error('no evidence defined in model');
    // Not evidence for a property, probably a vmech
    if (evlink.propId === undefined) {
      // CODE REVIEW: VBadge shouldn't even be called if it doesn't support Mechanisms, or VBadge should be smarter
      return this;
    }

    // create an element attached to vprop group
    // note that the drawcode needs to pull the gRoot offset
    // evidence provided is a propId, so we should connect to it
    this.gBadge = svgRoot.group();
    const myVProp = DATA.VM_VProp(evlink.propId);
    myVProp.gRoot.add(this.gBadge);
    myVProp.badgesCount++; // CODE REVIEW: this mechanism using badgeCount properties seems unsystematic
    const badgeCount = myVProp.badgesCount;

    const radius = m_minHeight + m_pad / 2;
    const x = myVProp.gRoot.x();
    const y = myVProp.gRoot.y() + (badgeCount - 1) * 7.5; // FIXME hack -- for some reason Y on subsequent badges is decreased
    const referenceLabel = ADM.Resource(evlink.rsrcId).referenceLabel;

    // create vbadge sub elements
    this.gCircle = this.gBadge
      .circle(radius)
      .fill('#b2dfdb')
      .move(x + m_minWidth - badgeCount * (radius + 0.25 * m_pad) - m_pad, y - m_pad / 2)
      .mousedown(e => {
        e.preventDefault();
        e.stopPropagation();
        if (DBG) console.log(`${e.target} clicked`);
        UR.Publish('SHOW_EVIDENCE_LINK', { evId: evlink.evId, rsrcId: evlink.rsrcId });
      });

    this.gLabel = this.gBadge
      .text(referenceLabel)
      .font({ fill: '#366', size: '0.8em', weight: 'bold' })
      .move(
        x + m_minWidth - badgeCount * (radius + 0.25 * m_pad) - m_pad + 0.4 * radius,
        y + radius / 2 - m_pad
      )
      .mousedown(e => {
        e.preventDefault();
        e.stopPropagation();
        if (DBG) console.log(`${e.target} clicked`);
        UR.Publish('SHOW_EVIDENCE_LINK', { evId: evlink.evId, rsrcId: evlink.rsrcId });
      });

    this.gRating = this.gBadge
      .text('')
      .font({ fill: '#f57f17', size: '1em', weight: 'bold' })
      .move(
        x + m_minWidth - badgeCount * (radius + 0.25 * m_pad) - m_pad + 0.4 * radius,
        y + radius / 2 - m_pad + 20
      );
  }

  /** return associated nodeId
   * @returns {string} nodeId string
   */
  LinkedProp() {
    return this.id;
  }

  /** return upper-left X coordinate */
  X() {
    return this.gBadge.x();
  }

  /** return upper-left y coordinate */
  Y() {
    return this.gBadge.y();
  }

  /** move to upper-left X,Y */
  Move(xObj, y) {
    if (typeof xObj === 'object') {
      const { x: xx, y: yy } = xObj;
      if (typeof xx !== 'number') throw Error(`x ${xx} is not an number`, xx);
      if (typeof yy !== 'number') throw Error(`y ${yy} is not an number`, yy);
      this.gBadge.move(xx, yy);
      return;
    }
    const x = xObj;
    if (typeof x !== 'number') throw Error(`x ${x} is not an number`, x);
    if (typeof y !== 'number') throw Error(`y ${y} is not an number`, y);
    this.gBadge.move(x, y);
  }

  // "destructor"
  Release() {
    // FIXME - Need to update myVProp.badgesCount?
    // FIXME - This is wrong!  How do we remove ourselves?
    DATA.VM_VBadgeDelete(this.evlink.evId);
    if (this.gBadge) this.gBadge.remove();
  }

  /**
   * Update instance properties from model, then call Draw() to update svg elements
   */
  Update() {
    const ev = DATA.EvidenceLinkByEvidenceId(this.id);
    this.UpdateRating(ev.rating);
  }

  /**
   * Ratings are indicated by a number of asterisks
   */
  UpdateRating(rating) {
    let ratingLabel = '';
    for (let i = 1; i <= rating; i++) {
      ratingLabel += '*';
    }
    /* HACK AROUND BROKEN IMPLEMENTATION */
    if (this.gRating) {
      this.gRating.text(ratingLabel).attr({ x: this.gCircle.cx() - rating * 3.5 });
    }
  }
}

/// STATIC CLASS METHODS //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Allocate VBadge instances through this static method. It maintains
 *  the collection of all allocated visuals through DATA.VM_* calls as well
 */
VBadge.New = (evId, svgRoot) => {
  if (DATA.VM_VBadge(evId)) throw Error(`${evId} is already allocated`);
  if (svgRoot.constructor.name !== 'Svg') throw Error(`arg2 must be SVGJS draw instance`);
  const vbadge = new VBadge(evId, svgRoot);
  DATA.VM_VBadgeSet(evId, vbadge);
  return vbadge;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  De-allocate VProp instance by id.
 */
VBadge.Release = evId => {
  const vbadge = DATA.VM_VBadge(evId);
  DATA.VM_VBadgeDelete(evId);
  return vbadge.Release();
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Update instance from associated data id
 */
VBadge.Update = evId => {
  const vbadge = DATA.VM_VBadge(evId);
  if (vbadge) vbadge.Update();
  return vbadge;
};

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default VBadge;