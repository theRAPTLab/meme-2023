import DEFAULTS from './defaults';
import ADM from './data';
import PMC from './data';
import UR from '../../system/ursys';
import VMech from './class-vmech';

const { VPROP, COLOR, SVGSYMBOLS, CREF_PREFIX } = DEFAULTS;

/// MODULE DECLARATION ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const m_minWidth = VPROP.MIN_WIDTH;
const m_minHeight = VPROP.MIN_HEIGHT;
const m_pad = 5; // was PAD.MIN, but that's too big.  5 works better
const badgeRadius = m_minHeight - m_pad / 2;
const badgeXOffset = badgeRadius + m_pad;

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const PKG = 'VBadge';

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
   *  @param {object} vparent Parent component: class-vprop or class-vmech
   */
  constructor(vparent) {
    // Init Data
    this.width = m_minWidth;
    this.height = m_minHeight;
    this.evlinks = [];
    this.comments = [];

    // create our own groups
    /**
     *  vBadge
     *    |
     *    +-- gBadges (group)
     *           |
     *           +- gEvLinkBadges (group)
     *           |
     *           +-- gStickyButtons (group)
     */
    this.gBadges = vparent.GetVBadgeParent().group().attr('id', 'gBadges');
    this.gStickyButtons = VBadge.SVGStickyButton(vparent);
    this.gBadges.add(this.gStickyButtons);
    this.gEvLinkBadges = this.gBadges.group().attr('id', 'gEvLinkBadges');

    this.gBadges.click(e => {
      this.OnClick(e);
    });

    this.Update(vparent);
  }

  /**
   *  gBadges got a custom click event from class-vprop-draggable
   *  @param {mouseEvent} event class-vprop or class-vmech
   */
  OnClick(event) {
    const mouseEvent = event.detail.event;
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();

    // Convert click screen coordinates to svg coordinates
    const { offsetX, offsetY } = mouseEvent;
    let svg = document.getElementById('modelSVG');
    let pt = svg.createSVGPoint();
    pt.x = mouseEvent.clientX;
    pt.y = mouseEvent.clientY;
    let svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());

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
   *  @param {*} vparent class-vprop or class-vmech
   */
  Update(vparent) {
    const id = vparent.id;
    if (m_IsVMech(vparent)) {
      // parent is a VMech
      this.evlinks = PMC.PMC_GetEvLinksByMechId(id);
    } else {
      // parent is VProp
      this.evlinks = PMC.PMC_GetEvLinksByPropId(id);
    }
  }

  /**
   *  Draw is called by VProp or VMech
   *  @param {*} vparent class-vprop or class-vmech
   */
  Draw(vparent) {
    // draw badges from left to right

    const isVMech = m_IsVMech(vparent);

    let xOffset;
    let yOffset;
    let x;
    let y;
    let baseX;
    let baseY;
    if (isVMech) {
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
      xOffset = 0;  // this.width;
      yOffset = -4;
      baseX = x + xOffset - m_pad;
      baseY = y + yOffset + m_pad * 2;
    }

    // draw evidence link badges
    // -- first clear the group in case objects have changed
    this.gEvLinkBadges.clear();
    if (this.evlinks) {
      // First sort evlinks by numberLabel
      const evlinks = this.evlinks.sort((a, b) => {
        return a.numberLabel > b.numberLabel ? 1 : -1;
      });
      // Then draw each badge
      evlinks.forEach((evlink, i) => {
        const badge = VBadge.SVGEvLink(evlink, vparent);
        this.gEvLinkBadges.add(badge);
        badge.transform({ translate: [baseX + i * badgeXOffset, baseY] });
      });
    }

    // Set Current Read/Unread status
    let hasComments;
    let hasUnreadComments;

    // DEPRECATED StickyNotes in favor of URCommentThreadMgr
    // const comments = PMC.GetComments(isVMech ? vparent.data.id : vparent.id);

    // URComment
    let cref;
    if (isVMech)
      cref = CREF_PREFIX.PROCESS + vparent.data.id;  // CMTMGR.GetCREF('PROCESS', id);
    else if (vparent.isOutcome)
      cref = CREF_PREFIX.OUTCOME + vparent.id;  // CMTMGR.GetCREF('OUTCOME', id);
    else
      cref = CREF_PREFIX.ENTITY + vparent.id;  // CMTMGR.GetCREF('ENTITY', id);
    const comments = PMC.GetURComments(cref);

    const commentCount = comments && comments.length > 0 ? comments.length : '';
    this.gStickyButtons.gLabel.text(commentCount);

    if (comments === undefined) {
      hasComments = false;
      hasUnreadComments = false;
    } else {
      hasComments = comments.length > 0;
      const author = ADM.GetAuthorId();
      hasUnreadComments = PMC.HasUnreadComments(comments, author);
    }
    if (!hasComments) {
      this.gStickyButtons.chat.attr('display', 'none');
      this.gStickyButtons.read.attr('display', 'none');
      this.gStickyButtons.unread.attr('display', 'none'); // don't show outline to keep interface clean
    } else if (hasUnreadComments) {
      this.gStickyButtons.chat.attr('display', 'none');
      this.gStickyButtons.read.attr('display', 'none');
      this.gStickyButtons.unread.attr('display', 'inline'); // Evan's design always has an outline
    } else {
      // all comments read
      this.gStickyButtons.chat.attr('display', 'none');
      this.gStickyButtons.read.attr('display', 'inline');
      this.gStickyButtons.unread.attr('display', 'none');
    }

    // Show sticky buttons to the left of evlinks
    // adjust for width of vprop
    if (isVMech) {
      if (hasComments) {
        // xOffset is the width of the text
        this.gStickyButtons.transform({ translate: [xOffset - this.gStickyButtons.bbox().w, 7] });
        this.gBadges.transform({ translate: [badgeXOffset * 2, 0] });
      } else {
        this.gBadges.transform({ translate: [badgeRadius + m_pad, 0] });
      }
    } else {
      const { w: evlinkWidths } = this.gEvLinkBadges.bbox();
      this.gBadges.transform({ translate: [this.width - evlinkWidths - m_pad, 0] });
      this.gStickyButtons.transform({ translate: [- this.gStickyButtons.bbox().w * 0.8, 14] });
    }

  }

  /**
   *  Release is called by VProp or VMech
   */
  Release() {
    this.gStickyButtons.remove();
    this.gEvLinkBadges.remove();
    this.gBadges.remove();
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
  console.error('I dont think this is aalled');
  // const vbadge = DATA.VM_VBadge(evId);
  // DATA.VM_VBadgeDelete(evId);
  // return vbadge.Release();
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Update instance from associated data id
 */
VBadge.Update = evId => {
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
    if (DBG) console.log(`SVGEvLink ${e.target} clicked`);
    UR.Publish('SHOW_EVIDENCE_LINK', { evId: evlink.id, rsrcId: evlink.rsrcId });
  };

  // create vbadge sub elements
  const gBadge = root.group().click(onClick);
  gBadge.gCircle = gBadge.circle(badgeRadius).fill('#4db6ac');
  gBadge.gCircle.attr({ cursor: 'pointer' });

  gBadge.gLabel = gBadge
    .text(evlink.numberLabel)
    .font({ fill: '#fff', size: '12px', anchor: 'middle' })
    .dmove(badgeRadius / 2, badgeRadius / 2 + 4)
    .attr({ cursor: 'pointer' })
    .click(() => console.warn('evlink clicked directly'));

  gBadge.gRating = VBadge.SVGRating(evlink, gBadge).move(
    1 + (3 - Math.max(1, Math.abs(evlink.rating))) * 4, // always shift at least 1 symbol, since no rating is 0
    badgeRadius + 1
  );

  return gBadge;
};

