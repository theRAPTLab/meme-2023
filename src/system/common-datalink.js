/* eslint-disable func-names */
/* eslint-disable no-param-reassign */
/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

    URSYS DATALINK CLASS

    The URSYS DATALINK (UDATA) class represents a connection to the URSYS
    event messaging system. Instances are created with URSYS.NewDataLink()
    by user code. URSYS libs use this class directly.

    Each UNODE has a unique URSYS_ID (the UID) which represents its
    local address. Combined with the device UADDR, this makes every UNODE
    on the network addressable.

    * UNODES can get and set global state objects
    * UNODES can subscribe to state change events
    * UNODES can register listeners for a named message
    * UNODES can send broadcast to all listeners
    * UNODES can call listeners and receive data

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// NOTE: This module uses the COMMONJS module format for compatibility
// between node and browser-side Javascript.
const Messager = require('./common-messager');
const URNET = require('./ur-network').default; // workaround for require

/** implements endpoints for talking to the URSYS network
 * @module URDataLink
 */
/// DEBUGGING /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = { create: true, send: true, return: false, register: false };
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const BAD_NAME = 'name parameter must be a string';
const BAD_UID = 'unexpected non-unique UID';
const PR = 'UDATA:';

/// NODE MANAGEMENT ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const UNODE = new Map(); // URSYS connector node map (local)
const MAX_UNODES = 100;
let UNODE_COUNTER = 0; // URSYS connector node id counter
function m_GetUniqueId() {
  const id = `${++UNODE_COUNTER}`.padStart(3, '0');
  if (UNODE_COUNTER > MAX_UNODES) console.warn('Unexpectedly high number of UDATA nodes created!');
  return `UDL${id}`;
}

/// GLOBAL MESSAGES ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let MESSAGER = new Messager(); // all datalinks share a common messager

/// URSYS NODE CLASS /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Instances of this class can register/unregister message handlers and also
    send messages. Constructor receives an owner, which is inspected for
    properties to determine how to classify the created messager for debugging
    purposes
    @memberof URDataLink
*/
class URDataLink {
  /** constructor
   * @param {object} owner the class instance or code module object
   * @param {string} owner.name code module name set manually
   * @param {string} [owner.constructor.name] for classes
   * @param {string} optName optional name to use instead owner.name or owner.constructor.name
   */
  constructor(name) {
    if (name !== undefined && typeof name !== 'string') {
      throw Error(BAD_NAME);
    }
    // bind function
    this.UID = this.UID.bind(this);
    this.Name = this.Name.bind(this);
    this.UADDR = this.UADDR.bind(this);
    this.Subscribe = this.Subscribe.bind(this);
    this.Unsubscribe = this.Unsubscribe.bind(this);
    this.Call = this.Call.bind(this);
    this.Publish = this.Publish.bind(this);
    this.Signal = this.Signal.bind(this);
    this.LocalCall = this.LocalCall.bind(this);
    this.LocalPublish = this.LocalPublish.bind(this);
    this.LocalSignal = this.LocalSignal.bind(this);
    this.NetCall = this.NetCall.bind(this);
    this.NetPublish = this.NetPublish.bind(this);
    this.NetSignal = this.NetSignal.bind(this);

    // generate and save unique id
    this.uid = m_GetUniqueId();
    this.name = name;
    // save module in the global module list
    if (UNODE.has(this.uid)) throw Error(BAD_UID + this.uid);
    if (DBG.create) console.log(PR, `URDataLink ${this.uid} created (${this.name})`);
    UNODE.set(this.uid, this);
  }

  /// UNIQUE URSYS ID for local application
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /// this is used to differentiate sources of events so they don't echo
  UID() {
    return this.uid;
  }

  Name() {
    return this.name;
  }

  UADDR() {
    return URNET.SocketUADDR();
  }

