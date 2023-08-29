 /* --------------------------------------------------------------------------------------- 
 * File        : gui/config/js/ipc-render-main.js
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
  config_rx_allconf:       (callback) => ipcRenderer.on('main_tx_allconf',(callback)),
  config_tx_cancel:        ()         => ipcRenderer.send('main_rx_configCancel'),
  config_tx_save:          (cfg)      => ipcRenderer.send('main_rx_configSave',cfg)
  /*
  compass_rx_version:      (callback) => ipcRenderer.on('main_tx_version',(callback)),
  compass_rx_stop:         (callback) => ipcRenderer.on('main_tx_stop',(callback)),
  compass_tx_target:       (az)       => ipcRenderer.send('main_rx_target',az),
  compass_tx_stopMotor:    ()         => ipcRenderer.send('main_rx_stopMotor'),
  compass_tx_turn:         (dir)      => ipcRenderer.send('main_rx_turn',dir)
*/
})
 
 
