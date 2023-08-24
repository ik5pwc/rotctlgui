const { app, BrowserWindow } = require('electron')
const { ipcMain }            = require('electron'); 
const { globalEmitter }      = require('./node_events.js');
const path                   = require('path')
const rotctlProtocol = require('./rotctlProtocol.js');
const configFile     = require('./configFile.js');


let mainWin;
 

// Read configuration file
configFile.readConfig(app.getPath('appData')+"/rotctlGUI");

rotctlProtocol.setAddress(configFile.getAddress);
rotctlProtocol.setPort(configFile.getPort);
rotctlProtocol.setPolling(configFile.getPolling);
rotctlProtocol.setminSkew(configFile.getminSkew);
if (configFile.getminSkew == 'S')       {rotctlProtocol.setSouthStop(true);} else {rotctlProtocol.setSouthStop(false);}
if (configFile.getMoveSupported == 'Y') {rotctlProtocol.setMoveTO(true);}    else {rotctlProtocol.setMoveTo(false);}



//TODO: protocol errors
// TODO: logging avanzato
// TODO: command line
//TODO config window
//TODO help (punta su github)

const createWindow = () => {
  mainWin = new BrowserWindow({
    width: 320,
    height: 400,
    resizable: false,
    autoHideMenuBar: true,
    fullscreenable: false,
    webPreferences: { preload: path.join(__dirname, 'gui/compass/js/ipc-render-main.js')
    }
  })
  
  mainWin.loadFile('gui/compass/compass.html')
  mainWin.webContents.on('did-finish-load',() => {
    rotctlProtocol.connect(); 
    mainWin.webContents.send('main_tx_title',configFile.getName().substring(0,20));
    mainWin.webContents.send('main_tx_setStop',"S");
  });
}

app.whenReady().then(() => { createWindow()});

/*
console.log(app.getPath('appData') + "/rotctlgui/default.json");

if (!fs.existsSync(app.getPath('appData') + "/rotctlGUI")) {fs.mkdirSync(app.getPath('appData') + "/rotctlGUI");};




let rawdata = fs.readFileSync('student.json');
let student = JSON.parse(rawdata);
console.log(student);
*/

/* -------------------------- */
/*       Event Receivers      */
/* -------------------------- */
/* Route Events from rotctlProtocol to main window */
globalEmitter.on('rotctlProtocol_tx_conn', (value)    => {mainWin.webContents.send('main_tx_conn',value); });
globalEmitter.on('rotctlProtocol_tx_azimuth', (value) => {mainWin.webContents.send('main_tx_azimuth',value);});
globalEmitter.on('rotctlProtocol_tx_onTarget',(value) => {mainWin.webContents.send('main_tx_target',value);});


ipcMain.on('main_rx_setTarget',(event, value) => {rotctlProtocol.setTarget(value);});
ipcMain.on('main_rx_turn',(event,value)       => {rotctlProtocol.turn(value);});
ipcMain.on('main_rx_stopMotor',(event)        => {rotctlProtocol.stop();});





