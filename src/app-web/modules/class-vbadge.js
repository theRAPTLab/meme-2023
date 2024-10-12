import DEFAULTS from './defaults';
import PMC from './data';
import UR from '../../system/ursys';
const STATE = require('../../system/comment-mgr/lib/client-state');

import CMTMGR from '../../system/comment-mgr/comment-mgr';
import VMech from './class-vmech';

const { VPROP, COLOR, SVGSYMBOLS, CREF_PREFIX } = DEFAULTS;

/// MODULE DECLARATION ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const m_minWidth = VPROP.MIN_WIDTH;
const m_minHeight = VPROP.MIN_HEIGHT;
const m_pad = 5; // was PAD.MIN, but that's too big.  5 works better
const badgeItemRadius = m_minHeight - m_pad / 2; // each commentbtn/evlink badge
const evlinkBadgeXOffset = badgeItemRadius * 1.75 + m_pad; // wide badge with rating embedded

const RATINGS_ICONS = [];
RATINGS_ICONS[-2] = 'ratingsDisagreeStrongly';
RATINGS_ICONS[-1] = 'ratingsDisagree';
RATINGS_ICONS[0] = 'ratingsNone';
RATINGS_ICONS[1] = 'ratingsAgree';
RATINGS_ICONS[2] = 'ratingsAgreeStrongly';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'VBadge';
const UDATAOwner = 'class-vbadge';

/// MODULE HELPERS /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_IsVMech(parent) {
  return parent instanceof VMech;
}

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * The visual representation of "a badge" that can represent:
 *   * a link to the evidence Link
 *   * a link to the sticky note comments associated with the parent
 *
 */
class VBadge {
  /** create a VBadge
   * @param {object} vparent Parent component: class-vprop or class-vmech
   */
  constructor(vparent) {
    this.baseRedrawNeeded = true;

    // Init Data
    this.width = m_minWidth;
    this.height = m_minHeight;
    this.evlinks = [];
    this.oldRating = undefined; // track rating changes to optimize drawing
    this.comments = [];
    this.commentCount = 0;
    this.isVMech = m_IsVMech(vparent);
    this.cref = '';
    if (this.isVMech)
      this.cref = CREF_PREFIX.PROCESS + vparent.data.id;  // CMTMGR.GetCREF('PROCESS', id);
    else if (vparent.isOutcome)
      this.cref = CREF_PREFIX.OUTCOME + vparent.id;  // CMTMGR.GetCREF('OUTCOME', id);
    else
      this.cref = CREF_PREFIX.ENTITY + vparent.id;  // CMTMGR.GetCREF('ENTITY', id);

    // Bind Methods
    this.Refresh = this.Refresh.bind(this);

    // create our own groups
    /**
     *  vBadge
     *    |
     *    +-- gBadges (group)
     *           |
     *           +-- gStickyButtons (group)
     *           |
     *           +-- gEvLinkBadges (group)
     */
    this.gBadges = vparent.GetVBadgeParent().group().attr('id', 'gBadges');
    this.gStickyButtons = VBadge.SVGStickyButton(vparent, this.cref);
    this.gBadges.add(this.gStickyButtons);
    this.gEvLinkBadges = this.gBadges.group().attr('id', 'gEvLinkBadges');

    this.gBadges.click(e => { this.OnClick(e); });

    STATE.OnStateChange('COMMENTCOLLECTION', this.urstate_UpdateCommentCollection, UDATAOwner);

    this.Update(vparent);
    this.DrawBase(vparent);

  }

  /**
   *  Release is called by VProp or VMech
   */
  Release() {
    STATE.OffStateChange('COMMENTCOLLECTION', this.urstate_UpdateCommentCollection);
    this.gStickyButtons.remove();
    this.gEvLinkBadges.remove();
    this.gBadges.remove();
  }

  Refresh(vparent) {
    // COMMENTCOLLECTION changes force vBadge comment button to update with opened/closed status
    this.Draw(vparent);
  }

  urstate_UpdateCommentCollection() {
    this.Refresh(vparent);
  }

  /**
   *  gBadges got a custom click event from class-vprop-draggable
   * @param {mouseEvent} event class-vprop or class-vmech
   */
  OnClick(event) {
    const mouseEvent = event.detail.event;
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();

    // Convert click screen coordinates to svg coordinates
    const { offsetX, offsetY } = mouseEvent;
    const svg = document.getElementById('modelSVG');
    const pt = svg.createSVGPoint();
    pt.x = mouseEvent.clientX;
    pt.y = mouseEvent.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());

