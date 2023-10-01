#!/usr/bin/env node
/*/
to pass a parameter via npm run script, you have to use -- as in
npm run myscript -- --myoptions=something
alternatively you'll just write your own script that does it
/*/
const fs = require('fs-extra');

if (!fs.existsSync('./node_modules/ip')) {
  console.log(`\x1b[30;41m\x1b[37m MEME STARTUP ERROR \x1b[0m\n`);
  let out = '';
  out += `MISSING CRITICAL MODULE\n`;
  out += `is this the \x1b[33mfirst time running MEME\x1b[0m `;
  out += `or did you just run \x1b[33mnpm clean:all\x1b[0m?\n`;
  out += `run \x1b[33mnpm ci\x1b[0m to install all node_modules\n`;
  console.log(out);
  process.exit(0);
}

const path = require('path');
const ip = require('ip');
const process = require('process');
const shell = require('shelljs');
const argv = require('minimist')(process.argv.slice(1));
const { signAsync } = require('@electron/osx-sign');
const electronNotarize = require('@electron/notarize');
require('dotenv').config();
const PROMPTS = require('./src/system/util/prompts');
const URSERVER = require('./src/system/server.js');
const MTERM = require('./src/cli/meme-term');

if (!shell.which('git')) {
  shell.echo(`\x1b[30;41m You must have git installed to run the MEME devtool \x1b[0m`);
  shell.exit(0);
}

const pathBits = path.parse(argv._[0]);
const param1 = argv._[1];

const { TERM } = MTERM;
const TR = TERM.Reset;
const TB = TERM.Bright;
const CY = TERM.FgYellow;
const CR = `${TERM.BgRed}${TERM.FgWhite}`;

const PR = PROMPTS.Pad('MEME EXEC');

const P_ERR = `${TB}${CR}!ERROR!${TR}`;

const PATH_WEBPACK = `./node_modules/webpack/bin`;
const APP_BUNDLE_ID = 'net.inquirium.seeds-meme';

