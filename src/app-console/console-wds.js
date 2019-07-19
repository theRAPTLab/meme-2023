/*//////////////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  copied as-is from src/app-console

  ur-server is launched from the ur-main.js Electron mainprocess

  It currently also manages the live-reload of the web app through webpack-dev-middleware
  The live-reload for the electron app is handled by npm script running webpack

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * ////////////////////////////////////////*/

/// LIBRARIES ///////////////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const webpack = require('webpack');
const middleware = require('webpack-dev-middleware'); //webpack hot reloading middleware
const hot = require('webpack-hot-middleware');
const express = require('express'); //your original BE server
const path = require('path');
const IP = require('ip');
const cookiep = require('cookie-parser');
const { exec } = require('child_process');
const PROMPTS = require('../system/util/prompts');

const PR = PROMPTS.Pad('WebServer');

const DP = '***';
const GIT = 'GIT';

const app = express();
const configWebApp = require('../config/webpack.webapp.config');

function Start(options) {
  const { isPackaged } = options;

  let PATH_BUILT;

  if (isPackaged) {
    console.log(`${PR} using pre-bundled webpack for standalone app`);
    PATH_BUILT = path.resolve(__dirname, '../web');
  } else {
    // THIS IS WEBPACK STUFF
    //
    // note we need the object, not a function, when using webpack API
    const env = { HMR_MODE: 'electron' };
    const webConfig = configWebApp(env);

    const compiler = webpack(webConfig);

    // eslint-disable-next-line
    compiler.hooks.done.tap('DetectCompileDone', stats => {
      console.log(PR, 'NOTICE: DetectCompileDone tap was fired');
    });

    console.log(`${PR} starting electron host environment w/ hot-reload`);
    // webpack middleware to enable file serving
    const instance = middleware(compiler, {
      // stats: 'errors-only',
      publicPath: webConfig.output.publicPath,
      stats: 'errors-only' // quiet webpack middleware output
    });
    app.use(instance);
    // enable hot middleware with compiler instance
    app.use(hot(compiler));
    // theoreticically changes to this should cause a hot reload?
    // ONLY with webapp, not with appserver changes!
    PATH_BUILT = path.resolve(__dirname, '../../built/web');
  }
  /// serve everything else out of public as static files
  console.log(`${PR} docroot is ${PATH_BUILT}`);
  app.use('/', express.static(PATH_BUILT));
  app.listen(3000, () => console.log(`${PR} listening for http on port 3000`));
}

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
