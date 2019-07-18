#!/usr/bin/env node

/*/
to pass a parameter via npm run script, you have to use -- as in
npm run myscript -- --myoptions=something
alternatively you'll just write your own script that does it
/*/
const path = require('path');
const ip = require('ip');
const URSERVER = require('./src/system/server.js');

let shell;
let argv;
let MTERM;
const ESC = '\x1b';
try {
  /* eslint-disable global-require */
  shell = require('shelljs');
  argv = require('minimist')(process.argv.slice(1));
  MTERM = require('./src/cli/meme-term');
  /* eslint-enable global-require */
} catch (e) {
  const { code } = e;
  console.log(`\n${ESC}[30;41m NODE RUNTIME ERROR: ${code} ${ESC}[0m`);
  console.log(`\nIf you ran 'clean:all', you need to execute the command...\n`);
  console.log(`  ${ESC}[1mnpm ci${ESC}[0m`);
  console.log(`\n...to reinstall the modules you just removed!!!\n`);
  process.exit(0);
}
if (!shell.which('git')) {
  shell.echo(`${ESC}[30;41m You must have git installed to run the MEME devtool ${ESC}[0m`);
  shell.exit(0);
}

const { TERM } = MTERM;

const pathBits = path.parse(argv._[0]);
const param1 = argv._[1];

const TR = TERM.Reset;
const TB = TERM.Bright;
const CY = TERM.FgYellow;
const CR = TERM.BgRed;

const PR = `${TB}${pathBits.name.toUpperCase()}${TR}`;
const P_ERR = `${TB}${CR}!ERROR!${TR}`;

const PATH_WDS = `./node_modules/webpack-dev-server/bin`;
const PATH_WEBPACK = `./node_modules/webpack/bin`;

switch (param1) {
  case 'dev':
    f_RunDevServer();
    break;
  case 'clean':
    f_Clean({ all: argv.all });
    break;
  case 'doc':
    f_DocServe();
    break;
  case 'electron':
    f_RunElectron();
    break;
  case 'package':
    f_PackageApp();
    break;
  case 'appsign':
    f_SignApp();
    break;
  case 'debugapp':
    f_DebugApp();
    break;
  default:
    console.log(`${PR}\n- ${P_ERR} unknown command '${param1}'\n`);
}

function f_RunDevServer() {
  //    "dev": "echo '\n*** USING WEBPACK HOT DEV SERVER' && webpack-dev-server  --mode development --inline --hot --host 0.0.0.0 --config=./src/config/webpack.webapp.config.js --env.HMR_MODE='wds'",
  console.log(`\n`);
  console.log(`${PR}: running Development Server`);
  // git branch information
  const { error, stdout } = shell.exec('git symbolic-ref --short -q HEAD', { silent: true });
  if (error) console.log(`${PR}: on ${CY}detached${TR} head`);
  if (stdout) console.log(`${PR}: on branch ${CY}${stdout.trim()}${TR}`);
  console.log(`---`);
  console.log(`${PR}: ${CY}GO TO ONE OF THESE URLS in CHROME WEB BROWSER${TR}`);
  console.log(`${PR}: MAINAPP - http://localhost:3000`);
  console.log(`${PR}: CLIENTS - http://${ip.address()}:3000`);
  console.log(`---\n`);
  // run webpack development server
  shell.exec(
    `${PATH_WDS}/webpack-dev-server.js --mode development --inline --hot --host 0.0.0.0 --config=./src/config/webpack.webapp.config.js --env.HMR_MODE='wds'`,
    { silent: true }
  );
  // run ursys socket server
  // note: in electron mode, this server is loaded from inside electron's console-main.js
  // console.log('Starting URSERVER');
  // URSERVER.StartNetwork();
}

function f_RunElectron() {
  console.log(`\n`);
  console.log(`${PR}: running ${CY}Electron${TR} Development Server`);
  console.log(`${PR}: compiling webapp with webpack.console.config`);
  shell.exec(
    `${PATH_WEBPACK}/webpack.js --mode development --config ./src/config/webpack.console.config.js --env.HMR_MODE='electron'`,
    { silent: true }
  );
  console.log(`${PR}: launching app through electron WDS host...\n`);
  shell.exec(`npx electron ./built/console/console-main`);
}

