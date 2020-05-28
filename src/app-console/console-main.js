/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  ELECTRON MAIN PROCESS

  copied as-is from src/app-console

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/

// import appserver
// Import parts of electron to use
const { app, BrowserWindow, dialog, Menu, ipcMain } = require('electron');
const ip = require('ip');
const path = require('path');
const url = require('url');
const URSERVER = require('../system/server.js');
const PROMPTS = require('../system/util/prompts');

const AssetPath = asset => path.join(__dirname, 'static', asset);

const PR = PROMPTS.Pad('ElectronHost');
// this is available through electron remote in console.js
global.serverinfo = {
  main: `http://localhost:3000`,
  client: `http://${ip.address()}:3000`
};

// our modules
// const UR = require('../ur');

// log(JSON.stringify(compiler.options));

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Temporary fix broken high-dpi scale factor on Windows (125% scaling)
// info: https://github.com/electron/electron/issues/9691
if (process.platform === 'win32') {
  app.commandLine.appendSwitch('high-dpi-support', 'true');
  app.commandLine.appendSwitch('force-device-scale-factor', '1');
}

function createWindow() {
  // Create the browser window.
  console.log(`${PR} creating mainwindow with console-preload.js`);
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    webPreferences: {
      nodeIntegration: false, // 'true' enables nodejs features
      preload: path.join(__dirname, 'console-preload.js') // path.join is required
    }
  });

  // and load the index.html of the app.
  const pathname = path.resolve(__dirname, './console.html');
  const indexPath = url.format({
    protocol: 'file:',
    pathname,
    slashes: true
  });

  console.log(`${PR} loading ${path.basename(pathname)} into mainwindow`);
  mainWindow.loadURL(indexPath);

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    console.log(`${PR} displaying mainwindow`);
    mainWindow.show();
    mainWindow.webContents.openDevTools();
    // set application menu
    const application = {
      label: 'MEME',
      submenu: [
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    };
    const edit = {
      label: 'Edit',
      submenu: [
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          selector: 'copy:'
        }
      ]
    };
    const template = [application, edit];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));

    /// IPC HANDLERS //////////////////////////////////////////////////////////
    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    /** drag file to desktop
     */
    ipcMain.on('ondragstart', event => {
      filePath = AssetPath('data.json');
      console.log('main:ondragstart');
      event.sender.startDrag({
        file: filePath,
        icon: AssetPath('mzip-export-64.png')
      });
    });
    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    /** export file
     */
    ipcMain.on('onexport', event => {
      (async () => {
        const results = await dialog.showSaveDialog({
          filters: { extensions: '.mzip' },
          properties: { createDirectory: true }
        });
        console.log('results', results);
      })();
    });
    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    /** load file
     */
    ipcMain.on('onimport', event => {
      (async () => {
        const results = await dialog.showOpenDialog({
          filters: { extensions: '.mzip' },
          properties: ['dontAddToRecent']
        });
        console.log('results', results);
      })();
    });

    /// LAUNCH URSERVER ///////////////////////////////////////////////////////
    /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    return;
    URSERVER.Initialize({ memehost: 'electron' });
    URSERVER.StartNetwork();
    URSERVER.StartWebServer();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    console.log(`${PR} mainwindow closed\n\n`);
    mainWindow = null;
  });
}

/** TODO (2): Write a message receiver from console.js to get the
 *  drag/dropped "archive file" to pass to URSYS so it can
 *  call URSYS and re-initalize the server to load the archive file
 *  instead of the current database.
 *  see github.com/electron/electron/blob/v3.1.13/docs/tutorial/native-file-drag-drop.md

 *
 *  This message receiver may handle the "Export" function too,
 *  as defined by TODO (4).
 *  filesystem-specific stuff in here (as URSYS should be clean of
 *  It calls the appropriate URSYS API method AND handling the
 *  Electron and OS specific stuff other than node).
 *
 *  This message receiver has to send back an acknowledge that
 *  can be received by console.js so it can update any UI
 *  progress stuff
 */

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') { app.quit(); }
  app.quit();
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
