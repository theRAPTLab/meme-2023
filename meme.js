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
const child_process = require('child_process');
const shell = require('shelljs');
const argv = require('minimist')(process.argv.slice(1));
const dotenv = require('dotenv');
const { signAsync } = require('@electron/osx-sign');
const electronNotarize = require('@electron/notarize');
require('dotenv').config();
const PROMPTS = require('./src/system/util/prompts');
const URSERVER = require('./src/system/server.js');
const MTERM = require('./src/cli/meme-term');
const { readFileSync, existsSync } = require('fs');

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
  case 'package-turbo360':
    f_PackageWebTurbo360(argv._[2]);
    break;
  case 'deploy-turbo360':
    f_DeployWebTurbo360();
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
  // Note: the entry point is expected to be a subdirectory within the distribution due to conflicts
  //  between the Electron distribution folder structure and the current MEME folder structure
  let entrypoint;
  switch (electronPlatform) {
    case 'darwin':
      friendlyName = 'MEME macOS';
      entrypoint = 'meme.app/Contents/MacOS/meme';
      break;
    case 'linux':
      friendlyName = 'MEME Linux';
      entrypoint = 'meme.app/meme';
      break;
    case 'win32':
      friendlyName = 'MEME Windows';
      entrypoint = `meme.app${path.sep}meme`;
      break;
    default:
      console.log(PR, `${CR}ERROR${TR} - unable to identify platform`);
      process.exit(1);
  }

  // Defensive check
  if (!entrypoint.includes(path.sep)) {
    console.log(
      PR,
      'Platform configuration must embed the entry point within a subfolder of ' +
        'the distribution.'
    );
    process.exit(1);
  }

  const distOutput = path.join(__dirname, 'dist', friendlyName);
  const appPath = entrypoint.substring(0, entrypoint.indexOf(path.sep));

  return {
    platform: electronPlatform,
    arch: electronArch,
    packageOutput,
    distOutput,
    appPath,
    entrypoint,
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
  const { platform, arch, packageOutput, distOutput, appPath } = f_GetPlatformConfig();

  console.log(PR, `using electron-packager to write '${appPath}' to ${packageOutput}`);
  res = shell.exec(
    `npx electron-packager . meme --platform ${platform} ` +
      `--arch ${arch} --out ../dist --overwrite ` +
      `--app-bundle-id ${APP_BUNDLE_ID}`,
    { silent: false }
  );
  // u_checkError(res); // electron-packager stupidly emits status to stderr

  // Rename the output folder if appropriate
  if (packageOutput !== distOutput) {
    console.log(PR, `renaming package folder to friendly platform name: ${distOutput}`);
    fs.renameSync(packageOutput, distOutput);
  }

  // For non-Mac platforms, the application is not stored within a dedicated folder and contains
  //  a 'resources' folder for the Electron resources. Since this conflicts with the 'resources'
  //  folder for MEME, it should be placed in a dedicated folder
  if (platform !== 'darwin') {
    // Move the Electron app and resources into the provided subfolder
    const tempPath = path.join(__dirname, 'dist', appPath);
    fs.renameSync(distOutput, tempPath);
    fs.ensureDirSync(distOutput); // recreate the directory that was just renamed
    fs.moveSync(tempPath, path.join(distOutput, appPath));
  }

  console.log(PR, `copying templates to output folder: ${distOutput}`);

  const templatesPath = path.join(__dirname, 'templates');
  fs.copySync(templatesPath, path.join(distOutput, 'templates'));
  fs.ensureDirSync(path.join(distOutput, 'data'));
  fs.ensureDirSync(path.join(distOutput, 'resources'));

  // For macOS - include a shell script to remove the quarantine flag
  // Note: this is a workaround because the application will run with "translocation" - which will
  //  application bundle in a read-only folder that is in a randomized path. Runtime file write
  //  operations therefore fail when they are targetted relative to the application bundle
  if (platform === 'darwin') {
    fs.writeFileSync(
      path.join(distOutput, 'install.sh'),
      `#/bin/sh\nxattr -d com.apple.quarantine ./${appPath}`,
      {
        mode: 0o755
      }
    );
  }

  console.log(PR, `electron app written to ${CY}${distOutput}${TR}`);
  if (platformConfig.platform === 'darwin') {
    console.log(PR, `NOTE: default macos security requires ${CR}code signing${TR} to run app.`);
    console.log(PR, `use ${CY}npm run appsign${TR} to use default developer id (if installed)\n`);
  }
}

