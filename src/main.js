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
    webPreferences: { preload: path.join(__dirname, 'gui/compass/js/preload.js')
    }
  })
  
  mainWin.loadFile('gui/compass/main.html')
  mainWin.webContents.on('did-finish-load',() => {rotctlProtocol.connect(); mainWin.webContents.send('setTitle',"pppp");});
}

app.whenReady().then(() => { createWindow()});




/* -------------------------- */
/*       Event Receivers      */
/* -------------------------- */
globalEmitter.on('connected', ()      => {mainWin.webContents.send('connected');    });
globalEmitter.on('disconnected', ()   => {mainWin.webContents.send('disconnected'); });
globalEmitter.on('azimuth', (value)   => {mainWin.webContents.send('azimuth',value);});
globalEmitter.on('onTarget',(value)   => {mainWin.webContents.send('target',value);});
ipcMain.on('main_setTarget',(event, value) => {rotctlProtocol.pointTo(value);});
ipcMain.on('main_turn',(event,value)       => {rotctlProtocol.turn(value);});
ipcMain.on('main_stopMotor',(event)        => {rotctlProtocol.stopMotor();});





