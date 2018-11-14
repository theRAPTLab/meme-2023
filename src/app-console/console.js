/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

console.js - main webpack entrypoint for Electron-based console/server

This file is loaded into the Electron MainWindow by console.html.
It is executing in an Electron (Chrome) Render Process.

The source files are in src/app-console and are transformed by webpack into
the dist/console directory. See config/webpack.console.config.js invoked from
package.json scripts

NOTE: The MainWindow runs without Node integration turned on for security.
NodeJS features (like access to the filesystem) must be made through 'console-preload.js'
and accessed through the 'window' object.

NOTE: all code from this point on are using WEBPACK's require, not NodeJS. Remember this
is client-side javascript code, with Electron/Node enhancements!

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/

console.log('Loaded Electron MainWindow Entry Point @ console.js');

console.warn(
  '\nMEME DEVS:\nYou can ignore the Security Warning below, as it is to scare you into reading about Electron security\n'
);
