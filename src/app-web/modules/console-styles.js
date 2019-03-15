/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\
  used for console logging
\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// DECLARATIONS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const cssinfo = 'color:black;background-color:#ffdd99;padding:0 4px';
const cssdraw = 'color:white;background-color:green;padding:0 4px';
const cssdata = 'color:white;background-color:blue;padding:0 4px';
const cssblue = 'color:blue;';
const cssreset = 'color:auto;background-color:auto';
const cssreact = 'color:green;background-color:#ccffcc';

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
export { Q, cssinfo, cssdraw, cssdata, cssreact, cssblue, cssreset };