  /// MESSAGES ////////////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /// mesgName is a string, and is an official event that's defined by the
  /// subclasser of UnisysNode
  Subscribe(mesgName, listener) {
    // uid is "source uid" of subscribing object, to avoid reflection
    // if the subscribing object is also the originating state changer
    if (DBG.register) console.log(`${this.uid} _${PR} `, `${this.name} handler added[${mesgName}]`);
    MESSAGER.Subscribe(mesgName, listener, { handlerUID: this.UID() });
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /// variation of Subscribe that receives from remotes as well
  NetSubscribe(mesgName, listener) {
    // uid is "source uid" of subscribing object, to avoid reflection
    // if the subscribing object is also the originating state changer
    if (DBG.register)
      console.log(`${this.uid} _${PR} `, `${this.name} nethandler added[${mesgName}]`);
    MESSAGER.Subscribe(mesgName, listener, { fromNet: true, handlerUID: this.UID() });
  }

  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Unsubscribe(mesgName, listener) {
    if (DBG.register)
      console.log(`${this.uid} _${PR} `, `${this.name} handler removed[${mesgName}]`);
    MESSAGER.Unsubscribe(mesgName, listener);
  }

  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /*/ UDATA wraps Messager.Call(), which returns an array of promises.
      The UDATA version of Call() manages the promises, and returns a
  /*/
  async Call(mesgName, inData = {}, options = {}) {
    options = Object.assign(options, { type: 'mcall' });
    if (DBG.send) {
      let status = '';
      if (options.fromNet) {
        status += ' REMOTE_CALL';
      } else {
        if (!options.toNet) status += 'NO_NET ';
        if (!options.toLocal) status += 'NO_LOCAL';
        if (!(options.toLocal || options.toNet)) status = 'ERR NO LOCAL OR NET';
      }
      console.log(`${this.uid} _${PR} `, '** DATALINK CALL ASYNC', mesgName, status);
    }
    // uid is "source uid" of subscribing object, to avoid reflection
    // if the subscribing object is also the originating state changer
    options.srcUID = this.UID();
    let promises = MESSAGER.Call(mesgName, inData, options);
    /// MAGICAL ASYNC/AWAIT BLOCK ///////
    if (DBG.send) console.log(`${this.uid} _${PR} `, '** awaiting...', promises);
    let resArray = await Promise.all(promises);
    if (DBG.send) console.log(`${this.uid} _${PR} `, '** promise fulfilled!', mesgName);
    /// END MAGICAL ASYNC/AWAIT BLOCK ///
    let resObj = Object.assign({}, ...resArray);
    if (DBG.return)
      console.log(`${this.uid} _${PR} `, `[${mesgName}]returned`, JSON.stringify(resObj));
    return resObj;
  }

  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /*/ Sends the data to all message implementors UNLESS it is originating from
      the same UDATA instance (avoid echoing back to self)
  /*/
  Publish(mesgName, inData = {}, options = {}) {
    if (typeof inData === 'function')
      throw Error('did you intend to use Subscribe() instead of Publish()?');
    if (DBG.send) console.log(`${this.uid} _${PR} `, '** DATALINK SEND', mesgName);
    options = Object.assign(options, { type: 'msend' });
    // uid is "source uid" of subscribing object, to avoid reflection
    // if the subscribing object is also the originating state changer
    options.srcUID = this.UID();
    // uid is "source uid" of subscribing object, to avoid reflection
    // if the subscribing object is also the originating state changer
    MESSAGER.Publish(mesgName, inData, options);
  }

  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /*/ Sends the data to all message implementors, irregardless of origin.
  /*/
  Signal(mesgName, inData = {}, options = {}) {
    options = Object.assign(options, { type: 'msig' });
    MESSAGER.Signal(mesgName, inData, options);
  }

  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /*/ version of Call that forces local-only calls
  /*/
  LocalCall(mesgName, inData, options = {}) {
    options = Object.assign(options, { type: 'mcall' });
    options.toLocal = true;
    options.toNet = false;
    return this.Call(mesgName, inData, options);
  }

  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /*/ version of Send that force local-only calls
  /*/
  LocalPublish(mesgName, inData, options = {}) {
    options = Object.assign(options, { type: 'msend' });
    options.toLocal = true;
    options.toNet = false;
    this.Publish(mesgName, inData, options);
  }

  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /*/ version of Send that force local-only calls
  /*/
  LocalSignal(mesgName, inData, options = {}) {
    options = Object.assign(options, { type: 'msig' });
    options.toLocal = true;
    options.toNet = false;
    this.Signal(mesgName, inData, options);
  }

  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /*/ version of Call that forces network-only calls
  /*/
  NetCall(mesgName, inData, options = {}) {
    options = Object.assign(options, { type: 'mcall' });
    options.toLocal = false;
    options.toNet = true;
    return this.Call(mesgName, inData, options);
  }

  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /*/ version of Send that force network-only calls
  /*/
  NetPublish(mesgName, inData, options = {}) {
    options = Object.assign(options, { type: 'msend' });
    options.toLocal = false;
    options.toNet = true;
    this.Publish(mesgName, inData, options);
  }

  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /*/ version of Signal that forces network-only signal
  /*/
  NetSignal(mesgName, inData, options = {}) {
    options.toLocal = false;
    options.toNet = true;
    this.Signal(mesgName, inData, options);
  }

  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  NullCallback() {
    if (DBG.send) console.log(`${this.uid} _${PR} `, 'null_callback', this.UID());
  }

  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  PromiseRegisterMessages(messages = []) {
    if (URNET.IsStandaloneMode()) {
      console.warn(PR, 'STANDALONE MODE: RegisterMessagesPromise() suppressed!');
      return Promise.resolve();
    }
    if (messages.length) {
      try {
        messages = URDataLink.ValidateMessageNames(messages);
      } catch (e) {
        console.error(e);
      }
    } else {
      messages = URDataLink.NetMessageNames();
    }
    return this.Call('SRV_REG_HANDLERS', { messages });
  }
} // class UnisysNode

/// STATIC CLASS METHODS //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Return list of all registered Subscriber Message Names
 */
URDataLink.MessageNames = function() {
  return MESSAGER.MessageNames();
};
///
/** Return list of all registered NetSubscriber message names */
URDataLink.NetMessageNames = function() {
  return MESSAGER.NetMessageNames();
};

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ Filter any bad messages from the passed array of strings
/*/
URDataLink.ValidateMessageNames = function(msgs = []) {
  let valid = [];
  msgs.forEach(name => {
    if (MESSAGER.HasMessageName(name)) valid.push(name);
    else throw new Error(`ValidateMessageNames() found invalid message '${name}'`);
  });
  return valid;
};

/// EXPORT CLASS DEFINITION ///////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = URDataLink;
