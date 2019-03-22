/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\
  used for console logging
\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const cssinfo = 'color:#00f;background-color:#cdf;padding:0 4px';
const cssreact = 'color:#080;background-color:#cfc;padding:0 4px';
const cssalert = 'color:black;background-color:#ffdd99;padding:0 4px';
const cssdraw = 'color:white;background-color:green;padding:0 4px';
const cssdata = 'color:white;background-color:blue;padding:0 4px';
const cssreset = 'color:auto;background-color:auto';
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const cssblue = 'color:blue;';

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function Q(str, delim = '[') {
  let end;
  switch (delim) {
    case '[':
      end = ']';
      break;
    case "'":
      end = "'";
      break;
    case '<':
      end = '>';
      break;
    default:
      delim = '???';
      end = '???';
      break;
  }
  return `${delim}${str}${end}`;
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export { Q, cssinfo, cssdraw, cssdata, cssreact, cssblue, cssreset, cssalert };
