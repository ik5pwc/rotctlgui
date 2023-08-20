 /* --------------------------------------------------------------------------------------- 
 * File        : gui/compass/js/preload.js
 * Author      : Civinini Luca - IK5PWC
 *               luca@ik5pwc.it
 *               http://www.ik5pwc.it
 *
 * Description : Interface between main process and renderer process
 * ---------------------------------------------------------------------------------------
*/

 // include the ipc module to communicate with main process.
 const { contextBridge, ipcRenderer } = require('electron'); 


contextBridge.exposeInMainWorld('electronAPI', {
  onConnected:  (callback) => ipcRenderer.on('connected',(callback)),
  onDisconnect: (callback) => ipcRenderer.on('disconnected',(callback)),
  onAzimuth:    (callback) => ipcRenderer.on('azimuth',(callback)),
  onTarget:     (callback) => ipcRenderer.on('target',(callback)),
  setTarget:    (az)       => ipcRenderer.send('setTarget',az),
  stopMotor:    ()         => ipcRenderer.send('stopMotor')
})
 
 
