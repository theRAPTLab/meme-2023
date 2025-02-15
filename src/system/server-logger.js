/* eslint-disable no-param-reassign */
/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  LOGGER

  - Use LOG.Write() to write to the log file directly from server
  - Server handles 'NET:SRV_LOG_EVENT' messages to write to the log file
  - set LOG_IDLE_INTERVAL to detect when a new log file should be created

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

const PATH = require('path');
const OS = require('os');
const FSE = require('fs-extra');
const Tracer = require('tracer');
const PROMPTS = require('./util/prompts');
const DATESTR = require('./util/datestring');
const PATHS = require('./common-paths').PATHS;

/// CONSTANTS & DECLARATIONS///////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PR = PROMPTS.Pad('LOGGER');
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const LOG_DELIMITER = '\t';
const LOG_DIR = PATHS.Log;

/// COLOR LOGGER (UNUSED) /////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const LOG_CONFIG = {
  format: '{{line}}  {{message}}',
  dateformat: 'HH:MM:ss.L',
  preprocess(data) {
    data.line = `C ${Number(data.line).zeroPad(4)}`;
  }
};
const LOGGER = Tracer.colorConsole(LOG_CONFIG);

/// FILE STREAMS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let fs_log = null; // filesystem
let fs_lastwrite = null; // date created
const LOG_IDLE_INTERVAL = 1000 * 60 * 60 * 4; // 4 hours
// const LOG_IDLE_INTERVAL = 1000 * 60; // 1 minute

/// HELPER METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** create a new log file in the log directory and update the fs_log stream
 *  pointe. also sets the creation date  */
function m_StartLogging() {
  // initialize event logger
  let dir = PATH.resolve(LOG_DIR);
  try {
    console.log(PR, `logging to ${dir}`);
    FSE.ensureDirSync(dir);
    let logname = `${DATESTR.DatedFilename('log')}.txt`;
    let pathname = `${dir}/${logname}`;
    fs_log = FSE.createWriteStream(pathname);
    fs_lastwrite = new Date();
    m_LogLine(
      `MEME APPSERVER SESSION LOG for ${DATESTR.DateStamp()} ${DATESTR.TimeStamp()}`
    );
    m_LogLine('---');
  } catch (err) {
    if (err) throw new Error(`could not make ${dir} directory`);
  }
}
///	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**	Log a standard system log message */
function m_LogLine(...args) {
  // if there is no open log file, create one
  if (!fs_log) m_StartLogging();
  // check if the log file is older than 24 hours
  const timeSince = new Date() - fs_lastwrite;
  if (timeSince > LOG_IDLE_INTERVAL) {
    // if the log file is older than LOG_IDLE_INTERVAL, create a new one
    fs_log.write(`--- Warning: closing log file due to excess idle time!\n`);
    fs_log.write(`--- A new log file will be created.\n`);
    fs_log.write(`--- (did you leave the server running overnight?)\n`);
    fs_log.end();
    m_StartLogging();
  }
  let out = `${DATESTR.TimeStamp()} `;
  let c = args.length;
  // arguments are delimited
  if (c) {
    for (let i = 0; i < c; i++) {
      if (i > 0) out += LOG_DELIMITER;
      out += args[i];
    }
  }
  out += '\n';
  fs_log.write(out);
  fs_lastwrite = new Date();
}

/// EXPORTED METHODS //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let LOG = {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API: Handle incoming log events */
LOG.PKT_LogEvent = pkt => {
  let { event, items } = pkt.Data();
  if (DBG) console.log(PR, pkt.Info(), event, ...items);
  m_LogLine(pkt.Info(), event || '-', ...items);
  return { OK: true };
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** API: Write to log as delimited arguments */
LOG.Write = m_LogLine;

/// EXPORT MODULE DEFINITION //////////////////////////////////////////////////
/// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
module.exports = LOG;
