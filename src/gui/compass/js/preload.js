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
  setTitle:     (callback) => ipcRenderer.on('setTitle',(callback)),
  render_setTarget:    (az)       => ipcRenderer.send('main_setTarget',az),
  render_stopMotor:    ()         => ipcRenderer.send('main_stopMotor'),
  render_turn:         (dir)      => ipcRenderer.send('main_turn',dir)
})
 
 
