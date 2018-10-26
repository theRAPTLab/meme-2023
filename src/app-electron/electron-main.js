// debugging convenienece
const log = console.log.bind(console);
// Import parts of electron to use
const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

log(`MEME/ELECTRON-MAIN PROCESS STARTED (${__filename})`);

// webpack will be used to compile and serve the app
// first make it work in development mode
// which can be detected from the environment
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const memeConfig = require('../../config/webpack.memeweb.config.js');
const wdsConfig = require('../../config/wds.webapp.config.js');

log(`- starting webpack compiler programmatically`);

// run webpack!
const compiler = webpack(memeConfig, (err, stats) => {
  // error handling
  if (err) {
    log('\n*** WEBPACK ERROR ***');
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return;
  }
  const info = stats.toJson();

  if (stats.hasErrors()) {
    log('\n*** LAST WEBPACK STAT ERROR ***');
    console.log(info.errors.pop());
    return;
  }

  if (stats.hasWarnings()) {
    log('\n*** LAST WEBPACK STAT WARNINGS ***');
    console.log(info.warnings.pop());
    return;
  }

  // got this far? let's start the server
  const server = new WebpackDevServer(compiler, wdsConfig);
  const serverOptions = {
    contentBase: path.resolve(__dirname, '../dist/webapp'),
    port: 8080
  };
  log(`- running webapp-dev server programmatically from ${serverOptions.contentBase}`);
  log(`  on port ${serverOptions.port}`);
  server.listen(serverOptions.port);
  console.log(`\n\nDUMPING SERVER`, server);
});

// log(JSON.stringify(compiler.options));

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Keep a reference for dev mode
let dev = false;

if (
  process.defaultApp ||
  /[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
  /[\\/]electron[\\/]/.test(process.execPath)
) {
  dev = true;
}

// Temporary fix broken high-dpi scale factor on Windows (125% scaling)
// info: https://github.com/electron/electron/issues/9691
if (process.platform === 'win32') {
  app.commandLine.appendSwitch('high-dpi-support', 'true');
  app.commandLine.appendSwitch('force-device-scale-factor', '1');
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'electron-preload.js')
    }
  });

  // and load the index.html of the app.
  let indexPath;

  if (dev && process.argv.indexOf('--noDevServer') === -1) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'electron-index.html',
      slashes: true
    });
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'electron-index.html'),
      slashes: true
    });
  }

  indexPath = url.format({
    protocol: 'file:',
    pathname: path.join(__dirname, 'electron-index.html'),
    slashes: true
  });
  mainWindow.loadURL(indexPath);

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Open the DevTools automatically if developing
    if (dev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

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
