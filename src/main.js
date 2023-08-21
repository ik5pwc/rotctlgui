const { app, BrowserWindow } = require('electron')
const { ipcMain }     	= require('electron'); // include the ipc module to communicate with render process ie to receive the message from render process
const { globalEmitter } = require('./node_events.js');

const path = require('path')
const rotctlProtocol = require('./rotctlProtocol.js');

let mainWin;
 


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
  mainWin.webContents.on('did-finish-load',() => {rotctlProtocol.connect()});
}

app.whenReady().then(() => { createWindow()});




/* -------------------------- */
/*       Event Receivers      */
/* -------------------------- */
globalEmitter.on('connected', ()      => {mainWin.webContents.send('connected');    });
globalEmitter.on('disconnected', ()   => {mainWin.webContents.send('disconnected'); });
globalEmitter.on('azimuth', (value)   => {mainWin.webContents.send('azimuth',value);});
globalEmitter.on('onTarget',(value)   => {mainWin.webContents.send('target',value);});
ipcMain.on('setTarget',(event, value) => {rotctlProtocol.pointTo(value);});
ipcMain.on('turn',(event,value)       => {rotctlProtocol.turn(value);});
ipcMain.on('stopMotor',(event)        => {rotctlProtocol.stopMotor();});