function f_PackageWebTurbo360(template = '_blank') {
  console.log(`\n`);
  console.log(PR, `packaging for ${CY}Turbo-360${TR}`);
  console.log(PR, `erasing ./built and ./dist directories`);
  shell.rm('-rf', './dist', './built');
  console.log(PR, `compiling web into ./built`);

  // Bundle the MEME web application
  let res = shell.exec(
    `${PATH_WEBPACK}/webpack.js --mode development --config ./src/config/webpack.dist.config.js`,
    { silent: true }
  );
  u_checkError(res);

  // Prepare a local copy of the Turbo360 NodeJS/Express base template customized for MEME
  // See: https://github.com/Vertex-Labs/base-template-meme
  console.log(PR, `cloning latest ${CY}Turbo-360${TR} base template into ./dist`);
  res = shell.exec(
    'git clone https://github.com/Vertex-Labs/base-template-meme.git dist',
    { silent: true }
  );
  if (res.code !== 0) {
    console.error(
      PR,
      `${CR}Unable to clone Turbo 360 Base Template - do you have access?${TR}:`
    );
    process.exit(1);
  }

  res = shell.rm('-rf', './dist/.git');

  console.log(PR, `installing ${CY}Turbo-360${TR} Node dependencies...`);
  shell.cd('./dist');
  res = shell.exec('npm i --omit=dev', { silent: true });
  if (res.code !== 0) {
    console.error(
      PR,
      `${CR}Unable to install Turbo 360 Base Template NodeJS dependencies${TR}`
    );
    console.error(PR, `\t${res.stderr}`);
    process.exit(1);
  }
  shell.cd(__dirname);

  console.log(PR, `Copying web-app...`);
  // Copy the created MEME web-app bundle into the template
  fs.copySync('./built/web', './dist/public');
  fs.moveSync('./dist/public/index.ejs', './dist/views/home.html');

  console.log(PR, `Copying resources (using template: ${template})`);
  fs.copySync(`./templates/${template}/resources`, './dist/public/resources');

  console.log(PR, `${CY}Turbo-360 packaging complete${TR}`);
  console.log(
    PR,
    `To deploy, type ${CY}npm run deploy-turbo360${TR} and follow the prompts`
  );
}

