#!/usr/bin/env node

/*/
to pass a parameter via npm run script, you have to use -- as in
npm run myscript -- --myoptions=something
alternatively you'll just write your own script that does it
/*/
const path = require('path');
const ip = require('ip');

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

const P_SCRIPT = `${TERM.Bright}${pathBits.name.toUpperCase()}${TERM.Reset}`;
const P_ERR = `${TERM.Bright}${TERM.BgRed}!ERROR!${TERM.Reset}`;

const PATH_WDS = `./node_modules/webpack-dev-server/bin`;
switch (param1) {
  case 'dev':
    //    "dev": "echo '\n*** USING WEBPACK HOT DEV SERVER' && webpack-dev-server  --mode development --inline --hot --host 0.0.0.0 --config=./src/config/webpack.webapp.config.js --env.HMR_MODE='wds'",
    console.log(`\n`);
    console.log(`${P_SCRIPT}: running development server`);
    console.log(`${P_SCRIPT}: ${TERM.FgYellow}GO TO ONE OF THESE URLS in CHROME WEB BROWSER${TERM.Reset}`);
    console.log(`${P_SCRIPT}: MAINAPP - http://localhost:3000`);
    console.log(`${P_SCRIPT}: CLIENTS - http://${ip.address()}:3000`);
    console.log(`\n`);
    shell.exec(
      `${PATH_WDS}/webpack-dev-server.js --mode development --inline --hot --host 0.0.0.0 --config=./src/config/webpack.webapp.config.js --env.HMR_MODE='wds'`
    );
    break;
  case 'clean':
    f_Clean({ all: argv.all });
    break;
  case 'doc':
    f_DocServe();
    break;
  default:
    console.log(`${P_SCRIPT}\n- ${P_ERR} unknown command '${param1}'\n`);
}

function f_DocServe(opt) {
  const loc = `${TERM.FgYellow}localhost:4001${TERM.Reset}`;

  console.log(`${P_SCRIPT}: Point your browser to "${loc}" to read JSDoc-generate documentation.`);
  console.log(
    `${P_SCRIPT}: You can edit source and the documentation will live-update (browser refresh required).`
  );
  console.log(`${P_SCRIPT}: When you're done, type CTRL-C to stop the documentation server`);
  shell.exec(`npx documentation serve --watch ./src/app-web/web-index.js`);
}

function f_Clean(opt) {
  console.log(`${P_SCRIPT}: removing dist/ and built/ directories...`);
  shell.rm('-rf', 'dist', 'built');
  if (opt.all) {
    console.log(`${P_SCRIPT}: also cleaning node_modules`);
    shell.rm('-rf', 'node_modules');
  }
  console.log(`${P_SCRIPT}: directories removed!`);
  if (opt.all)
    console.log(
      `${P_SCRIPT}: Make sure to use ${TERM.FgYellow}npm ci${TERM.Reset} to reinstall packages!!!`
    );
}