switch (param1) {
  case 'dev':
    f_RunDevServer({ memehost: 'devserver' });
    break;
  case 'production':
    f_RunDevServer({ memehost: 'production' });
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

function u_checkError(execResults) {
  if (!execResults.stderr) return;
  console.log(`${CR}*** ERROR IN MEME EXEC ***${TR}`);
  console.log(execResults.stderr);
  process.exit(0);
}

function f_RunDevServer(memehost) {
  //    "dev": "echo '\n*** USING WEBPACK HOT DEV SERVER' && webpack-dev-server  --mode development --inline --hot --host 0.0.0.0 --config=./src/config/webpack.webapp.config.js --env.HMR_MODE='wds'",
  console.log(`\n`);
  console.log(PR, `running Development Server`);
  // git branch information
  const { error, stdout } = shell.exec('git symbolic-ref --short -q HEAD', { silent: true });
  if (error) console.log(PR, `on ${CY}detached${TR} head`);
  if (stdout) console.log(PR, `on branch ${CY}${stdout.trim()}${TR}`);

  // run webpack development server
  // const wds = shell.exec(
  //   `${PATH_WDS}/webpack-dev-server.js --mode development --inline --hot --host 0.0.0.0 --config=./src/config/webpack.webapp.config.js --env.HMR_MODE='wds'`,
  //   { silent: true, async: true }
  // );
  // wds.on('exit', () => {
  //   console.log(`\n${PR} webpack-dev-server has been terminated\n`);
  //   process.exit();
  // });
  // process.on('SIGINT', () => {
  //   wds.kill('SIGHUP');
  // });

  // run ursys socket server
  // note: in electron mode, this server is loaded from inside electron's console-main.js
  URSERVER.Initialize(memehost);
  URSERVER.StartNetwork();
  URSERVER.StartWebServer();
}

function f_RunElectron() {
  console.log(`\n`);
  console.log(PR, `running ${CY}Electron Host with Live Reload${TR}`);
  console.log(PR, `compiling electron renderprocess files with webpack.console.config`);
  let res = shell.exec(
    // note: to pass an enviroment setting to the webpack config script, add --env.MYSETTING='value'
    `${PATH_WEBPACK}/webpack.js --mode development --config ./src/config/webpack.console.config.js`,
    { silent: true }
  );
  u_checkError(res);
  shell.exec(`npx electron ./built/console/console-main`);
}

function f_GetPlatformConfig(targetPlatform = null, targetArch = null) {
  // Platform selection; defaults to host platform
  const electronPlatform = targetPlatform != null ? targetPlatform : process.platform;
  const electronArch = targetArch != null ? targetArch : process.arch;

  // Note: the Electron Packager does not allow specifying the platform specific folder name
  //  using the out parameter, only the folder; this variable matches the current package folder
  //  name
  const packageFolder = `meme-${electronPlatform}-${electronArch}`;
  const packageOutput = path.join(__dirname, 'dist', packageFolder);

  let friendlyName;
  switch (electronPlatform) {
    case 'darwin':
      friendlyName = 'MEME macOS';
      break;
    case 'linux':
      friendlyName = 'MEME Linux';
      break;
    case 'win32':
      friendlyName = 'MEME Windows';
      break;
    default:
      friendlyName = null;
  }

  return {
    platform: electronPlatform,
    arch: electronArch,
    packageOutput,
    friendlyName
  };
}

function f_PackageApp() {
  console.log(`\n`);
  console.log(PR, `packaging ${CY}electron app${TR} 'meme.app'`);
  console.log(PR, `erasing ./built and ./dist directories`);
  shell.rm('-rf', './dist', './built');
  console.log(PR, `compiling console, web, system files into ./built`);

  let res = shell.exec(
    // note: to pass an enviroment setting to the webpack config script, add --env.MYSETTING='value'
    `${PATH_WEBPACK}/webpack.js --mode development --config ./src/config/webpack.dist.config.js`,
    { silent: true }
  );
  u_checkError(res);
  console.log(PR, `installing node dependencies into ./built`);
  shell.cd('built');
  shell.exec('npm install', { silent: true });

  // FUTURE: Pass the platform and architecture from the script parameters to allow for
  //  cross-platform builds
  const platformConfig = f_GetPlatformConfig();

  console.log(PR, `using electron-packager to write 'meme.app' to ${platformConfig.packageOutput}`);
  res = shell.exec(
    `npx electron-packager . meme --platform ${platformConfig.platform} ` +
      `--arch ${platformConfig.arch} --out ../dist --overwrite ` +
      `--app-bundle-id ${APP_BUNDLE_ID}`,
    { silent: false }
  );
  // u_checkError(res); // electron-packager stupidly emits status to stderr

  // For non-Mac platforms, the application is not stored within a dedicated folder and contains
  //  a 'resources' folder for the Electron resources. Since this conflicts with the 'resources'
  //  folder for MEME, it should be placed in a dedicated folder
  if (platformConfig.platform !== 'darwin') {
    // Move the Electron app and resources into the provided subfolder
    const appFullPath = path.join(__dirname, 'dist', 'meme.app');
    fs.renameSync(platformConfig.packageOutput, appFullPath);
    fs.ensureDirSync(platformConfig.packageOutput);
    fs.moveSync(appFullPath, path.join(platformConfig.packageOutput, 'meme.app'));
  }

  console.log(PR, `copying templates to output folder: ${platformConfig.packageOutput}`);

  const templatesPath = path.join(__dirname, 'templates');
  fs.copySync(templatesPath, path.join(platformConfig.packageOutput, 'templates'));
  fs.ensureDirSync(path.join(platformConfig.packageOutput, 'data'));
  fs.ensureDirSync(path.join(platformConfig.packageOutput, 'resources'));

  // For macOS - include a shell script to remove the quarantine flag
  // Note: this is a workaround because the application will run with "translocation" - which will
  //  application bundle in a read-only folder that is in a randomized path. Runtime file write
  //  operations therefore fail when they are targetted relative to the application bundle
  if (platformConfig.platform === 'darwin') {
    fs.writeFileSync(
      path.join(platformConfig.packageOutput, 'install.sh'),
      '#/bin/sh\nxattr -d com.apple.quarantine ./meme.app',
      {
        mode: 0o755
      }
    );
  }

  // Rename the output folder to something friendlier
  let finalOutput;
  if (platformConfig.friendlyName != null) {
    fs.renameSync(
      platformConfig.packageOutput,
      path.join(__dirname, 'dist', platformConfig.friendlyName)
    );
    finalOutput = `dist/${platformConfig.friendlyName}`;
  } else {
    finalOutput = path.basename(platformConfig.packageOutput);
  }

  console.log(PR, `electron app written to ${CY}${finalOutput}${TR}`);
  if (platformConfig.platform === 'darwin') {
    console.log(PR, `NOTE: default macos security requires ${CR}code signing${TR} to run app.`);
    console.log(PR, `use ${CY}npm run appsign${TR} to use default developer id (if installed)\n`);
  }
}

async function f_SignApp() {
  const platformConfig = f_GetPlatformConfig();

  if (platformConfig.platform !== 'darwin') {
    console.log(PR, 'Non-MacOS distributions do not require signing (yet).');
    return;
  }

  console.log(`\n`);
  console.log(PR, `using electron/osx-sign to ${CY}securely sign${TR} 'meme.app'`);
  console.log(PR, `please be patient, this may take a moment...`);

  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID;

  if (!appleId || !appleIdPassword || !teamId) {
    console.log(
      PR,
      `signing/notarizing the app requires credentials from your Apple account to be stored your shell environment:`
    );
    console.log(PR, `\tAPPLE_ID: Your Apple ID`);
    console.log(PR, `\tAPPLE_PASSWORD: An Apple app-specific password`);
    console.log(PR, `\tAPPLE_TEAM_ID: Your Apple Team ID`);
    console.log(PR, `instructions on obtaining these values can be found in README-signing.md`);

    return;
  }

  const appPath = path.join(
    __dirname,
    'dist',
    platformConfig.friendlyName != null
      ? platformConfig.friendlyName
      : path.basename(platformConfig.packageOutput),
    'meme.app'
  );

  try {
    // FUTURE: Update the path to the meme app folder if signing is made cross-platform
    await signAsync({
      //app: './dist/meme-darwin-x64/meme.app',
      app: appPath,
      preAutoEntitlements: false,
      platform: 'darwin',
      optionsForFile: file => {
        return {
          hardenedRuntime: true,
          entitlements: './src/config/darwin.entitlements.plist'
        };
      }
    });
  } catch (err) {
    console.log(PR, `unable to sign application, error: ${err}.`);
    return;
  }

  console.log(PR, `using electron/notarize to submit the package to Apple for Notarization`);
  console.log(PR, `please be patient, this ${CY}may take several minutes${TR}...`);

  try {
    await electronNotarize.notarize({
      appBundleId: APP_BUNDLE_ID,
      appPath,
      appleId,
      appleIdPassword,
      teamId,
      tool: 'notarytool'
    });
  } catch (err) {
    console.log(PR, `unable to notarize the application, error: ${err}`);
    return;
  }

  console.log(
    PR,
    `the app has been successfully signed and notarized. You may receive an email from Apple indicating that the notarization was successful`
  );

  console.log(PR, `use script ${CY}npm run app${TR} to run with console debug output\n`);
}

function f_DebugApp() {
  console.log(`\n`);
  console.log(PR, `running meme.app with ${CY}console output${TR} to terminal`);
  console.log(PR, `verifying code signature`);
  const { code, stderr } = shell.exec('codesign -dvv ./dist/meme-darwin-x64/meme.app', {
    silent: true
  });
  if (code === 0) {
    console.log(PR, `${CY}console output${TR} from meme.app will appear below`);
    console.log(PR, `${CY}CTRL-C${TR} or ${CY}close app window${TR} to terminate\n`);
    shell.exec('./dist/meme-darwin-x64/meme.app/Contents/MacOS/meme');
  } else {
    console.log(`\n${stderr.trim()}\n`);
    console.log(PR, `${CR}ERROR${TR} from codesign check`);
    console.log(PR, `macos will not run this app until it is signed`);
    console.log(PR, `if apple developer certs are installed you can run ${CY}npm run appsign${TR}`);
  }
}

function f_DocServe() {
  const loc = `${CY}localhost:4001${TR}`;

  console.log(PR, `point your browser to "${loc}" to read JSDoc-generate documentation.`);
  console.log(
    PR,
    `you can edit source and the documentation will live-update (browser refresh required).`
  );
  console.log(PR, `when you're done, type CTRL-C to stop the documentation server`);
  shell.exec(
    `npx documentation serve --config meme-documentation.yml --watch ./src/app-web/web-index.js`
  );
}

function f_Clean(opt) {
  console.log(PR, `removing dist/, data/, and built/ directories...`);
  shell.rm('-rf', 'dist', 'data', 'built');
  console.log(PR, `directories removed!`);
  if (opt.all) {
    console.log(PR, `also removing node_modules/`);
    shell.rm('-rf', 'node_modules');
    console.log(PR, `you will have to reinstall them with the`);
    console.log(PR, `${TERM.FgYellow}npm ci${TERM.Reset} command.`);
    // shell.exec('npm ci', { silent: true });
  }
  console.log(PR, `operation complete!`);
}