    // Which component got the click?
    if (this.gStickyButtons && this.gStickyButtons.inside(svgPt.x, svgPt.y)) {
      // StickyButton got the click
      // Handle as click and pass to VBadge
      this.gStickyButtons.fire('click', { event: mouseEvent });
    } else if (this.evlinks) {
      // An Evidence Link Badge got the click
      // Figure out which badge
      this.gEvLinkBadges.children().forEach(gBadge => {
        console.log('checking', offsetX, svgPt.x, offsetY, svgPt.y, gBadge)
        if (gBadge.inside(svgPt.x, svgPt.y)) {
          gBadge.fire('click', { event: mouseEvent });
        }
      });
    } else {
      console.error(PKG, 'OnClick could not find click object');
    }
  }

  // REVIEW: vprop.PropSize might result in Draw being called twice here.
  SetDimensionsFromParent(vparent) {
    this.width = vparent.width;
    this.height = vparent.height;
    this.Draw(vparent);
  }

  /**
   * Returns the actual width of badges.  Used by parent component when resizing
   * to account for width of badges. (`this.width` is set to be as wide as parent
   * for badge layout purposes)
   */
  GetBadgeWidth() {
    return this.gEvLinkBadges.bbox().width + this.gStickyButtons.bbox().width + m_pad;
  }

  /**
   *  Update is called by VProp/VMech before Draw
   * @param {Object} vparent class-vprop or class-vmech
   * @param {boolean} forceRedraw
   */
  Update(vparent, forceRedraw = false) {
    const id = vparent.id;
    let redrawNeeded = this.baseRedrawNeeded;

    // did anything change?
    const oldEvlinks = this.evlinks;
    let updatedEvlinks;
    if (m_IsVMech(vparent)) {
      // parent is a VMech
      // force redraw if the label has changed
      if (forceRedraw) redrawNeeded = true;
      updatedEvlinks = PMC.PMC_GetEvLinksByMechId(id);
    } else {
      // parent is VProp
      updatedEvlinks = PMC.PMC_GetEvLinksByPropId(id);
    }

    // if the number of links have changed, then we need to redraw
    if (oldEvlinks && updatedEvlinks && (oldEvlinks.length !== updatedEvlinks.length)) {
      redrawNeeded = true;
    }

    // if the ratings have changed, then we need to redraw
    // REVIEW: For some reason this.evlinks and updatedEvlinks are already updated by the time
    // class-vbadge.Update is called.  So we can't compare old and new ratings here.
    oldEvlinks.forEach((oldEvlink, i) => {
      if (oldEvlink.rating !== this.oldRating) {
        redrawNeeded = true;
      }
    });

    this.baseRedrawNeeded = redrawNeeded;
    this.evlinks = updatedEvlinks || [];
  }

  /**
   *  Main Draw method
   *  Decides whether a complete redraw is necessary (to render base objects)
   *  or just an update (to render data changes to existing objects).
   *  This will improve performance dramatically!
   *
   *  @param {*} vparent class-vprop or class-vmech
   */
  Draw(vparent) {
    if (this.baseRedrawNeeded) this.DrawBase(vparent);
    this.DrawUpdate(vparent);
  }

  /**
   *  `DrawBase` draws the core badge elements (sticky note buttons and evidence link badges)
   *  setting the initial object positions and is ONLY called when an update is needed.
   *
   *  We want to limit the number of times we call this method because it is expensive.
   *
   *  Changes tracked:
   *  - evlinks are added/removed
   *  - evlink rating is changed
   *
   *  @param {*} vparent class-vprop or class-vmech
   */
  DrawBase(vparent) {
    // draw badges from left to right
    let xOffset;
    let yOffset;
    let x;
    let y;
    let baseX;
    let baseY;
    if (this.isVMech) {
      // VMech
      x = 0;
      y = 0;
      // xOffset ought to be the text length + padding
      xOffset = vparent.horizText.length();
      yOffset = -8; // hoist badges back up even with text baseline.
      // baseX is the position on the right side of the parent that the badges should start drawing from
      // it draws right-justified, like rtl text.
      baseX = x + xOffset - m_pad * 3;
      baseY = y + yOffset + m_pad * 2;
    } else {
      // VProp
      let baseElement = vparent.visBG; // position of the base prop rectangle
      x = baseElement.x();
      y = baseElement.y();
      xOffset = m_minWidth;  // use original width here, not the current width because the prop increasese in size this.width;
      yOffset = -4;
      baseX = x + xOffset - m_pad;
      baseY = y + yOffset + m_pad * 2;
    }

    // first reset positions
    this.gBadges.move(-badgeItemRadius, 0);
    this.gStickyButtons.move(0, -7);

    // draw evidence link badges
    // -- Clear the group in case objects have changed
    this.gEvLinkBadges.clear();
    if (this.evlinks) {
      // First sort evlinks by numberLabel
      const evlinks = this.evlinks.sort((a, b) => {
        return a.numberLabel > b.numberLabel ? 1 : -1;
      });
      // Then draw each badge
      evlinks.forEach((evlink, i) => {
        const badge = VBadge.SVGEvLink(evlink, vparent);
        this.oldRating = evlink.rating;
        badge.move(i * evlinkBadgeXOffset, -7);
        this.gEvLinkBadges.add(badge);
      });
      // -- Move evlink badges to the right of stickynote button
      this.gEvLinkBadges.move(badgeItemRadius + m_pad, -7);
    }

    // set initial position of sticky note buttons and evlink badges
    const evlinkBadgesOffsetX = this.evlinks ? this.evlinks.length * evlinkBadgeXOffset : 0;
    if (this.isVMech) {
      // VMech is left-justified
      this.gBadges.move(baseX + badgeItemRadius, baseY);
    } else {
      // VProp is right-justified
      // Has Comments: Shift badges left by one badge width + stickynote button width
      this.gBadges.move(baseX + evlinkBadgeXOffset - badgeItemRadius / 2, baseY + 4);
    }

    this.baseRedrawNeeded = false;
  }


  /**
   *  `DrawUpdate` updates changed data and is called by VProp or VMech
   *
   *  Changes tracked:
   *  - comment count change
   *  - comment thread is opened/closed
   *  - comment thread is marked read
   *
   *  @param {*} vparent class-vprop or class-vmech
   */
  DrawUpdate(vparent) {
    // Set Current Read/Unreaad status
    const comments = PMC.GetURComments(this.cref);
    let hasComments;
    let hasUnreadComments;
    if (comments === undefined) {
      hasComments = false;
      hasUnreadComments = false;
    } else {
      hasComments = comments.length > 0;
      const ccol = CMTMGR.GetCommentCollection(this.cref) || {};
      hasUnreadComments = ccol.hasUnreadComments;
    }

    const uistate = CMTMGR.GetCommentUIState(this.cref);
    const commentThreadIsOpen = uistate && uistate.isOpen;

    // update count on draw b/c number of comments might change
    if (Array.isArray(comments)) this.commentCount = comments.filter(c => !c.comment_isMarkedDeleted).length;

    this.gStickyButtons.gLabel
      .text(this.commentCount) // BUG: If text is empty, dragging seeems to lead to a race condition

    // update sticky button icons and comment count label
    // this replicates what URCommentBtn usually handles
    if (!hasComments) {
      // no sticky buttons
      this.gStickyButtons.attr({ visibility: 'hidden' });
    } else {
      // has sticky buttons
      this.gStickyButtons.attr({ visibility: 'visible' });
      if (hasUnreadComments) {
        // Unread
        if (commentThreadIsOpen) {
          this.gStickyButtons.gIcon.use(SVGSYMBOLS.get('commentUnreadSelected'));
          this.gStickyButtons.gLabel.font({ fill: COLOR.COMMENT_LIGHT });
        } else {
          this.gStickyButtons.gIcon.use(SVGSYMBOLS.get('commentUnread'));
          this.gStickyButtons.gLabel.font({ fill: COLOR.COMMENT_DARK });
        }
      } else {
        // Read
        if (commentThreadIsOpen) {
          this.gStickyButtons.gIcon.use(SVGSYMBOLS.get('commentReadSelected'));
          this.gStickyButtons.gLabel.font({ fill: '#fff' });
        } else {
          this.gStickyButtons.gIcon.use(SVGSYMBOLS.get('commentRead'));
          this.gStickyButtons.gLabel.font({ fill: COLOR.COMMENT_READ });
        }
      }
    }

  }

}

