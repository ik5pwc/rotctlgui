const { app, BrowserWindow } = require('electron')
const { ipcMain }            = require('electron'); 
const { globalEmitter }      = require('./node_events.js');
const path                   = require('path')
const rotctlProtocol         = require('./rotctlProtocol.js');
const configFile             = require('./configFile.js');


let mainWin;
let winCFG;



const VERSION = "0.9"

readConfiguration();

//TODO: protocol errors
// TODO: logging avanzato
// TODO: command line per prendere il nome del file di configurazione
//TODO config window
//TODO help (punta su github)
// todo: disattivare scrolling
// todo: la config deve essere modale


const createWinMAIN = () => {
  mainWin = new BrowserWindow({
    width: 320,
    height: 365,
    resizable: false,
    autoHideMenuBar: false,
    menuBarVisible:false,
    icon: 'icon.png',
    fullscreenable: false,
    webPreferences: { preload: path.join(__dirname, 'gui/compass/js/ipc-render-main.js')
    }
  })

  mainWin.loadFile('gui/compass/compass.html')
  mainWin.webContents.on('did-finish-load',() => {

    rotctlProtocol.connect(); 
    mainWin.webContents.send('main_tx_title',configFile.getName().substring(0,20));
    mainWin.webContents.send('main_tx_stop',"S");
    mainWin.webContents.send('main_tx_version',"rotctlGUI ver. " + VERSION);
  });
}

const createWinCFG = () => {
  winCFG = new BrowserWindow({
    frame: true,
    width: 350,
    height: 750,
    resizable: false,
    autoHideMenuBar: false,
    menuBarVisible:true,
    icon: 'i',
    fullscreenable: false,
    webPreferences: { preload: path.join(__dirname, 'gui/config/js/ipc-render-main.js')}
  })
  winCFG.loadFile('gui/config/config.html')
  
  winCFG.webContents.on('did-finish-load',()  => {
    winCFG.send('main_tx_name',configFile.getName());
    
    winCFG.send('main_tx_allconf',{ name   : configFile.getName() ,
                                    address: configFile.getAddress(),
                                    port   : configFile.getPort(),
                                    polling: configFile.getPolling(),
                                    error  : configFile.getminSkew(),
                                    stop   : configFile.getStop(),
                                    moveTo : configFile.getMoveSupported(),
                                    file   : configFile.getConfigFile(),
                                    path : configFile.getConfigPath() 
                                  }) 
    /*
    winCFG.send('main_tx_address',configFile.getAddress());
    winCFG.send('main_tx_port',configFile.getPort());
    winCFG.send('main_tx_polling',configFile.getPolling());
    winCFG.send('main_tx_maxerror',configFile.getminSkew());
    winCFG.send('main_tx_stop',configFile.getStop());
    winCFG.send('main_tx_pcomman',configFile.getMoveSupported());
    winCFG.send('main_tx_filename',configFile.getConfigFile());
    winCFG.send('main_tx_filepath',configFile.getConfigPath());
    */
    /*config_rx_pcommand:      (callback) => ipcRenderer.on('main_tx_pcommand',(callback)),    
    config_rx_filename:      (callback) => ipcRenderer.on('main_tx_filename',(callback))
  */
  })
}

app.whenReady().then(() => { createWinMAIN()});
app.whenReady().then(() => { createWinCFG()});






function readConfiguration() {

  // Read configuration file
  configFile.readConfigFile(app.getPath('appData')+"/rotctlGUI/default.json");

  // export configuration
  rotctlProtocol.setAddress(configFile.getAddress());
  rotctlProtocol.setPort(configFile.getPort());
  rotctlProtocol.setPolling(configFile.getPolling());
  rotctlProtocol.setminSkew(configFile.getminSkew());
  if (configFile.getStop() == 'S')             {rotctlProtocol.setSouthStop(true);} else {rotctlProtocol.setSouthStop(false);}
  if (configFile.getMoveSupported() == 'Y') {rotctlProtocol.setMoveTO(true);}    else {rotctlProtocol.setMoveTo(false);}
}


/* -------------------------- */
/*       Event Receivers      */
/* -------------------------- */
/* Route Events from rotctlProtocol to main window */
globalEmitter.on('rotctlProtocol_tx_conn', (value)    => {mainWin.webContents.send('main_tx_conn',value); });
globalEmitter.on('rotctlProtocol_tx_azimuth', (value) => {mainWin.webContents.send('main_tx_azimuth',value);});
globalEmitter.on('rotctlProtocol_tx_onTarget',(value) => {mainWin.webContents.send('main_tx_target',value);});


ipcMain.on('main_rx_target',(event, value)    => {rotctlProtocol.setTarget(value);});
ipcMain.on('main_rx_turn',(event,value)       => {rotctlProtocol.turn(value);});
ipcMain.on('main_rx_stopMotor',(event)        => {rotctlProtocol.stop();});





