import DEFAULTS from './defaults';
import ADM from './data';
import PMC from './data';
import UR from '../../system/ursys';
import CMTMGR from '../../system/comment-mgr/comment-mgr';
import VMech from './class-vmech';
import RATINGS from '../components/WRatings';


const { VPROP, COLOR, SVGSYMBOLS, CREF_PREFIX } = DEFAULTS;

/// MODULE DECLARATION ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const m_minWidth = VPROP.MIN_WIDTH;
const m_minHeight = VPROP.MIN_HEIGHT;
const m_pad = 5; // was PAD.MIN, but that's too big.  5 works better
const badgeRadius = m_minHeight - m_pad / 2;
const badgeXOffset = badgeRadius * 1.75 + m_pad; // wide badge with rating embedded

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'VBadge';

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
    // Init Data
    this.width = m_minWidth;
    this.height = m_minHeight;
    this.evlinks = [];
    this.comments = [];
    this.commentCount = 0; // cache the comment count for performance
    this.isVMech = m_IsVMech(vparent);
    this.cref = '';
    if (this.isVMech)
      this.cref = CREF_PREFIX.PROCESS + vparent.data.id;  // CMTMGR.GetCREF('PROCESS', id);
    else if (vparent.isOutcome)
      this.cref = CREF_PREFIX.OUTCOME + vparent.id;  // CMTMGR.GetCREF('OUTCOME', id);
    else
      this.cref = CREF_PREFIX.ENTITY + vparent.id;  // CMTMGR.GetCREF('ENTITY', id);

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
    // oRig
    //    this.gEvLinkBadges = this.gBadges.group().attr('id', 'gEvLinkBadges');
    this.gStickyButtons = VBadge.SVGStickyButton(vparent, this.cref, 0, 0);
    this.gBadges.add(this.gStickyButtons);
    // try add stickys AFTEr evlnk -- changing the order CHANGES transforms!
    this.gEvLinkBadges = this.gBadges.group().attr('id', 'gEvLinkBadges');


    this.gBadges.click(e => {
      this.OnClick(e);
    });

    this.Update(vparent);
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
   * @param {*} vparent class-vprop or class-vmech
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
   * @param {*} vparent class-vprop or class-vmech
   */
  Draw(vparent) {
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
      xOffset = this.width;
      yOffset = -4;
      baseX = x + xOffset - m_pad;
      baseY = y + yOffset + m_pad * 2;
    }

    // counter offset for each badge
    let xx = 0;

    // draw evidence link badges
    // -- first clear the group in case objects have changed
    this.gEvLinkBadges.clear();
    if (this.evlinks) {
      // First sort evlinks by numberLabel
      const evlinks = this.evlinks.sort((a, b) => {
        return a.numberLabel > b.numberLabel ? 1 : -1;
      });
      // Then draw each badge
      evlinks.forEach(evlink => {
        const badge = VBadge.SVGEvLink(evlink, vparent);
        this.gEvLinkBadges.add(badge);
        if (this.isVMech) {
          // Draw left-justified
          badge.move(baseX + xx + badge.width(), baseY);
        } else {
          // Draw right-justified
          badge.move(baseX + xx - badge.width() - m_pad, baseY);
        }
        xx += badge.width() + m_pad;
      });
    }

    // Set Current Read/Unreaad status
    let hasComments;
    let hasUnreadComments;

    // DEPRECATED StickyNotes in favor of URCommentThreadMgr
    // const comments = PMC.GetComments(isVMech ? vparent.data.id : vparent.id);

    // URComment
    const comments = PMC.GetURComments(this.cref);
    if (comments === undefined) {
      hasComments = false;
      hasUnreadComments = false;
    } else {
      hasComments = comments.length > 0;
      const author = ADM.GetAuthorId();
      const ccol = CMTMGR.GetCommentCollection(this.cref) || {};
      hasUnreadComments = ccol.hasUnreadComments;
    }

    const uistate = CMTMGR.GetCommentUIState(this.cref);
    const commentThreadIsOpen = uistate && uistate.isOpen;
    console.log('commentThreadIsOpen', commentThreadIsOpen, 'cref', this.cref);

    // OPenComments is a secondary function?  Use CommentUIState instead for a more direct review?
    // const openuiref = CMTMGR.GetOpenComments(this.cref);
    // if (openuiref === this.cref) console.error('OPEN!!!', openuiref);
    // else console.log('openuiref', openuiref, 'cref', this.cref);
    // const commentThreadIsOpen = openuiref === this.cref;

    // hide everything first
    // this.gStickyButtons.unread.attr('display', 'none');
    // this.gStickyButtons.read.attr('display', 'none');
    // this.gStickyButtons.unreadSelected.attr('display', 'none');
    // this.gStickyButtons.readSelected.attr('display', 'none');
    // this.gStickyButtons.gLabel.attr('display', 'none');
    // if (!hasComments) {
    //   // no sticky buttons
    // } else if (hasUnreadComments) {
    //   if (commentThreadIsOpen) this.gStickyButtons.unreadSelected.attr('display', 'inline');
    //   else this.gStickyButtons.unread.attr('display', 'inline');
    //   this.gStickyButtons.gLabel.attr('display', 'inline');
    // } else {
    //   // all comments read
    //   if (commentThreadIsOpen) this.gStickyButtons.readSelected.attr('display', 'inline');
    //   else this.gStickyButtons.read.attr('display', 'inline');
    //   this.gStickyButtons.gLabel.attr('display', 'inline');
    // }

    // update count on draw b/c number of comments might change
    if (comments && comments.length > 0) {
      // don't update the label if the count hasn't changed.
      // improves performance significantly
      if (comments.length !== this.commentCount) {
        // gLabel text can't be empty string, or dragging leads to race condition
        // this.gStickyButtons.gLabel.text(comments.length);  // BUG: If text is empty, dragging seeems to lead to a race condition
        this.commentCount = comments.length;
      }
    }

    // clear every draw so we don't have a ton of extra svg objects being shown/hidden
    // just the necessary ones.
    const scale = 1.6;
    this.gStickyButtons.clear();
    if (!hasComments) {
      // no sticky buttons
    } else if (hasUnreadComments) {
      // Unread
      if (commentThreadIsOpen)
        this.gStickyButtons.group()
          .use(SVGSYMBOLS.get('commentUnreadSelected'))
          .scale(scale);
      else this.gStickyButtons.group()
        .use(SVGSYMBOLS.get('commentUnread'))
        .scale(scale);
      this.gStickyButtons.gLabel = this.gStickyButtons
        .text(this.commentCount) // BUG: If text is empty, dragging seeems to lead to a race condition
        .font({ fill: COLOR.COMMENT_DARK, size: '12px', anchor: 'middle' })
        .dmove(5.5, 10)
        // .transform({ translate: [5.5, 10] }) // m_minHeight / 4, m_minHeight / 3)
        .attr({ cursor: 'pointer' });
    } else {
      // Read
      if (commentThreadIsOpen) {
        this.gStickyButtons.group()
          .use(SVGSYMBOLS.get('commentReadSelected'))
          .scale(scale);
        this.gStickyButtons.gLabel = this.gStickyButtons
          .text(this.commentCount) // BUG: If text is empty, dragging seeems to lead to a race condition
          .font({ fill: '#fff', size: '12px', anchor: 'middle' })
          .dmove(5.5, 10)
          // .transform({ translate: [5.5, 10] }) // m_minHeight / 4, m_minHeight / 3)
          .attr({ cursor: 'pointer' });
      } else {
        this.gStickyButtons.group()
          .use(SVGSYMBOLS.get('commentRead'))
          .scale(scale);
        this.gStickyButtons.gLabel = this.gStickyButtons
          .text(this.commentCount) // BUG: If text is empty, dragging seeems to lead to a race condition
          .font({ fill: COLOR.COMMENT_READ, size: '12px', anchor: 'middle' })
          .dmove(5.5, 10)
          // .transform({ translate: [5.5, 10] }) // m_minHeight / 4, m_minHeight / 3)
          .attr({ cursor: 'pointer' });
      }
    }

    // Move gStickyButtons only AFTER setting display state, otherwise, the icon will get drawn at 0,0
    const evlinkBadgesOffsetX = this.evlinks ? this.evlinks.length * badgeXOffset : 0;
    if (this.isVMech) {
      // VMech is left-justified

      // NEW sticky on left
      if (hasComments) {
        // -- move sticky notes AFTER moving gBadges for more predictable left-justified layout
        this.gStickyButtons.move(baseX + this.gStickyButtons.bbox().w / 2, baseY); // always move in case evlink badges change
        this.gBadges.move(baseX + this.gStickyButtons.bbox().w + m_pad, baseY);
      } else {
        this.gBadges.move(baseX + evlinkBadgesOffsetX, baseY);
        // -- move sticky notes AFTER moving gBadges for more predictable left-justified layout
        this.gStickyButtons.move(baseX + this.gStickyButtons.bbox().w / 2 + m_pad, baseY); // always move in case evlink badges change
      }

      // ORIG sticky on right
      // this.gStickyButtons.move(baseX + xx + this.gStickyButtons.bbox().w + m_pad, baseY); // always move in case evlink badges change
    } else {
      // VProp is right-justified

      // NEW sticky on left

      // TRY evlink too far to the left, move it closer to sticky
      this.gStickyButtons.move(baseX - badgeXOffset - badgeRadius - m_pad / 2, baseY + 1);

      // HACK: Using transform breaks `click` handling!
      // HACK: BUT it seems to fix the "jump on draw" issue
      // this.gStickyButtons.transform({ translate: [baseX - badgeXOffset - badgeRadius, baseY + m_pad / 2] });


      // WORKING (initial, but not secondary)
      // this.gStickyButtons.move(baseX - badgeXOffset * 2, baseY);

      // HACK Move them all manually?
      // PROBLEM: each refresh ends up moving everyintg?
      // this.gStickyButtons.transform({ translate: [baseX - badgeXOffset * 2, baseY] });
      // this.gStickyButtons.unreadSelected.transform({ translate: [baseX - badgeXOffset * 2, baseY] }); // always move in case evlink badges change

      // -- move sticky notes BEDFORE moving gBadges for more predictable right-justified layout
      this.gBadges.move(baseX - this.gStickyButtons.bbox().w - evlinkBadgesOffsetX + m_pad / 2, baseY + 4);

      // ORIG sticky on right
      // this.gStickyButtons.move(baseX + xx - this.gStickyButtons.bbox().w - m_pad, baseY); // always move in case evlink badges change
    }

    // DEPRECATED StickyNotes in favor of URCommentThreadMgr
    // -- adjust for width of vprop
    // if (!isVMech) {
    //   let { w: bw } = this.gEvLinkBadges.bbox();
    //   this.gBadges.move(baseX - bw - this.gStickyButtons.bbox().w - m_pad * 2, baseY);
    // }
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
  const gBadge = root.group().click(onClick);
  gBadge.gRect = gBadge.rect(badgeRadius * 1.75, badgeRadius).radius(badgeRadius / 2).fill('#4db6ac');
  gBadge.gRect.attr({ cursor: 'pointer' });

  // ORIG circle badge
  // gBadge.gCircle = gBadge.circle(radius).fill('#4db6ac');
  // gBadge.gCircle.attr({ cursor: 'pointer' });

  gBadge.gLabel = gBadge
    .text(evlink.numberLabel)
    .font({ fill: '#fff', size: '12px', anchor: 'middle' })
    .dmove(badgeRadius / 2, badgeRadius / 2 + 4)
    .attr({ cursor: 'pointer' });

  // gBadge.gRating = VBadge.SVGRating(evlink, gBadge).move(
  //   1 + (3 - Math.max(1, Math.abs(evlink.rating))) * 4, // always shift at least 1 symbol, since no rating is 0
  //   radius + 1
  // );

  gBadge.gRating = VBadge.SVGRating(evlink, gBadge)
    .transform({ translate: [badgeRadius * 0.9, 4.5] });
  //   .dmove(
  //   radius * 0.9, // always shift at least 1 symbol, since no rating is 0
  //   4.5
  // );

  return gBadge;
};

