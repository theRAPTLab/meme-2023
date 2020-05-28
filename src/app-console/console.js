/*///////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

console.js - main webpack entrypoint for Electron-based console/server

This file is loaded into the Electron MainWindow by console.html.
It is executing in an Electron (Chrome) Render Process.

The source files are in src/app-console and are transformed by webpack into
the built/console directory. See config/webpack.console.config.js invoked from
package.json scripts

NOTE: The MainWindow runs without Node integration turned on for security.
NodeJS features (like access to the filesystem) must be made through 'console-preload.js'
and accessed through the 'window' object.

NOTE: all code from this point on are using WEBPACK's require, not NodeJS. Remember this
is client-side javascript code, with Electron/Node enhancements!

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ///////////////////////////////////////////*/

import React from 'react';
import ReactDOM from 'react-dom';
import AppBar from '@material-ui/core/AppBar';
import Menu from '@material-ui/core/Menu';
import CssBaseline from '@material-ui/core/CssBaseline';
import Card from '@material-ui/core/Card';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArchiveIcon from '@material-ui/icons/Archive';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import { ipcRenderer } from 'electron';
import path from 'path';

const remote = require('electron').remote;
const AssetPath = asset => path.join(__static, asset);

const styles = theme => ({
  // theme will have properties for dynamic style definition
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  dragOut: {
    minWidth: 200,
    minHeight: 50,
    backgroundColor: '#ddf',
    border: '2px dashed #ddf',
    padding: '10px'
  },
  dropZone: {
    minWidth: 200,
    minHeight: 50,
    backgroundColor: '#dfd',
    border: '2px dashed #dfd',
    padding: '10px'
  },
  dropHilight: {
    border: '2px dashed red'
  }
});

const sendItem = event => {
  event.preventDefault();
  console.log('is this sending???');
  ipcRenderer.send('ondragstart');
};

const sendExport = event => {
  event.preventDefault();
  console.log('is this exporting???');
  console.log(event);
  ipcRenderer.send('onexport');
};

const droppedItem = ev => {
  console.log('is this dropping???');
  ev.preventDefault();
  // // this is for text only
  // const data = event.dataTransfer.getData('text');
  // event.target.textContent = data;

  // Use DataTransfer interface to access the file(s)
  for (var i = 0; i < ev.dataTransfer.files.length; i++) {
    var file = ev.dataTransfer.files[i];
    console.log('... file[' + i + '].name = ' + file.name);
    console.log(file);
  }
  // file props: name, path, size, type, lastModified, lastModifiedDate
};

const App = withStyles(styles)(props => {
  const { classes } = props;
  const { main, client } = remote.getGlobal('serverinfo');

  /** TODO (1): Write some kind of DRAG AND DROP handler that will
   *  grab the filename and pass it to console-main.js
   *  see github.com/electron/electron/blob/v3.1.13/docs/tutorial/native-file-drag-drop.md
   */

  /** TODO (5): Add an EXPORT button that sends a message to console-main.js
   *  telling it to save a file, and also be informed when the operation
   *  completes.
   */
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="h4" color="inherit">
            {PACKAGE_TITLE} {PACKAGE_VERSION}
          </Typography>
        </Toolbar>
      </AppBar>
      <Paper style={{ padding: '0.5em 24px', borderRadius: 0 }}>
        <Typography>{PACKAGE_DESCRIPTION}</Typography>
      </Paper>
      <Typography variant="h6" style={{ padding: '1.5em 0 0 24px' }}>
        Connection Instructions:
      </Typography>
      <Typography style={{ padding: '1em 0 2em 24px' }}>
        Admin: open <b>{main}/#/admin</b>
        <br />
        Students: open <b>{client}</b>
      </Typography>
      <div className={classes.dragOut}>
        <img
          src={AssetPath('mzip-export.png')}
          width="128px"
          onClick={sendExport}
          onDragStart={sendItem}
          draggable
        />
        <div>
          MAKE MZIP ARCHIVE
          <br />
          drag to folder to archive
        </div>
      </div>
      <div
        className={classes.dropZone}
        onDrop={droppedItem}
        onDragEnter={event => {
          console.log('dragenter');
          event.target.classList.add(classes.dropHilight);
          event.preventDefault();
        }}
        onDragLeave={event => {
          console.log('dragleave');
          event.target.classList.remove(classes.dropHilight);
          event.preventDefault();
        }}
        onDragEnd={event => {
          console.log('dragend');
          event.preventDefault();
        }}
      >
        DROP MZIP ARCHIVE HERE
      </div>
    </div>
  );
});

// console.warn(
//   '\nMEME DEVS:\nYou can ignore the Security Warning below, as it is to scare you into reading about Electron security\n'
// );
ReactDOM.render(<App />, document.querySelector('#app-console'), () => {
  console.log('Loaded Electron MainWindow Entry Point @ console.js');
  console.log('Starting console-app modules');
});
