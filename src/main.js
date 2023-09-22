const { app, BrowserWindow,ipcMain, dialog } = require('electron')
const myClasses          = require('./myclasses.js');
const path               = require('path')
const rotctlProtocol     = require('./rotctlProtocol.js');
const config             = require('./configFile.js');





let mainWin;
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
  mainWin = new BrowserWindow({
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

  mainWin.loadFile('gui/compass/compass.html')
  
  mainWin.webContents.on('did-finish-load',() => {
    
    // mainWin.removeMenu();       // Remove standard menu 
    rotctlProtocol.connect();      // start connection
    
    // send command to update window info
    mainWin.webContents.send('main_tx_misc',config.name,config.stop,VERSION);
  });
}

const createWinCFG = () => {
  winCFG = new BrowserWindow({
    frame: true,
    width: 345,
    height: 570,
    resizable: false,
    autoHideMenuBar: false,
    parent: mainWin,
    modal:true,
    menuBarVisible:true,
    frame:false,
    icon: 'i',
    fullscreenable: false,
    webPreferences: { preload: path.join(__dirname, 'gui/config/js/preload_config.js')}
  })
  
  winCFG.loadFile('gui/config/config.html')

  winCFG.webContents.on('did-finish-load',()  => {

    // Send current configuration
    winCFG.send('tx_allconf', config.exportAsJSON());
/*
    winCFG.send('tx_allconf',{ name   : config.name,
                               address: config.address,
                               port   : config.port,
                               polling: config.polling,
                               error  : config.error,
                               stop   : config.stop,
                               moveTo : config.moveTo,
                               file   : config.file,
                               path   : config.path 
                             }) */
  })
  
}

app.whenReady().then(() => { createWinMAIN()});




function readConfiguration() {
  // TODO: qui devo passare i valori eventualmente presi da cmdline
let file = 'default.json';
let path = app.getPath('appData')+"/rotctlGUI/";

  // Read configuration file
  config.readConfigFile(path,file);
  
  // Export configuration to network connection module
  //rotctlProtocol.setConfig(configuration);
}



// "events" from rotctlProtocol dispatched to main window
exports.isConnected    = function (conn)  {mainWin.webContents.send('main_tx_conn',conn);};
exports.curAzimuth     = function (az)    {mainWin.webContents.send('main_tx_azimuth',az);};
exports.onTarget       = function ()      {mainWin.webContents.send('main_tx_target');};

/* Route Events received from main window */
ipcMain.on('main_rx_target',(event, value)    => {rotctlProtocol.setTarget(value);});  // user selected a targt
ipcMain.on('main_rx_turn',(event,value)       => {rotctlProtocol.turn(value);});       // user ask for CW, CCW rotation or stop
ipcMain.on('main_rx_openConfig',(event)       => {createWinCFG();});

// Events from config window
ipcMain.on('rx_config_cancel',(event)         => {winCFG.close()});
ipcMain.on('main_rx_configSave',(event,cfg)   => {
  config.importAsJSON(cfg);
  readConfiguration();
  mainWin.reload();
  winCFG.close();

})


/* --------------------------------------------------------------------------------------------------------- */
/*                                        Module (private) functions                                         */
/* --------------------------------------------------------------------------------------------------------- */

function updateConfig() {}