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
  rx_main_allconf:   (callback) => ipcRenderer.on('tx_allconf',(callback)),       // FROM nodejs processes to populate GUI with current config
  tx_cancel:         ()         => ipcRenderer.send('rx_config_cancel'),          // FROM renderer (config.html) when hitting cancel button 
  config_tx_save:    (cfg)      => ipcRenderer.send('main_rx_configSave',cfg)     // FROM renderer (config.html) when hitting save button
})
 
 
