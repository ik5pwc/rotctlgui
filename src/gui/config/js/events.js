/* --------------------------------------------------------------------------------------- 
 * File        : gui/config/js/events.js
 * Author      : Civinini Luca - IK5PWC
 *               luca@ik5pwc.it
 *               http://www.ik5pwc.it
 *
 * Description : Manage and attach events to html page
 * ---------------------------------------------------------------------------------------
*/


/*------------------------------------------------------
 * Function: addListeners
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
 * . port                  (gui/config/config.html)
 * . polling               (gui/config/config.html)
 * . error                 (gui/config/config.html)
 * . name                  (gui/config/config.html)
 * . filename              (gui/config/config.html)
 * . address               (gui/config/config.html)
 * . stopN                 (gui/config/config.html)
 * . stopS                 (gui/config/config.html)
 * . hamlib                (gui/config/config.html)
 * . rotctlgui             (gui/config/config.html)
 * 
 * Arguments: NONE
*/
function addListeners() {

  document.getElementById("port").addEventListener("keyup",(ev) => {checkValues(ev.srcElement)});
  document.getElementById("polling").addEventListener("keyup",(ev) => {checkValues(ev.srcElement)});
  document.getElementById("error").addEventListener("keyup",(ev) => {checkValues(ev.srcElement)});
  document.getElementById('name').addEventListener("keyup",(ev) => {checkValues(ev.srcElement)});
  document.getElementById('filename').addEventListener("keyup",(ev) => {checkValues(ev.srcElement)});
  document.getElementById('address').addEventListener("keyup",(ev) => {checkValues(ev.srcElement)});
  document.getElementById('stopN').addEventListener("change",(ev) => {checkValues(ev.srcElement)});
  document.getElementById('stopS').addEventListener("change",(ev) => {checkValues(ev.srcElement)});
  document.getElementById('rotctlgui').addEventListener("change",(ev) => {checkValues(ev.srcElement)});
  document.getElementById('hamlib').addEventListener("change",(ev) => {checkValues(ev.srcElement)});
  document.getElementById('cancel').addEventListener("click",(ev) => {window.electronAPI.config_tx_cancel();});
  document.getElementById('save').addEventListener("click",(ev) => {save(ev.srcElement);});

}



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
 * Arguments: 
 * . obj : DOM object raising the event
*/
function checkValues (obj) {
  let valid = null;    // Need a 3-state value. true removes error indicato, false enable error indicator and
                       // null leave error indicator as is (used when this function is applied to a field
                       // without any value constraint 
  let save = false;    // Save button is disabled

  // evaluate based on changed field 
  // fields having special restrictions 
  switch (obj.id) {
    case 'port' : 
      if (! isNaN (obj.value) && obj.value > 1024 && obj.value < 49151) {valid=true; } else {valid = false; }
      //if (valid && obj.value != g_currentCFG.port)    {save=true; } 
      break;    

    case 'polling' : 
      if (! isNaN (obj.value) && obj.value > 200 && obj.value < 9999)  {valid = true; } else {valid = false; }
      //if (valid && obj.value != g_currentCFG.polling) {save = true;}
      break;

    case 'error' : 
      if (! isNaN (obj.value) && obj.value < 20 && obj.value > 3) {valid=true; } else {valid = false; }
      //if (valid && obj.value != g_currentCFG.error) {save=true}; 
      break;  
  }

  // Apply error formatting to invalid values
  if (valid == false) { obj.classList.add("error");    } 
  if (valid == true ) { obj.classList.remove("error"); } 

  // Enable save if no error is present and at least one value has been modified
  if ( document.getElementsByClassName("error").length == 0 ) {
    if ( (document.getElementById('name').value != g_currentCFG.name )                ||
         (document.getElementById('address').value != g_currentCFG.address )          ||
         (document.getElementById('port').value != g_currentCFG.port )                ||
         (document.getElementById('polling').value != g_currentCFG.polling )          ||
         (document.getElementById('error').value != g_currentCFG.error )              ||
         (document.getElementById('filename').value != g_currentCFG.file )            ||
         (document.getElementById('stopS').checked && g_currentCFG.stop == 'N')       ||
         (document.getElementById('stopN').checked && g_currentCFG.stop == 'S')       ||
         (document.getElementById('rotctlgui').cheked && g_currentCFG.moveTo == 'Y' ) ||
         (document.getElementById('hamlib').checked && g_currentCFG.moveTo == 'N' )   
       ) {save = true;}

  }

  // enable/disable save button
  if (save) {document.getElementById("save").classList.remove("nosave");} else {document.getElementById("save").classList.add("nosave");}  
}


function save(obj) {

  // Action is performed only if save button is enable
  if ( ! obj.classList.contains("nosave")) {
    // compute special fields
    let stopAt; 
    let pCommand;

    if (document.getElementById('stopN').checked ){stopAt = 'N';} else {stopAt = 'S';}
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

/* --------------------------------------------------------------------------------------------------------- */
/*                                        Event Handlers (from node)                                         /*
/* --------------------------------------------------------------------------------------------------------- */

/*------------------------------------------------------
 * Multiple config_rx_allconf
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

window.electronAPI.config_rx_allconf((_event,array) => {

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
  if (array.stop == 'S') {document.getElementById("stopS").checked=true;} else {document.getElementById("stopN").checked=true;}

  g_currentCFG.moveTo = array.moveTo;
  if (array.moveTo == 'Y') {document.getElementById("hamlib").checked=true;} else {document.getElementById("rotctlgui").checked=true;}

  g_currentCFG.file = array.file;
  document.getElementById("filename").value = g_currentCFG.file;

  g_currentCFG.path = array.path;
  document.getElementById("filepath").innerHTML = g_currentCFG.path;
});
