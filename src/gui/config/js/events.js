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
 *
 * Arguments: NONE
*/
function addListeners() {

  document.getElementById("port").addEventListener("keyup",(ev) => {checkValue(ev.srcElement)});
  document.getElementById("polling").addEventListener("keyup",(ev) => {checkValue(ev.srcElement)});
  document.getElementById("error").addEventListener("keyup",(ev) => {checkValue(ev.srcElement)});
  
}



/* --------------------------------------------------------------------------------------------------------- */
/*                                        Event Handlers (from html)                                         /*
/* --------------------------------------------------------------------------------------------------------- */


function checkValue (obj) {
  let valid = false;

  switch (obj.id) {
    case 'port'   : if (! isNaN (obj.value) && obj.value > 1024 && obj.value < 49151) {valid=true;}; break;
    case 'polling': if (! isNaN (obj.value) && obj.value > 200 && obj.value < 9999)   {valid=true;}; break;
    case 'error'  : if (! isNaN (obj.value) && obj.value < 20 && obj.value > 3) {valid=true;}  ; break;  
  }

  if (valid) {
    obj.classList.remove("error");
  } else {
    obj.classList.add("error");
  } 
}

/* --------------------------------------------------------------------------------------------------------- */
/*                                        Event Handlers (from node)                                         /*
/* --------------------------------------------------------------------------------------------------------- */

/*------------------------------------------------------
 * Multiple functions populating GUI with configured items
 * -------------------------------
 *
 * Invoked by:
 * . electronAPI                (gui/config/js/ipc-render-main.js)
 *
 * Called Sub/Functions: NONE
 *
 * Global variables used: NONE
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
