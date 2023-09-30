/* ---------------------------------------------------------------------------------------
 * File        : main.js
 * Author      : Civinini Luca - IK5PWC
 *                 luca@civinini.net - http://www.civinini.net
 *                 luca@ik5pwc.it    - http://www.ik5pwc.it
 *
 * Description : Simple GUI application for rotctld daemon 
 * ---------------------------------------------------------------------------------------
*/

/* --------- Required modules (also global variables) --------- */
const { app, BrowserWindow,ipcMain, dialog } = require('electron')
const myClasses   = require('./myclasses.js');
const path        = require('path')
const g_protocol  = require('./rotctlProtocol.js');
const g_config    = require('./configFile.js');


/* --------------- Define command line switches --------------- */





/* --------------------------------------------------------------------------------------------------------- */
/*                                        Global objects / variables                                         */
/* --------------------------------------------------------------------------------------------------------- */

// Program version
const VERSION = "1.0a";
const DEFPATH = app.getPath('appData')+"/rotctlGUI/";

let winCompass;    // Compass Window
let winCFG;        // Configuration window



/* --------------------------------------------------------------------------------------------------------- */
/*                               Application startup (app.whenReady event )                                  */
/* --------------------------------------------------------------------------------------------------------- */

app.whenReady().then(() => {
  // Assume default path for configuration file
  g_config.path = DEFPATH;

  // Parse command line switches
  process.argv.forEach( (argv) => {parseCMDLine(argv)})

  // Read configuration file
  g_config.readConfigFile();

  // Start network operation
  g_protocol.startPolling(g_config.polling);

  // Load main win
  createWinMAIN()}
);





function parseCMDLine (cmd) {
  
  // is a command line switch? i.e. starts with - or --?
  option = cmd.match(/^(-{1,2}\w*)/);

  if (option != null) {
    // Detect which command line has been specified
    switch (option[1].toLowerCase()) {
      // Config file
      case '-c': 
      case '--config': 
        file = cmd.replace(option[1],'').trim();
        if (file == '' ) {
          console.error("Missing value for " + option[1] + " option");
          displayHelp();
        } else {
          // Save value for file name
          g_config.file = path.basename(file);

          // If no path was specified, then use default one 
          if (g_config.file == file) {g_config.path = DEFPATH;} else { g_config.path = path.dirname(file);}
        }
        break;

      // Application language
      case 'l':
      case 'lang':

      // Debug level
      case 'd':
      case 'debug':

      // Other command option --> print help and exit
      default:
    }



  }
}

function displayHelp () {
  console.log("------------------ rotctlGUI ver. " + VERSION + " ------------------\n\n\
Available command line options\n\
\n\
-c, --config <filepath>\n\
      Specify the name or full path to a rotctlGUI configuration file.\n\
      When specifying only a file name, rotctlGUI will search\n\
      within the  default configuration directory \n\
      (on this system is " + DEFPATH + " ) \n\
      DEFAULT: default.json \n\
      EXAMPLES: \n\
        -c tower1.json \n\
        --config ./big.json\n\
        -c c:\\rotator\\rotator1.json\n\
        -config c:\\users\\luke\\main.json\n\
\n\
-l, --lang <ISO-639 code> \n\
      Application language as two-letters ISO-639 code\n\
      Current supported languages: en,it\n\
      DEFAULT: use system language\n\
      EXAMPLES:\n\
        -l it\n\
        --lang it\n\
\n\
-d, --debug\n\
      Print debug messages on standard otput.\n\
      By default, only ERROR message are displayed \n\
\n\
")
  
  // Exit applicationtower1
  app.exit();
}


//TODO: posizione finestra di config
//TODO: logging avanzato
//TODO: help (punta su github)
//TODO: lingua in base alla lingua del sistema oppure forzata da cmdline
//TODO: aprire la dialog per la directory
// TODO: verificare con il dummy rotator lo stop N/S

const createWinMAIN = () => {
  winCompass = new BrowserWindow({
    width: 320,
    height: 365,
    resizable: false,
    autoHideMenuBar: true,
    menuBarVisible:false,
    icon: 'icon.png',
    fullscreenable: false,
    webPreferences: { preload: path.join(__dirname, 'gui/compass/preload_compass.js')
    }
  })

  winCompass.loadFile('gui/compass/compass.html')
  
  winCompass.webContents.on('did-finish-load',() => {
    
    // mainWin.removeMenu();       // Remove standard menu 
    g_protocol.connect();      // start connection
    
    // send configuration to compass window
    winCompass.webContents.send('main_tx_config',g_config.getAsJSONString(),VERSION);
  });
}

const createWinCFG = () => {
  winCFG = new BrowserWindow({
    frame: true,
    width: 345,
    height: 570,
    resizable: false,
    autoHideMenuBar: false,
    parent: winCompass,
    modal:true,
    menuBarVisible:true,
    frame:false,
    icon: 'i',
    fullscreenable: false,
    webPreferences: { preload: path.join(__dirname, 'gui/config/preload_config.js')}
  })
  
  winCFG.loadFile('gui/config/config.html')

   // Send current configuration
  winCFG.webContents.on('did-finish-load',()  => {  winCFG.send('main_tx_sendConfig', g_config.getAsJSONString()); })
  
}









/* --------------------------------------------------------------------------------------------------------- */
/*                                            Exported Functions                                             /*
/* --------------------------------------------------------------------------------------------------------- */

exports.isConnected    = function (conn)  {winCompass.webContents.send('main_tx_connected',conn);};
exports.curAzimuth     = function (az)    {winCompass.webContents.send('main_tx_azimuth',az);};
exports.onTarget       = function ()      {winCompass.webContents.send('main_tx_ontarget');};



/* --------------------------------------------------------------------------------------------------------- */
/*                                              events router                                                /*
/* --------------------------------------------------------------------------------------------------------- */

/* ----------- FROM: compass window ----------- */

// WHEN: move to specific position           TO: rotctlProtocol module
ipcMain.on('compass_tx_target',(event, value) => {g_protocol.setTarget(value);});  

// WHEN: turn CW or CCW or stop              TO: rotctlProtocol module
ipcMain.on('compass_tx_turn',(event,value)    => {g_protocol.turn(value);});       // user ask for CW, CCW rotation or stop

// WHEN: open config window                  TO: rotctlProtocol module
ipcMain.on('compass_tx_openConfig',(event)    => {createWinCFG();});



/* ----------- FROM: config window ----------- */
// WHEN: close config window                 TO: this module
ipcMain.on('config_tx_cancelConfig',(event)   => {winCFG.close()});

// WHEN: close config window                 TO: this module
ipcMain.on('config_tx_saveConfig'  ,(event,cfg)     => {
  g_config.setAsJSONString(JSON.stringify(cfg));
  g_config.writeConfigFile()
  winCompass.reload();
  winCFG.close();
})


/* --------------------------------------------------------------------------------------------------------- */
/*                                        Module (private) functions                                         */
/* --------------------------------------------------------------------------------------------------------- */

function updateConfig() {}