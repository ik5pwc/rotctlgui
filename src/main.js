const { app, BrowserWindow,ipcMain, dialog } = require('electron')
const myClasses          = require('./myclasses.js');
const path               = require('path')
const rotctlProtocol     = require('./rotctlProtocol.js');
const config             = require('./configFile.js');





let winCompass;
let winCFG;


const VERSION = "1.0a"

readConfiguration();

rotctlProtocol.startPolling(config.polling);

//TODO: posizione finestra di config
//TODO: protocol errors
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
    webPreferences: { preload: path.join(__dirname, 'gui/compass/js/preload_compass.js')
    }
  })

  winCompass.loadFile('gui/compass/compass.html')
  
  winCompass.webContents.on('did-finish-load',() => {
    
    // mainWin.removeMenu();       // Remove standard menu 
    rotctlProtocol.connect();      // start connection
    
    // send command to update window info
    winCompass.webContents.send('main_tx_misc',config.name,config.stop,VERSION);
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
    webPreferences: { preload: path.join(__dirname, 'gui/config/js/preload_config.js')}
  })
  
  winCFG.loadFile('gui/config/config.html')

   // Send current configuration
  winCFG.webContents.on('did-finish-load',()  => {  winCFG.send('tx_allconf', config.getAsJSONString()); })
  
}

app.whenReady().then(() => { createWinMAIN()});




function readConfiguration() {
  // TODO: qui devo passare i valori eventualmente presi da cmdline
let file = 'default.json';
let path = app.getPath('appData')+"/rotctlGUI/";

  // Read configuration file
  config.readConfigFile(path,file);
}



// "events" from rotctlProtocol dispatched to main window
exports.isConnected    = function (conn)  {winCompass.webContents.send('main_tx_conn',conn);};
exports.curAzimuth     = function (az)    {winCompass.webContents.send('main_tx_azimuth',az);};
exports.onTarget       = function ()      {winCompass.webContents.send('main_tx_target');};

/* Route Events received from main window */
ipcMain.on('rx_main_target',(event, value)    => {rotctlProtocol.setTarget(value);});  // user selected a targt
ipcMain.on('rx_main_turn',(event,value)       => {rotctlProtocol.turn(value);});       // user ask for CW, CCW rotation or stop
ipcMain.on('rx_main_openConfig',(event)       => {createWinCFG();});

// Events from config window
ipcMain.on('rx_config_cancel',(event)         => {winCFG.close()});
ipcMain.on('rx_config_save'  ,(event,cfg)     => {
  config.setAsJSONString(JSON.stringify(cfg));
  config.writeConfigFile()
  winCompass.reload();
  winCFG.close();
})


/* --------------------------------------------------------------------------------------------------------- */
/*                                        Module (private) functions                                         */
/* --------------------------------------------------------------------------------------------------------- */

function updateConfig() {}