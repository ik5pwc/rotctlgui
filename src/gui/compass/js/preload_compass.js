 /* --------------------------------------------------------------------------------------- 
 * File        : gui/compass/js/ipc-render-main.js
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
  compass_rx_conn:         (callback) => ipcRenderer.on('main_tx_conn',(callback)),
  compass_rx_azimuth:      (callback) => ipcRenderer.on('main_tx_azimuth',(callback)),
  compass_rx_target:       (callback) => ipcRenderer.on('main_tx_target',(callback)),
  compass_rx_misc:         (callback) => ipcRenderer.on('main_tx_misc',(callback)),
  compass_tx_target:       (az)       => ipcRenderer.send('main_rx_target',az),
  compass_tx_turn:         (dir)      => ipcRenderer.send('main_rx_turn',dir),
  compass_tx_openConfig:   ()         => ipcRenderer.send('main_rx_openConfig')
})
 
 
