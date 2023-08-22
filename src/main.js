const { app, BrowserWindow } = require('electron')
const { ipcMain }            = require('electron'); 
const { globalEmitter }      = require('./node_events.js');
const path                   = require('path')
const rotctlProtocol = require('./rotctlProtocol.js');

let mainWin;
 

rotctlProtocol.setAddress("civiwks002.local");
rotctlProtocol.setPolling(300);
rotctlProtocol.setPort(5002);
rotctlProtocol.setSouthStop(true);
rotctlProtocol.setminSkew(5);


const createWindow = () => {
  mainWin = new BrowserWindow({
    width: 320,
    height: 400,
    resizable: false,
    fullscreenable: false,
    webPreferences: { preload: path.join(__dirname, 'gui/compass/js/ipc-render-main.js')
    }
  })
  
  mainWin.loadFile('gui/compass/compass.html')
  mainWin.webContents.on('did-finish-load',() => {
    rotctlProtocol.connect(); 
    mainWin.webContents.send('main_tx_title',"pppp   pppp oooo ll k h kjhk jhkjh ".substring(0,20));
    mainWin.webContents.send('main_tx_setStop',"S");
  });
}

app.whenReady().then(() => { createWindow()});




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





