import DEFAULTS from './defaults';
import ADM from './adm-data';
import DATA from './pmc-data';
import UR from '../../system/ursys';

const { VPROP, PAD } = DEFAULTS;

/// MODULE DECLARATION ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const m_minWidth = VPROP.MIN_WIDTH;
const m_minHeight = VPROP.MIN_HEIGHT;
const m_pad = 5; // was PAD.MIN, but that's too big.  5 works better

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
   * @param {object} vparent Parent component: class-vprop or class-vmech
   */
  constructor(vparent) {
    // Init Data
    this.evlinks = [];
    this.comments = [];

    // create our own groups
    this.gBadges = vparent.gRoot.group().attr('id', 'gBadges');
    this.gEvLinkBadges = this.gBadges.group().attr('id', 'gEvLinkBadges');
    // this.gStickyButtons will be created below in Draw()

    // FIXME / REVIEW
    // `this` in `OnClick()` method seems to refer to a SVG group object.
    // Passing `this` explicitly here seems to fix that.
    this.gBadges.click(e => {
      this.OnClick(e, this);
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

    // Which component got the click?
    const { offsetX, offsetY } = mouseEvent;
    if (this.gStickyButtons && this.gStickyButtons.inside(offsetX, offsetY)) {
      // StickyButton got the click
      // Handle as click and pass to VBadge
      this.gStickyButtons.fire('click', { event: mouseEvent });
    } else if (this.evlinks) {
      // An Evidence Link Badge go tthe click
      // Figure out which badge
      this.gEvLinkBadges.children().forEach(gBadge => {
        if (gBadge.inside(offsetX, offsetY)) {
          gBadge.fire('click', { event: mouseEvent });
        }
      });
    } else {
      console.error(PKG, 'OnClick could not find click object');
    }
  }

  /**
   *  Update is called by VProp/VMech before Draw
   * @param {*} vparent class-vprop or class-vmech
   */
  Update(vparent) {
    let id = vparent.id;
    this.evlinks = DATA.PropEvidence(id);
  }

  /**
   *  Draw is called by VProp or VMech
   * @param {*} vparent class-vprop or class-vmech
   */
  Draw(vparent) {
    // draw badges from left to right

    // FIXME: NOTE this won't work for VMechs
    const visBG = vparent.visBG; // position of the base prop rectangle
    const x = visBG.x();
    const y = visBG.y();
    const baseX = x + m_minWidth - m_pad;
    const baseY = y + m_pad * 2;
    let xx = 0;

    // draw evidence link badges
    // -- first clear the group in case objects have changed
    this.gEvLinkBadges.clear();
    if (this.evlinks) {
      // First sort evlinks by number
      const evlinks = this.evlinks.sort((a, b) => {
        return a.number > b.number ? 1 : -1;
      });
      // Then draw each badge
      evlinks.forEach(evlink => {
        const badge = VBadge.SVGEvLink(evlink, vparent);
        this.gEvLinkBadges.add(badge);
        badge.move(baseX + badge.x() + xx, baseY);
        xx += badge.width() + m_pad;
      });
    }

    // draw sticky note button if there are comments
    // Keep the sticky Note button around so we don't have to re-create it with every draw
    if (!this.gStickyButtons) {
      this.gStickyButtons = VBadge.SVGStickyButton(vparent, baseX + xx, baseY);
      this.gBadges.add(this.gStickyButtons);
    }
    this.gStickyButtons.move(baseX + xx, baseY); // always move in case evlink badges change

    // Set Current Read/Unreaad status
    const comments = DATA.Comment(vparent.id);
    const author = ADM.GetSelectedStudentId(); // FIXME: This should read from session
    const hasNoComments = comments ? comments.length < 1 : true;
    const hasUnreadComments = comments.find(comment => {
      return comment.readBy ? !comment.readBy.includes(author) : false;
    });
    if (hasNoComments) {
      this.gStickyButtons.chat.attr('display', 'none');
      this.gStickyButtons.chatBubble.attr('display', 'none');
      this.gStickyButtons.chatBubbleOutline.attr('display', 'none'); // don't show outline ot keep interface clean
    } else if (hasUnreadComments) {
      this.gStickyButtons.chat.attr('display', 'inline');
      this.gStickyButtons.chatBubble.attr('display', 'none');
      this.gStickyButtons.chatBubbleOutline.attr('display', 'none');
    } else {
      // all comments read
      this.gStickyButtons.chat.attr('display', 'none');
      this.gStickyButtons.chatBubble.attr('display', 'inline');
      this.gStickyButtons.chatBubbleOutline.attr('display', 'none');
    }

    // adjust for width
    let { w: bw } = this.gEvLinkBadges.bbox();
    this.gBadges.move(baseX - bw, baseY);
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
  const radius = m_minHeight - m_pad / 2;

  const onClick = customEvent => {
    const e = customEvent.detail.event;
    e.preventDefault();
    e.stopPropagation();
    if (DBG) console.log(`${e.target} clicked`);
    UR.Publish('SHOW_EVIDENCE_LINK', { evId: evlink.evId, rsrcId: evlink.rsrcId });
  };

  // create vbadge sub elements
  const gBadge = root.group().click(onClick);
  gBadge.gCircle = gBadge.circle(radius).fill('#4db6ac');

  gBadge.gLabel = gBadge
    .text(evlink.number)
    .font({ fill: '#fff', size: '1em', anchor: 'middle' })
    .move(m_pad, m_pad / 2);

  //   gBadge.gRating = gBadge
  //     .text('+++')
  //     .font({ fill: '#f57f17', size: '1em', weight: 'bold' })
  // //    .move(radius, radius * 2 + m_pad);

  return gBadge;
};

/// SVGStickyButton  //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 *  Creates and returns a sticky button group object with three buttons to turn on/off
 * 
  // Hack in a chat symbol for now from Material UI icons.
  // 1. Download
  //    from https://material.io/resources/icons/?icon=chat&style=baseline
  //    https://material.io/resources/icons/static/icons/baseline-chat_bubble-24px.svg
  //    https://material.io/resources/icons/static/icons/baseline-chat_bubble_outline-24px.svg
  // 2. Add color via `fill` to the first element (leave the second path fill at none)
  // 3. Copy the svg `path` and put it in a group.

  // Alternative techniques for rendering svg icons
      //
      // Old technique using `use` -- symbol is drawn AFTER load in the wrong position
      // .use('chatIcon', '../static/chat.svg') // This works, but the symbol is not drawn in the right place until after the load
      //
      // Old technique using `svg` -- the 'chatIcon' id is not accessible via SVGjs
      // .svg(
      //   '<g id="chatIcon" display="none" width="24" height="24" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" fill = "#f60" /><path d="M0 0h24v24H0z" fill="none" /></g>'
      // )
 */
VBadge.SVGStickyButton = (vparent, x, y) => {

  const onClick = customEvent => {
    let e = customEvent.detail.event;
    e.preventDefault();
    e.stopPropagation();
    if (DBG) console.log(`${e.target} clicked e=${e}`);
    UR.Publish('STICKY:OPEN', {
      parentId: vparent.id,
      parentType: 'propmech',
      x: e.clientX,
      y: e.clientY
    });
  };

  // create vbadge sub elements
  let gStickyButtons = vparent.gRoot
    .group()
    .move(x, y)
    .click(onClick);

  // Create SVG Icons
  // using svgjs path allows us to directly manipulate the group for showing/hiding
  // where the `svg` and `use` methods above end up embedding the elements deep in the group structure.
  let chat = gStickyButtons.group();
  chat
    .path(
      'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z'
    )
    .fill('#f60');
  chat.path('M0 0h24v24H0z').fill('none');
  gStickyButtons.chat = chat;

  let chatBubble = gStickyButtons.group();
  chatBubble
    .path('M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z')
    .fill('#f60');
  chatBubble.path('M0 0h24v24H0z').fill('none');
  gStickyButtons.chatBubble = chatBubble;

  let chatBubbleOutline = gStickyButtons.group();
  chatBubbleOutline.path('M0 0h24v24H0V0z').fill('none');
  chatBubbleOutline
    .path('M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z')
    .fill('#f60');
  gStickyButtons.chatBubbleOutline = chatBubbleOutline;

  return gStickyButtons;
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default VBadge;