/// SVGRating  ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Creates and returns the rating icon for a badge
 */
VBadge.SVGRating = (evlink, gBadge) => {
  const rating = evlink.rating;
  let gRatings = gBadge.gRatings || gBadge.group(); // use existing group if it exists
  gRatings.clear();
  if (rating > 0) {
    // positive
    for (let i = 0; i < rating; i++) {
      gRatings
        .use(SVGSYMBOLS.get('ratingsPositive'))
        .dmove(i * (5 + m_pad / 2), 0)
        .scale(0.4);
    }
  } else if (rating < 0) {
    // negative
    for (let i = 0; i < -rating; i++) {
      gRatings
        .use(SVGSYMBOLS.get('ratingsNegative'))
        .dmove(i * (5 + m_pad / 2), 0)
        .scale(0.4);
    }
  } else {
    // Not Rated
    gRatings
      .use(SVGSYMBOLS.get('ratingsNeutral'))
      .move(m_pad / 2 - 1, 0)
      .scale(0.4);
  }

  return gRatings;
};

/// SVGStickyButton  //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Creates and returns a sticky button group object with three buttons to turn on/off
 *
 *  Click Events
 *  VProp's drag handler prevents click and mouseup events from propagating
 *  down to the gStickyButtons group.
 */
VBadge.SVGStickyButton = (vparent) => {
  const onClick = customEvent => {
    let e = customEvent.detail.event || customEvent; // class-vprop-dragdrop sends custom events, but vmech sends regular mouse events.
    e.preventDefault();
    e.stopPropagation();
    if (DBG) console.log(`SVGStickyButton ${e.target} clicked e=${e}`);

    // special handling for mechs
    // mech.id is actually a pathid, not the PMCData (db) id.
    // We want comments to reference the db id so that they are unique and persistent
    // e.g. when a mech is reversed, the id remains the same
    // e.g. when a mech is deleted, the id is deleted, so if a new mech with the same pathid
    //      is created, the comment isn't pulled up again.
    const isVMech = m_IsVMech(vparent);
    const id = isVMech ? vparent.data.id : vparent.id;

    // DEPRECATED StickyNotes in favor of URCommentThreadMgr
    // UR.Publish('STICKY_OPEN', {
    //   refId: id,
    //   x: e.clientX,
    //   y: e.clientY
    // });

    // URComment
    let cref;
    if (isVMech)
      cref = CREF_PREFIX.PROCESS + id;  // CMTMGR.GetCREF('PROCESS', id);
    else if (vparent.isOutcome)
      cref = CREF_PREFIX.OUTCOME + id;  // CMTMGR.GetCREF('OUTCOME', id);
    else
      cref = CREF_PREFIX.ENTITY + id;  // CMTMGR.GetCREF('ENTITY', id);
    console.log('VBADGET cref', cref, 'position', { x: e.clientX, y: e.clientY });
    UR.Publish('CTHREADMGR_THREAD_OPEN', { cref, position: { x: e.clientX, y: e.clientY } });
  };

  // create vbadge sub elements
  let gStickyButtons = vparent.gRoot
    .group()
    .attr({
      id: 'gStickyNoteBtn',
      cursor: 'pointer'
    })
    .click(onClick);

  // Create SVG Icons
  // URComment
  const scale = 1.6;
  gStickyButtons.chat = gStickyButtons.group().use(SVGSYMBOLS.get('commentUnread')).scale(scale);
  gStickyButtons.read = gStickyButtons.group().use(SVGSYMBOLS.get('commentRead')).scale(scale);
  gStickyButtons.unread = gStickyButtons
    .group()
    .use(SVGSYMBOLS.get('commentUnreadSelected'))
    .scale(scale);

  // StickyButtons
  // gStickyButtons.chat = gStickyButtons.group().use(SVGSYMBOLS.get('chatIcon'));
  // gStickyButtons.read = gStickyButtons.group().use(SVGSYMBOLS.get('read'));
  // gStickyButtons.unread = gStickyButtons
  //   .group()
  //   .use(SVGSYMBOLS.get('unread'));

  gStickyButtons.gLabel = gStickyButtons
    .text('')
    .font({ fill: COLOR.COMMENT_DARK, size: '12px', anchor: 'middle' })
    .dmove(5.5, 10) // m_minHeight / 4, m_minHeight / 3)
    .attr({ cursor: 'pointer' });

  return gStickyButtons;
};

/// MODULE HELPERS /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_IsVMech(parent) {
  return parent instanceof VMech;
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default VBadge;
