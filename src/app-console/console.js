/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
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

NOTE: This is written for Electron V3, so ipcRenderer is different
https://github.com/electron/electron/blob/v3.1.13/docs/api/ipc-renderer.md

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ///////////////////////////////////////////*/

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
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
  exportZone: {
    minWidth: 200,
    minHeight: 50,
    backgroundColor: '#b9efb8',
    border: '2px dashed #b9efb8',
    padding: '10px'
  },
  importZone: {
    minWidth: 200,
    minHeight: 50,
    backgroundColor: '#d6bfe8',
    border: '2px dashed #d6bfe8',
    padding: '10px'
  },
  dropHilight: {
    border: '2px dashed rgba(255,0,0,1)'
  }
});

const App = withStyles(styles)(props => {
  const { classes } = props;
  const { main, client } = remote.getGlobal('serverinfo');
  const [dragExport, setDragExport] = useState(false);

  const doDragToDesktop = event => {
    console.log('dragtodesktop');
    event.preventDefault();
    setDragExport(true);
    ipcRenderer.sendSync('dragtodesktop');
    console.log('dragtodesktop end');
    setDragExport(false);
  };
  const doExportFile = event => {
    event.preventDefault();
    ipcRenderer.send('onexport');
  };
  const doDragFromDesktop = event => {
    event.preventDefault();
    ipcRenderer.send('dragfromdesktop');
  };
  const doImportFile = event => {
    event.preventDefault();
    ipcRenderer.send('onimport');
  };
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
      <div className={classes.exportZone}>
        <img
          src={AssetPath('mzip-export.png')}
          width="128px"
          onClick={doExportFile}
          onDragStart={doDragToDesktop}
          draggable
        />
        <div>
          MAKE MZIP ARCHIVE
          <br />
          click or drag to desktop
        </div>
      </div>
      <div className={classes.importZone}>
        <img
          src={AssetPath('mzip-import.png')}
          width="128px"
          onClick={doImportFile}
          onDragOver={event => {
            console.log('dragover');
            if (!dragExport) event.currentTarget.classList.add(classes.dropHilight);
            event.preventDefault();
          }}
          onDragStart={event => {
            event.preventDefault();
          }}
          onDrop={event => {
            event.preventDefault();
            if (dragExport) {
              console.log('ignoring dragexport');
              return;
            }
            console.log('dropped item');
            // // this is for text only
            // const data = event.dataTransfer.getData('text');
            // event.target.textContent = data;
            event.currentTarget.classList.remove(classes.dropHilight);
            // Use DataTransfer interface to access the file(s)
            for (var i = 0; i < event.dataTransfer.files.length; i++) {
              var file = event.dataTransfer.files[i];
              console.log('... file[' + i + '].name = ' + file.name);
              console.log(file);
            }
          }}
          onDragLeave={event => {
            event.currentTarget.classList.remove(classes.dropHilight);
            event.preventDefault();
          }}
        />
        <br />
        LOAD MZIP ARCHIVE
        <br />
        click or drag from desktop
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
