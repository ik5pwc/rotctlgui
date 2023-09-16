/* --------------------------------------------------------------------------------------- 
 * File        : gui/config/js/events.js
 * Author      : Civinini Luca - IK5PWC
 *               luca@ik5pwc.it
 *               http://www.ik5pwc.it
 *
 * Description : Manage and attach events to html page
 * ---------------------------------------------------------------------------------------
*/


/* --------------------------------------------------------------------------------------------------------- */
/*                                        Event Handlers (from html)                                         /*
/* --------------------------------------------------------------------------------------------------------- */

/*------------------------------------------------------
 * Function: checkValues
 * -------------------------------
 * Attach listeners to HTML objects
 *
 * Invoked by:
 * . page onload           (gui/config/config.html)
 *
 * Called Sub/Functions: NONE
 *
 * Global variables used: NONE 
 * 
 * DOM items affected:
 * . save                  (gui/config/config.html)
 * . control passed ia obj parameter
 *  
 * Arguments:     window.electronAPI.tx_getConfig();
 */
function checkValues (obj) {
  let valid = null;    // Need a 3-state value. true removes error indicato, false enable error indicator and
                       // null leave error indicator as is (used when this function is applied to a field
                       // without any value constraint 
  let save = false;    // Save button is disabled

  // evaluate based on changed field 
  // fields having special restrictions 
  switch (obj.id) {
    case 'name'    : if (obj.value.length == 0) {valid = false;} else {valid = true;}; break;
    case 'filename': if (obj.value.length == 0) {valid = false;} else {valid = true;}; break;
    case 'port'    : if (! isNaN (obj.value) && obj.value > 1024 && obj.value < 49151) {valid=true; } else {valid = false; } ; break;    
    case 'polling' : if (! isNaN (obj.value) && obj.value > 199 && obj.value < 5001)  {valid = true; } else {valid = false; }; break;
    case 'error'   : if (! isNaN (obj.value) && obj.value < 20 && obj.value > 3) {valid=true; } else {valid = false; }       ; break;  
    case 'address' : 
      if (obj.value.length == 0) {
        valid = false;           // empty address field
      } else {
        let fqdnOrIp = obj.value.match(/^[a-z0-9]{1}[a-z0-9\-]{0,63}(\.[0-9a-z\-]{0,64}){0,}\.?$/i);

        // Address field is not a name or an iP
        if ( fqdnOrIp === null ) { valid = false;} else {valid = true;}
      }
      break;
  }

  // Apply error formatting to invalid values
  if (valid == false) { obj.classList.add("invalid");    } 
  if (valid == true ) { obj.classList.remove("invalid"); } 

  // Enable save if no error is present and at least one value has been modified
  if ( document.getElementsByClassName("error").length == 0 ) {
    if ( (document.getElementById('name').value != g_currentCFG.name )                ||
         (document.getElementById('address').value != g_currentCFG.address )          ||
         (document.getElementById('port').value != g_currentCFG.port )                ||
         (document.getElementById('polling').value != g_currentCFG.polling )          ||
         (document.getElementById('error').value != g_currentCFG.error )              ||
         (document.getElementById('filename').value != g_currentCFG.file )            ||
         (document.getElementById('stopS').checked && g_currentCFG.stop == 0)         ||
         (document.getElementById('stopN').checked && g_currentCFG.stop == 180)       ||
         (document.getElementById('rotctlgui').cheked && g_currentCFG.moveTo == 'Y' ) ||
         (document.getElementById('hamlib').checked && g_currentCFG.moveTo == 'N' )   
       ) {save = true;}

  }

  // enable/disable save button
  if (save) {document.getElementById("save").classList.remove("nosave");} 
  else      {document.getElementById("save").classList.add("nosave");}  
}



/*------------------------------------------------------
 * Function: save
 * -------------------------------
 * When saving data, build associative array and pass
 * to main process.
 * 
 * Invoked by:
 * . DOM                        (gui/config/config.html)
 *
 * Called Sub/Functions: 
 * .electronAPI.config_tx_save  (gui/config/js/preload_config.js)
 *
 * Global variables used: 
 * . g_currentCFG               (gui/config/js/config.js)
 * 
 * DOM items affected:
 * . name                       (gui/config/config.html)
 * . address                    (gui/config/config.html)
 * . port                       (gui/config/config.html)
 * . polling                    (gui/config/config.html)
 * . error                      (gui/config/config.html)
 * . stopN                      (gui/config/config.html)
 * . stopS                      (gui/config/config.html)
 * . rotctlgui                  (gui/config/config.html)
 * . hamlib                     (gui/config/config.html)
 * 
 *
 * Arguments: NONE
*/
function btnSave(btn) {
  // Save is performed only when something was changed
  if ( ! btn.classList.contains('nosave')) {
    // compute special fields
    let stopAt; 
    let pCommand;

    if (document.getElementById('stopN').checked ){stopAt = 0;} else {stopAt = 180;}
    if (document.getElementById('hamlib').checked ){pCommand = 'Y';} else {pCommand = 'N';}
                                        
    window.electronAPI.config_tx_save({ name   : document.getElementById('name').value ,
                                        address: document.getElementById('address').value,
                                        port   : document.getElementById('port').value,
                                        polling: document.getElementById('polling').value,
                                        error  : document.getElementById('error').value,
                                        stop   : stopAt,
                                        moveTo : pCommand,
                                        file   : document.getElementById('filename').value,
                                        path   : document.getElementById('filepath').innerHTML
                                      })
  }
}