function f_DeployWebTurbo360() {
  let res = 0;

  console.log(PR, `Welcome to the Turbo-360 Deployment Tool!`);
  console.log(PR, `Please select the ${CY}Turbo-360${TR} project to deploy to:`);

  // First, connect the local project:
  shell.cd('./dist');

  try {
    child_process.execFileSync('npx turbo', ['connect'], {
      stdio: 'inherit',
      shell: true
    });
  } catch (err) {
    if (err.status !== 0) {
      f_HandleDeployError(res.code);
      process.exit(1);
    }
  }

  // .env file contains the slug
  if (!fs.existsSync('.env')) {
    console.log(
      PR,
      `You must connect your local project to a Turbo-360 project by selecting an option`
    );
    process.exit(1);
  }

  const { TURBO_PROJECT = null, TURBO_PROJECT_SLUG = null } = dotenv.parse(
    fs.readFileSync('.env') ?? ''
  );

  // Second, do the two deployment steps:
  console.log(
    PR,
    `Deploying to ${CY}Turbo-360${TR} Project ${CY}${TURBO_PROJECT}${TR}`
  );
  console.log(PR, `Please wait, this process may take several minutes....`);
  try {
    res = shell.exec('npx turbo deploy', { silent: true });
    if (res.code !== 0) {
      f_HandleDeployError(res.code);
      process.exit(1);
    }

    res = shell.exec('npx turbo deploy -t static', { silent: true });
    if (res.code !== 0) {
      f_HandleDeployError(res.code);
      process.exit(1);
    }

    const url = `https://${TURBO_PROJECT_SLUG}.turbo360-staging.com`;
    console.log(
      '\nDeployment complete, you can access the site using the following URLs:'
    );
    console.log(`\tAdmin Panel: ${url}/#/admin?danishpowers`);
    console.log(`\tApplication: ${url}/#/`);
  } catch (err) {
    // Unexpected errors
    console.log(PR, `unexpected error during Turbo-360 deployment: ${err}`);
    process.exit(-1);
  } finally {
    shell.cd(__dirname);
  }

  // Local function
  function f_HandleDeployError(exitCode) {
    if (exitCode) {
      // FUTURE: This should ideally be exported from the CLI tool, or alternatively, the CLI tool
      //  should expose a programmatic interface rather than mediate this through the shell
      const TURBO360_ERRORS = {
        // General errors
        UNSPECIFIED: { exitCode: 1 },
        INVALID_PARAMS: { exitCode: 2 },
        NOT_LOGGED_IN: { exitCode: 3 },

        // Deploy-specific errors
        PROJECT_NOT_CONNECTED: { exitCode: 100 },
        PROJECT_NOT_FOUND: { exitCode: 101 },
        NOT_AUTHORIZED: { exitCode: 102 }
      };

      // Non-zero exit code, interpret it
      switch (exitCode) {
        case TURBO360_ERRORS.NOT_LOGGED_IN:
          console.log(PR, `You must log in to ${CY}Turbo-360${TR} to deploy.`);
          break;

        case TURBO360_ERRORS.PROJECT_NOT_CONNECTED:
          console.log(
            PR,
            `Your local codebase must be connected to a ${CY}Turbo-360${TR} project to continue.`
          );
          break;

        case TURBO360_ERRORS.PROJECT_NOT_FOUND:
        case TURBO360_ERRORS.NOT_AUTHORIZED:
          console.log(
            PR,
            `The specified ${CY}Turbo-360${TR} project does not exist or you do not have access to it.`
          );
          break;

        default:
          // All other errors
          console.log(
            PR,
            `Unexpected error while performing the ${CY}Turbo-360${TR} deployment: ${exitCode}.`
          );
          break;
      }

      console.log(
        PR,
        `\tPlease review the ${CY}Turbo-360${TR} deployment notes in ${CY}README-Turbo360.md${TR}`
      );
    }
  }
}

async function f_SignApp() {
  const { platform, distOutput, appPath } = f_GetPlatformConfig();

  if (platform !== 'darwin') {
    console.log(PR, 'Non-MacOS distributions do not require signing (yet).');
    return;
  }

  const signedPath = path.join(distOutput, appPath);

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

  try {
    await signAsync({
      app: signedPath,
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
      appPath: signedPath,
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
  // Get the platform config for the current host
  const { platform, distOutput, appPath, entrypoint } = f_GetPlatformConfig();

  console.log(`\n`);
  console.log(PR, `running meme.app with ${CY}console output${TR} to terminal`);

  if (platform === 'darwin') {
    const signedPath = path.join(distOutput, appPath);

    console.log(PR, `verifying code signature`);
    const { code, stderr } = shell.exec(`codesign -dvv ${signedPath}`, {
      silent: true
    });

    if (code !== 0) {
      console.log(`\n${stderr.trim()}\n`);
      console.log(PR, `${CR}ERROR${TR} from codesign check`);
      console.log(PR, `macos will not run this app until it is signed`);
      console.log(
        PR,
        `if apple developer certs are installed you can run ${CY}npm run appsign${TR}`
      );
      return;
    }
  }

  console.log(PR, `${CY}console output${TR} from meme.app will appear below`);
  console.log(PR, `${CY}CTRL-C${TR} or ${CY}close app window${TR} to terminate\n`);

  shell.exec(`"${path.join(distOutput, entrypoint)}"`);
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