/// SVGRating  ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Creates and returns the rating emoji icon for a badge
 */
VBadge.SVGRating = (evlink, gBadge) => {
  const rating = evlink.rating;
  const gRatings = gBadge.group();
  // gRatings.clear(); // reVIEW this i not necessary either

  // this works as a tecnhique to transform groups, but it's not
  // necessary here, and more important, we want to leave the
  // rating transformation to the SVGEvLink parent
  // gRatings.transform({ translate: [-1.25, 4.5] });

  gRatings.group()
    .circle(18).fill('#fff');

  // REVIEW: transform 0,0 is redundant
  // .circle(18).fill('#fff').transform({ translate: [0, 0] });
  // .circle(18).fill('#fff').transform({ translate: [2, 1.5] });

  gRatings.group()
    .use(SVGSYMBOLS.get('ratingsAgreeStrongly'))
    .scale(1)
    // REVIEW: `draw` and `transform` both cause repeated draw moves
    // REVIEW: Where should the draw routine update?`
    .transform({ translate: [-1, -1] });
  // .dmove(-1.5, -1.5);

  return gRatings;
};
// ORIG +/- RATING
//
// /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// /**
//  *  Creates and returns the rating icon for a badge
//  */
// VBadge.SVGRating = (evlink, gBadge) => {
//   const rating = evlink.rating;
//   let gRatings = gBadge.gRatings || gBadge.group(); // use existing group if it exists
//   gRatings.clear();
//   if (rating > 0) {
//     // positive
//     for (let i = 0; i < rating; i++) {
//       gRatings
//         .use(SVGSYMBOLS.get('ratingsPositive'))
//         .dmove(i * (5 + m_pad / 2), 0)
//         .scale(0.4);
//     }
//   } else if (rating < 0) {
//     // negative
//     for (let i = 0; i < -rating; i++) {
//       gRatings
//         .use(SVGSYMBOLS.get('ratingsNegative'))
//         .dmove(i * (5 + m_pad / 2), 0)
//         .scale(0.4);
//     }
//   } else {
//     // Not Rated
//     gRatings
//       .use(SVGSYMBOLS.get('ratingsNeutral'))
//       .move(m_pad / 2 - 1, 0)
//       .scale(0.4);
//   }