/// STATIC CLASS METHODS //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 *  Allocate VBadge instances through this static method. It maintains
 *  the collection of all allocated visuals through DATA.VM_* calls as well
 */
VBadge.New = vparent => {
  const vbadge = new VBadge(vparent);
  return vbadge;
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  De-allocate VProp instance by id.
 */
VBadge.Release = () => {
  console.error('I dont think this is called');
  // const vbadge = DATA.VM_VBadge(evId);
  // DATA.VM_VBadgeDelete(evId);
  // return vbadge.Release();
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Update instance from associated data id
 */
VBadge.Update = evId => {
  console.error('VBadge.Update');
  // REVIEW: text updates should happen here
  // Draw() is called after Update() in the parent component

  // not updated yet
  // const vbadge = DATA.VM_VBadge(evId);
  // if (vbadge) vbadge.Update();
  // return vbadge;
};

/// SVGEvLink  ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Creates and returns a badge for an evidence link
 */
VBadge.SVGEvLink = (evlink, vparent) => {
  const root = vparent.gRoot;

  const onClick = customEvent => {
    const e = customEvent.detail.event || customEvent; // class-vprop-dragdrop sends custom events, but vmech sends regular mouse events.
    e.preventDefault();
    e.stopPropagation();
    if (DBG) console.log(`${e.target} clicked`);
    UR.Publish('SHOW_EVIDENCE_LINK', { evId: evlink.id, rsrcId: evlink.rsrcId });
  };

  // create vbadge sub elements
  const gEvLink = root.group().attr({ id: 'gEvLink' }).click(onClick);
  gEvLink.gRect = gEvLink.rect(badgeItemRadius * 1.75, badgeItemRadius).radius(badgeItemRadius / 2).fill('#4db6ac');
  gEvLink.gRect.attr({ cursor: 'pointer' });

  gEvLink.gLabel = gEvLink
    .text(evlink.numberLabel)
    .font({ fill: '#fff', size: '12px', anchor: 'middle' })
    .dmove(badgeItemRadius / 2, badgeItemRadius / 2 + 4)
    .attr({ cursor: 'pointer' });

  gEvLink.gRating = new VBadge.SVGRating(evlink, gEvLink)
    .dmove(badgeItemRadius * 0.9, 4.5);
  return gEvLink;
};

/// SVGRating  ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Creates and returns the rating emoji icon for a badge
 */
VBadge.SVGRating = (evlink, gEvLink) => {
  const rating = evlink.rating;
  const gRatings = gEvLink
    .group()
    .attr({ id: 'gRatings' })
    .move(badgeItemRadius * 0.9, 4.5);
  gRatings.group().circle(18).fill('#fff');
  gRatings.group()
    .use(SVGSYMBOLS.get(RATINGS_ICONS[rating === undefined ? 0 : rating]))
    .move(1, 1);
  return gRatings;
};

/// SVGStickyButton  //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Creates and returns a comment button group object to turn on/off
 *
 *  Click Events
 *  VProp's drag handler prevents click and mouseup events from propagating
 *  down to the gStickyButtons group, so we have to handle ourselves.
 */
VBadge.SVGStickyButton = (vparent, cref) => {
  const onClick = customEvent => {
    let e = customEvent.detail.event || customEvent; // class-vprop-dragdrop sends custom events, but vmech sends regular mouse events.
    e.preventDefault();
    e.stopPropagation();
    if (DBG) console.log(`${e.target} clicked e=${e}`);

    // don't allow clicks if the sticky button is hidden
    if (gStickyButtons.attr('visibility') === 'hidden') return;

    CMTMGR.OpenCommentCollection(cref, { x: e.clientX, y: e.clientY });
  };

  // create vbadge sub elements
  // 1. main gStickyButtons group
  let gStickyButtons = vparent.gRoot
    .group()
    .attr({
      id: 'gStickyNoteBtn',
      cursor: 'pointer'
    })
    .click(onClick);
  // 2. icon group
  gStickyButtons.gIcon = gStickyButtons.group()
    .use(SVGSYMBOLS.get('commentUnread'))
    .scale(1.6);
  // 3. comment count label group
  gStickyButtons.gLabel = gStickyButtons.group()
    // BUG: If text is empty (undefined or '' or even ' '), dragging leads to doubling the drag distance
    // BUG: Always set text to a non-empty string to avoid the bug
    .text('-')
    .font({ fill: COLOR.COMMENT_DARK, size: '12px', anchor: 'middle' })
    .attr({ cursor: 'pointer' })
    .dmove(5.5, 10);

  return gStickyButtons;
};

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default VBadge;
