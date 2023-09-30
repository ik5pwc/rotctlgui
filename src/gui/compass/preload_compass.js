 /* --------------------------------------------------------------------------------------- 
 * File        : gui/compass/preload_compass.js
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
  connected:     (callback) => ipcRenderer.on('main_tx_connected',(callback)),  // IPC Message: connection status  
  getPosition:   (callback) => ipcRenderer.on('main_tx_azimuth',(callback)),    // IPC Message: current position
  targetReached: (callback) => ipcRenderer.on('main_tx_ontarget',(callback)),   // IPC Message: required target reached
  getConfig:     (callback) => ipcRenderer.on('main_tx_config',(callback)),     // IPC Message: current configuration
  setTarget:     (az)       => ipcRenderer.send('compass_tx_target',az),        // IPC Message: request to move to target
  turn:          (dir)      => ipcRenderer.send('compass_tx_turn',dir),         // IPC Message: rotate CW, CCW or stop
  openConfig:    ()         => ipcRenderer.send('compass_tx_openConfig')        // IPC Message: open configuration window
})
 
 