function f_PackageApp() {
  console.log(`\n`);
  console.log(`${PR}: packaging ${CY}Mac Electron App${TR}`);
  console.log(`${PR}: cleaning ./dist and ./built`);
  shell.rm('-rf', './dist', './built');
  console.log(`${PR}: compiling console and web apps with webpack.dist.config`);

  shell.exec(
    `${PATH_WEBPACK}/webpack.js --mode development --config ./src/config/webpack.dist.config.js --env.HMR_MODE='none'`,
    { silent: true }
  );
  console.log(`${PR}: installing node dependencies for electron app bundle`);
  shell.cd('built');
  shell.exec('npm install', { silent: true });
  console.log(`${PR}: creating meme.app with electron packager`);
  shell.exec(
    'npx electron-packager . meme --out ../dist --overwrite --app-bundle-id com.davidseah.inquirium.meme',
    { silent: true }
  );
  console.log(`${PR}: ${CY}meme.app${TR} is in ${CY}dist/meme-darwin-x64${TR}`);
  console.log(`${PR}: you must ${CR}code sign${TR} before app can run on macos`);
}

function f_SignApp() {
  console.log(`\n`);
  console.log(`${PR}: ${CY}code signing${TR} macos meme.app`);
  const { stderr, stdout } = shell.exec(
    `npx electron-osx-sign ./dist/meme-darwin-x64/meme.app --platform=darwin --type=distribution`,
    { silent: true }
  );
  if (stderr) {
    console.log(`\n${stderr.trim()}\n`);
    console.log(`${PR}: ${CR}ERROR${TR} signing app with electron-osx-sign`);
    console.log(
      `${PR}: this command requires valid Apple DeveloperId certificates installed in your keychain`
    );
  }
  if (stdout) {
    console.log(`${PR}: ${stdout.trim()}`);
    console.log(`${PR}: use script ${CY}npm run app${TR} to run with console debug output`);
  }
}

function f_DebugApp() {
  console.log(`\n`);
  console.log(`${PR}: running meme.app with ${CY}console output${TR} to terminal`);
  console.log(`${PR}: verifying code signature`);
  const { code, stderr } = shell.exec('codesign -dvv ./dist/meme-darwin-x64/meme.app', {
    silent: true
  });
  if (code === 0) {
    console.log(`${PR}: ${CY}console output${TR} from meme.app will appear below`);
    console.log(`${PR}: ${CY}CTRL-C${TR} or ${CY}close app window${TR} to terminate\n`);
    shell.exec('./dist/meme-darwin-x64/meme.app/Contents/MacOS/meme');
  } else {
    console.log(`\n${stderr.trim()}\n`);
    console.log(`${PR}: ${CR}ERROR${TR} from codesign check`);
    console.log(`${PR}: macos will not run this app until it is signed`);
    console.log(
      `${PR}: if apple developer certs are installed you can run ${CY}npm run appsign${TR}`
    );
  }
}

function f_DocServe() {
  const loc = `${CY}localhost:4001${TR}`;

  console.log(`${PR}: Point your browser to "${loc}" to read JSDoc-generate documentation.`);
  console.log(
    `${PR}: You can edit source and the documentation will live-update (browser refresh required).`
  );
  console.log(`${PR}: When you're done, type CTRL-C to stop the documentation server`);
  shell.exec(
    `npx documentation serve --config meme-documentation.yml --watch ./src/app-web/web-index.js`
  );
}

function f_Clean(opt) {
  console.log(`${PR}: removing dist/ and built/ directories...`);
  shell.rm('-rf', 'dist', 'built');
  if (opt.all) {
    console.log(`${PR}: also cleaning node_modules`);
    shell.rm('-rf', 'node_modules');
  }
  console.log(`${PR}: directories removed!`);
  if (opt.all) console.log(`${PR}: Make sure to use ${CY}npm ci${TR} to reinstall packages!!!`);
}
