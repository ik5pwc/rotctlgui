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
  getConfig:         (callback) => ipcRenderer.on('main_tx_sendConfig',(callback)),       // FROM nodejs processes to populate GUI with current config
  cancelConfig:      ()         => ipcRenderer.send('config_tx_cancelConfig'),           // FROM renderer (config.html) when hitting cancel button 
  saveConfig:        (cfg)      => ipcRenderer.send('config_tx_saveConfig',cfg)          // FROM renderer (config.html) when hitting save button
})
 
 
