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
 //
//const main              = require ('../../../main.js');

console.log(parent);


contextBridge.exposeInMainWorld('electronAPI', {
  rx_main_allconf:   (callback) => ipcRenderer.on('tx_allconf',(callback)),
  tx_cancel:         ()         => ipcRenderer.send('rx_config_cancel'),
  config_tx_save:    (cfg)      => ipcRenderer.send('main_rx_configSave',cfg),
  tx_getConfig:      ()         => ipcRenderer.send('main_rx_config_getConfig')
  /*
  compass_rx_version:      (callback) => ipcRenderer.on('main_tx_version',(callback)),
  compass_rx_stop:         (callback) => ipcRenderer.on('main_tx_stop',(callback)),
  compass_tx_target:       (az)       => ipcRenderer.send('main_rx_target',az),
  compass_tx_stopMotor:    ()         => ipcRenderer.send('main_rx_stopMotor'),
  compass_tx_turn:         (dir)      => ipcRenderer.send('main_rx_turn',dir)
*/
})
 
 
