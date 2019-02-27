#!/usr/bin/env node

/*/
to pass a parameter via npm run script, you have to use -- as in
npm run myscript -- --myoptions=something
alternatively you'll just write your own script that does it
/*/

const shell = require('shelljs');
const argv = require('minimist')(process.argv.slice(1));
const path = require('path');
const MTERM = require('./src/cli/meme-term');

const { TERM } = MTERM;

const pathBits = path.parse(argv._[0]);
const param1 = argv._[1];

const P_SCRIPT = `${TERM.Bright}${pathBits.name.toUpperCase()}${TERM.Reset}`;
const P_ERR = `${TERM.Bright}${TERM.BgRed}!ERROR!${TERM.Reset}`;

if (!shell.which('git')) {
  shell.echo('Sorry, this script requires git');
  shell.exit(1);
}

const PATH_WDS = `./node_modules/webpack-dev-server/bin`;
switch (param1) {
  case 'dev':
    //    "dev": "echo '\n*** USING WEBPACK HOT DEV SERVER' && webpack-dev-server  --mode development --inline --hot --host 0.0.0.0 --config=./src/config/webpack.webapp.config.js --env.HMR_MODE='wds'",
    console.log(`${P_SCRIPT}: running development server`);
    shell.exec(
      `${PATH_WDS}/webpack-dev-server.js --mode development --inline --hot --host 0.0.0.0 --config=./src/config/webpack.webapp.config.js --env.HMR_MODE='wds'`
    );
    break;
  case 'clean':
    f_Clean({ all: argv.all });
    break;
  default:
    console.log(`${P_SCRIPT}\n- ${P_ERR} unknown command '${param1}'\n`);
}

function f_Clean(opt) {
  console.log(`${P_SCRIPT}: removing dist/ and built/ directories...`);
  shell.rm('-rf', 'dist', 'built');
  if (opt.all) {
    console.log('${P_SCRIPT}: also cleaning node_modules');
    shell.rm('-rf', 'node_modules');
  }
  console.log(`${P_SCRIPT}: directories removed!`);
  if (opt.all)
    console.log(
      `${P_SCRIPT}: Make sure to use ${TERM.FgYellow}npm ci${TERM.Reset} to reinstall packages!!!`
    );
}