//   return gRatings;
// };

/// SVGStickyButton  //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Creates and returns a sticky button group object with three buttons to turn on/off
 *
 *  Click Events
 *  VProp's drag handler prevents click and mouseup events from propagating
 *  down to the gStickyButtons group.
 */
VBadge.SVGStickyButton = (vparent, cref, x, y) => {
  const onClick = customEvent => {
    let e = customEvent.detail.event || customEvent; // class-vprop-dragdrop sends custom events, but vmech sends regular mouse events.
    e.preventDefault();
    e.stopPropagation();
    if (DBG) console.log(`${e.target} clicked e=${e}`);

    // special handling for mechs
    // mech.id is actually a pathid, not the PMCData (db) id.
    // We want comments to reference the db id so that they are unique and persistent
    // e.g. when a mech is reversed, the id remains the same
    // e.g. when a mech is deleted, the id is deleted, so if a new mech with the same pathid
    //      is created, the comment isn't pulled up again.

    // DEPRECATED StickyNotes in favor of URCommentThreadMgr
    // const id = VBadge.isVMech ? vparent.data.id : vparent.id;
    // UR.Publish('STICKY_OPEN', {
    //   refId: id,
    //   x: e.clientX,
    //   y: e.clientY
    // });

    UR.Publish('CTHREADMGR_THREAD_OPEN', { cref, position: { x: e.clientX, y: e.clientY } });
  };

  // create vbadge sub elements
  let gStickyButtons = vparent.gRoot
    .group()
    .move(x, y)
    .attr({
      id: 'gStickyNoteBtn',
      cursor: 'pointer'
    })
    .click(onClick);

  // Create SVG Icons

  // REVIEW: Try drawing ONCE

  // URComment
  // const scale = 1.6;
  // gStickyButtons.unread = gStickyButtons.group().use(SVGSYMBOLS.get('commentUnread')).scale(scale);
  // gStickyButtons.read = gStickyButtons.group().use(SVGSYMBOLS.get('commentRead')).scale(scale);
  // gStickyButtons.unreadSelected = gStickyButtons
  //   .group()
  //   .use(SVGSYMBOLS.get('commentUnreadSelected'))
  //   .scale(scale);
  // gStickyButtons.readSelected = gStickyButtons
  //   .group()
  //   .use(SVGSYMBOLS.get('commentReadSelected'))
  //   .scale(scale);

  // gStickyButtons.gLabel = gStickyButtons
  //   .text('-') // BUG: If text is empty, dragging seeems to lead to a race condition
  //   .font({ fill: COLOR.COMMENT_DARK, size: '12px', anchor: 'middle' })
  //   .dmove(5.5, 10)
  //   // .transform({ translate: [5.5, 10] }) // m_minHeight / 4, m_minHeight / 3)
  //   .attr({ cursor: 'pointer' });

  // DEPRECATED StickyNotes in favor of URCommentThreadMgr
  // gStickyButtons.chat = gStickyButtons.group().use(SVGSYMBOLS.get('chatIcon'));
  // gStickyButtons.chatBubble = gStickyButtons.group().use(SVGSYMBOLS.get('chatBubble'));
  // gStickyButtons.chatBubbleOutline = gStickyButtons
  //   .group()
  //   .use(SVGSYMBOLS.get('chatBubbleOutline'));

  return gStickyButtons;
};

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default VBadge;
