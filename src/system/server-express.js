/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  server-express creates an express instance and

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/

/// LIBRARIES ///////////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const wpack = require('webpack');
const wpack_mid = require('webpack-dev-middleware'); //webpack hot reloading middleware
const wpack_hot = require('webpack-hot-middleware');
const express = require('express'); //your original BE server
const path = require('path');
const IP = require('ip');
const cookiep = require('cookie-parser');
const { exec } = require('child_process');
//
const configWebApp = require('../config/webpack.webapp.config');
const PROMPTS = require('../system/util/prompts');

/// CONSTANTS /////////////////////////////////////////////////////////////////
///	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const { TERM_EXP: CLR, TERM_WPACK, TR } = PROMPTS;
const PORT = 3000;
const PR = `${CLR}${PROMPTS.Pad('URSYS.WEB')}${TR}`;
const DP = '***';
const GIT = 'GIT';

/// API MEHTHODS //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const app = express();
let server;

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function Start() {
  let PATH_WEBSOURCE;

  const isPackaged = __dirname.includes('/Contents/Resources/app/system');
  if (isPackaged) {
    // if server-express is running inside an Electron instance, don't use
    // webpack to bundle the webapp on-the-fly.
    PATH_WEBSOURCE = path.resolve(__dirname, '../web');
    console.log(PR, `${CLR}package mode${TR} serving precompiled web bundle`);
    console.log(PR, `from '${PATH_WEBSOURCE}'`);
    server = app.listen(PORT, () => {
      console.log(PR, `http on port ${PORT} from '${PATH_WEBSOURCE}'`);
    });
  } else {
    // otherwise, we are running as straight node out of npm scripts, or
    // a generic Electron binary was used to load us (Electron works just
    // as a node interpreter ya know!
    console.log(PR, `${CLR}dev mode${TR} serving with ${CLR}live code reloading${TR}`);
    PATH_WEBSOURCE = path.resolve(__dirname, '../../built/web');

    // RUN WEBPACK THROUGH API
    // first create a webpack instance with our chosen config file
    const webConfig = configWebApp();
    const compiler = wpack(webConfig);

    // add webpack middleware to express
    // also add the hot module reloading middleware
    const instance = wpack_mid(compiler, {
      // logLevel: 'silent', // turns off [wdm] messages
      publicPath: webConfig.output.publicPath,
      stats: 'errors-only' // see https://webpack.js.org/configuration/stats/
    });
    app.use(instance);
    app.use(wpack_hot(compiler));

    // compilation start message
    // we'll start the server after webpack bundling is complete
    // but we still have some configuration to do
    compiler.hooks.afterEmit.tap('StartServer', () => {
      if (!server) {
        server = app.listen(PORT, () => {
          console.log(PR, `http on port ${PORT} from '${PATH_WEBSOURCE}'`);
        });
      } else {
        console.log(`${TERM_WPACK}webpack`, `bundle recompiled${TR}`);
      }
    });
  }

  // FINALLY, TELL EXPRESS HOW TO SERVE OUR FILES

  // set the templating engine
  app.set('view engine', 'ejs');
  // handle special case for root url to serve our ejs template
  app.get('/', (req, res) => {
    res.render(`${PATH_WEBSOURCE}/index`, {
      URHost: 'host',
      URPort: '3000'
    });
  });
  // for everything else...
  app.use('/', express.static(PATH_WEBSOURCE));
}

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// THIS IS ALL UNISYS STUFF TO BE PORTED AND ACTIVATED AS URSYS
//
//
let UKEY_IDX = 0;
const USRV_START = new Date(Date.now()).toISOString();

/// CONFIGURE EXPRESS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// declare paths used by Express configuration
const PATH_TEMPLATE = path.resolve(__dirname, '/app/assets');

function Run() {
  const unetOptions = { port: 3000 }; // was UNISYS.InitializeNetwork();
  console.log(PR, 'Created Network', unetOptions);
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /// configure cookies middleware (appears in req.cookies)
  app.use(cookiep());
  /// configure headers to allow cross-domain requests of media elements
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  /// configure template engine then serve templated index.ejs page
  app.set('view engine', 'ejs');
  app.get('/', (req, res) => {
    // gather important information for client so it
    // can establish a socket connection to UNISYS
    const uaddr = IP.address(); // this server LAN ip
    const hostip = IP.address(); // this gets copied to server properties to
    const uport = unetOptions.port; // unisys listening port
    let { ip } = req; // remote ip
    const { hostname } = req; // remote hostname
    // rewrite shortcut localhost into long form
    if (ip === '::1') ip = '127.0.0.1';
    // ukey increments everytime the index page is served
    const ukey = `UHT_${String((UKEY_IDX += 1))}`.padStart(5, '0');
    // ustart is when the server last started;
    // ustart+ukey should be adequate to distinguish unique instance
    // on the network
    const ustart = USRV_START;
    // path to the index.ejs file
    const indexFile = path.join(PATH_TEMPLATE, '/index');
    // render template, passing-in template-accessible vars
    const templateProps = {
      // server information
      ustart,
      hostname,
      hostip,
      // client information
      ip,
      ukey,
      // socket address
      uaddr,
      uport
    };
    res.render(indexFile, templateProps);
    // adding next() causes 'headers already sent' error
    // it might be called internally by res.render()?
  });
  /// serve everything else out of public as static files
  /// our app uses ejs templates
  const PUBLIC_PATH = path.join(__dirname, 'static');
  app.use('/', express.static(PUBLIC_PATH));
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /*/ additional route: /action (placeholder)
/*/ app.use('/action', (req, res) => {
    res.send('POST action completed!');
  });
}
/// BRUNCH CUSTOM SERVER START FUNCTION ///////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*/ the brunch build tool will call this exported function to start the server
/*/ function Listen() {
  return (config, callback) => {
    // start app listener
    app
      .listen(config.port, () => {
        // setup prompts
        console.log(PR);
        console.log(PR, DP, 'GO TO ONE OF THESE URLS in CHROME WEB BROWSER', DP);
        console.log(PR, DP, `MAINAPP - http://localhost:${config.port}`);
        console.log(PR, DP, `CLIENTS - http://${IP.address()}:${config.port}`);
        console.log(PR);
        // git branch information
        exec('git symbolic-ref --short -q HEAD', (error, stdout) => {
          if (error) {
            // console.error(BP,'git symbolic-ref query error',error);
            console.log(GIT, 'You are running a <detached> branch');
          }
          if (stdout) {
            const out = stdout.trim();
            console.log(GIT, `You are running the ${out} branch`);
          }
        });
        callback();
      })
      .on('error', err => {
        let errstring = `### NETCREATE STARTUP ERROR: '${err.errno}'\n`;
        switch (err.errno) {
          case 'EADDRINUSE':
            errstring += `Another program is already using port ${config.port}.\n`;
            errstring += `Go to "http://localhost:${
              config.port
            }" to check if NetCreate is already running.\n\n`;
            errstring += `Still broken? See https://github.com/daveseah/netcreate-2018/issues/4\n`;
            break;
          default:
            errstring += `${err}`;
            console.log(err);
        }
        console.log(`\n\n${errstring}\n### PROGRAM STOP\n`);
        throw new Error(err.errno);
      });
    // Return the APP; it has the `close()` method, which would be ran when
    // Brunch server is terminated. This is a requirement.
    return app;
  };
}

module.exports = { Start, Run, Listen };
