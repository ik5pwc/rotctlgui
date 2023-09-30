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

app.commandLine.appendSwitch("config");
app.commandLine.appendSwitch("lang");
app.commandLine.appendSwitch("loglevel");



/* --------------------------------------------------------------------------------------------------------- */
/*                                        Global objects / variables                                         */
/* --------------------------------------------------------------------------------------------------------- */

// Program version
const VERSION = "1.0a"

let winCompass;    // Compass Window
let winCFG;        // Configuration window



/* --------------------------------------------------------------------------------------------------------- */
/*                                           Application startup                                             */
/* --------------------------------------------------------------------------------------------------------- */


parseCMDLine()

readConfiguration();

g_protocol.startPolling(g_config.polling);



app.whenReady().then(() => { createWinMAIN()});








function parseCMDLine () {
  // Retrieve command line switches
  let config   = app.commandLine.getSwitchValue("config");
  let lang     = app.commandLine.getSwitchValue("lang");
  let loglevel = app.commandLine.getSwitchValue("loglevel");




}

//TODO: posizione finestra di config
//TODO: logging avanzato
//TODO: command line per prendere il nome del file di configurazione
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






function readConfiguration() {
  // TODO: qui devo passare i valori eventualmente presi da cmdline
let file = 'default.json';
let path = app.getPath('appData')+"/rotctlGUI/";

  // Read configuration file
  g_config.readConfigFile(path,file);
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
  winCFG.close();switchd
})


/* --------------------------------------------------------------------------------------------------------- */
/*                                        Module (private) functions                                         */
/* --------------------------------------------------------------------------------------------------------- */

function updateConfig() {}