/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\
\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// PRIVATE DECLARATIONS //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let RELOAD_CHECK = 0;
let RELOAD_TIMER = null;

/// PRIVATE HELPERS ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// PUBLIC METHODS ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ Force Reload if another module was navigated to and we want to ensure the
    entire browser was refreshed so only one set of app modules is loaded
/*/
const ForceReloadOnNavigation = () => {
  RELOAD_CHECK++;
  if (RELOAD_CHECK > 1) {
    console.warn(`SETTINGS: ForceReloadOnNavigation active. Reloading!`);
    if (RELOAD_TIMER) clearTimeout(RELOAD_TIMER);
    RELOAD_TIMER = setTimeout(() => {
      window.location.reload();
    }, 500);
  } else {
    console.warn(`SETTINGS: ForceReloadOnNavigation check OK`);
  }
};

/// INITIALIZATION ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export { ForceReloadOnNavigation };