/*------------------------------------------------------
 * Function: btnCancel
 * -------------------------------
 * Code executed when clicking cancel button
 * 
 * Invoked by:
 * . DOM                         (gui/config/config.html)
 *
 * Called Sub/Functions: 
 * .electronAPI.config_tx_cancel (gui/config/js/preload_config.js)
 *
 * Global variables used: NONE
 * . g_currentCFG               (gui/config/js/config.js)
 * 
 * DOM items affected:
 * . save                       (gui/config/config.html)
 *
 * Arguments: NONE
*/
function btnCancel () {
  // CHeck if save button is enable
  if (! document.getElementById("save").classList.contains("nosave") ) {
    // Some setting was changed, ask for confirmation
    if (!confirm("Discard changes? ") ) {return false;}
  }
  
  // Invoke window close (if not aborted before)
  window.electronAPI.tx_cancel();
}



/*------------------------------------------------------
 * Function:  switchHelp
 * -------------------------------
 * Close or switch help on/offWhen saving data, build associative array and pass
 * to main process.
 * 
 * Invoked by:
 * . DOM                        (gui/config/config.html)
 *
 * Called Sub/Functions: 
 * .electronAPI.config_tx_save  (gui/config/js/preload_config.js)
 *
 * Global variables used: 
 * . g_currentCFG               (gui/config/js/config.js)
 * 
 * DOM items affected:
 * . name                       (gui/config/config.html)
 * . address                    (gui/config/config.html)
 * . port                       (gui/config/config.html)
 * . polling                    (gui/config/config.html)
 * . error                      (gui/config/config.html)
 * . stopN                      (gui/config/config.html)
 * . stopS                      (gui/config/config.html)
 * . rotctlgui                  (gui/config/config.html)
 * . hamlib                     (gui/config/config.html)
 * 
 *
 * Arguments: NONE
*/
function switchHelp (help) {
  let id = document.getElementById(help);
  if ( id.classList.contains("hidden") ) {id.classList.remove("hidden"); } else {id.classList.add("hidden");}
}

/* --------------------------------------------------------------------------------------------------------- */
/*                                        Event Handlers (from node)                                         /*
/* --------------------------------------------------------------------------------------------------------- */

/*------------------------------------------------------
 * config_rx_allconf
 * -------------------------------
 * Populate GUI items with current configured values.
 * 
 * Invoked by:
 * . electronAPI                (gui/config/js/ipc-render-main.js)
 *
 * Called Sub/Functions: NONE
 *
 * Global variables used: 
 * . g_currentCFG               (gui/config/js/config.js)
 * 
 * DOM items affected:
 * . name                       (gui/config/config.html)
 * . address                    (gui/config/config.html)
 * . port                       (gui/config/config.html)
 * . polling                    (gui/config/config.html)
 * . error                      (gui/config/config.html)
 * . stopN                      (gui/config/config.html)
 * . stopS                      (gui/config/config.html)
 * . rotctlgui                  (gui/config/config.html)
 * . hamlib                     (gui/config/config.html)
 * 
 *
 * Arguments: NONE
*/

window.electronAPI.rx_main_allconf((_event,array) => {

  g_currentCFG.name = array.name;
  document.getElementById("name").value = g_currentCFG.name;

  g_currentCFG.address = array.address;
  document.getElementById("address").value= g_currentCFG.address;

  g_currentCFG.port = array.port;
  document.getElementById("port").value= g_currentCFG.port;

  g_currentCFG.polling = array.polling;
  document.getElementById("polling").value = g_currentCFG.polling;

  g_currentCFG.error = array.error;
  document.getElementById("error").value = g_currentCFG.error;

  g_currentCFG.stop = array.stop;
  if (array.stop == 180) {document.getElementById("stopS").checked=true;} else {document.getElementById("stopN").checked=true;}

  g_currentCFG.moveTo = array.moveTo;
  if (array.moveTo == 'Y') {document.getElementById("hamlib").checked=true;} else {document.getElementById("rotctlgui").checked=true;}

  g_currentCFG.file = array.file;
  document.getElementById("filename").value = g_currentCFG.file;

  g_currentCFG.path = array.path;
  document.getElementById("filepath").innerHTML = g_currentCFG.path;
});
