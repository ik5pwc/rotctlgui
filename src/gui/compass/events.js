/* --------------------------------------------------------------------------------------- 
 * File        : gui/compass/js/events.js
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
 * Attach listeners to gauge object
 *
 * Invoked by:
 * . startCompass           (gui/compass/js/compass.js)
 *
 * Called Sub/Functions: NONE
 *
 * Global variables used: NONE 
 * 
 * DOM items affected:
 * . compass                (gui/compass/main.html)
 *
 * Arguments: NONE
*/
function addListeners() {
  // Compass object
  const compass = document.getElementById("compass");

  compass.addEventListener("mousemove", (event) => { compassMouseMove(event.layerX, event.layerY); }, false,);
  compass.addEventListener("mouseout", (event) => { compassMouseMove(event.layerX, event.layerY); }, false,);
  compass.addEventListener("click", () => { compassLeftClick(); }, false);
  compass.addEventListener("contextmenu", (e) => { e.preventDefault(); compassRightClick(); }, false);
}



/* --------------------------------------------------------------------------------------------------------- */
/*                                        Event Handlers (from html)                                         /*
/* --------------------------------------------------------------------------------------------------------- */

/*------------------------------------------------------
 * Function: compassMouseMove
 * -------------------------------
 * Invoked when mouse moves over compass DIV
 *
 * Invoked by:
 * . event Lisenter             (gui/compass/js/events.js)
 *
 * Called Sub/Functions: 
 * . evalPresetAngle            (gui/compass/js/compass.js)
 * . managePresetGUI            (gui/compass/js/compass.js)
 *
 * Global variables used:
 * . g_gui                      (gui/compass/js/compass.js)
 *
 * Arguments:
 * . mouseX, mouseY: mouse position relative to compass DIV
*/
function compassMouseMove(mouseX, mouseY) {
  if (g_gui.connected) {
    evalPresetAngle(mouseX, mouseY);
    managePresetGUI();
  }
}



/*------------------------------------------------------
* Function: compassLeftClick
* -------------------------------
* Invoked on left click on compass DIV
*
* Invoked by:
* . event Listenter                    (gui/compass/js/events.js)
*
* Called Sub/Functions: 
* . managePresetGUI                    (gui/compass/js/compass.js)
* . electronAPI.setTarget              (gui/compass/js/ipc-render-main.js)
*
* Global variables used:
* . g_gui                              (gui/compass/js/compass.js)
*
* Arguments: NONE
*/
function compassLeftClick() {
  if (g_gui.connected && g_gui.presetNew != null) {
    g_gui.presetCur = g_gui.presetNew;
    managePresetGUI();
    window.electronAPI.setTarget(g_gui.presetCur);
  }
}



/*------------------------------------------------------
 * Function: compassRightClick
 * -------------------------------
 * Invoked on right click on compass DIV
 *
 * Invoked by:
 * . event Listenter                       (gui/compass/js/events.js)
 *
 * Called Sub/Functions: 
 * . managePresetGUI                       (gui/compass/js/compass.js)
 * . electronAPI.compass_tx_stopMotor      (gui/compass/js/ipc-render-main.js)
 *
 * Global variables used:
 * . g_gui                                 (gui/compass/js/compass.js)
 *
 * Arguments: NONE
*/
function compassRightClick() {
  if (g_gui.connected) {
    g_gui.presetCur = null;
    g_gui.presetNew = null;
    window.electronAPI.turn("S");
    managePresetGUI();
  }
}



/*------------------------------------------------------
 * Function: releaseButton
 * -------------------------------
 * Invoked when CW or CCW button is being released
 *
 * Invoked by:
 * . event Listenter                   (gui/compass/main.html)
 *
 * Called Sub/Functions: 
 * . electronAPI.compass_tx_stopMotor  (gui/compass/js/ipc-render-main.js)
 *
 * Global variables used: NONE
 *
 * Arguments: 
 * . obj: is the HTML object triggering the event
*/
function releaseButton(obj) {
  obj.classList.remove('push');
  window.electronAPI.turn("S");
}



/*------------------------------------------------------
 * Function: pushButton
 * -------------------------------
 * Invoked when CW or CCW button is being released
 *
 * Invoked by:
 * . event Listenter                (gui/compass/main.html)
 *
 * Called Sub/Functions: 
 * . electronAPI.turn               (gui/compass/js/compass_preload.js)
 *
 * Global variables used: 
 * . g_gui                           (gui/compass/js/compass.js)
 *
 * Arguments: 
 * . obj: is the HTML object triggering the event
*/
function pushButton(obj) {
  if (g_gui.connected) {
    obj.classList.add('push');
    window.electronAPI.turn(obj.innerHTML)
  }
}



/* --------------------------------------------------------------------------------------------------------- */
/*                                        Event Handlers (from node)                                         /*
/* --------------------------------------------------------------------------------------------------------- */

/*------------------------------------------------------
 * Function: window.electronAPI.connected
 * -------------------------------
 * Perform GUI changes when connected or disconnected to rotctld
 *
 * Invoked by:
 * . electronAPI IPC            (gui/compass/js/preload_compass.js)
 *
 * Called Sub/Functions: NONE
 *
 * Global variables used:
 * . g_gui                      (gui/compass/js/compass.js)
 * 
 * DOM items affected:
 * . degree                     (gui/compass/compass.html)
 *
 * Arguments: NONE
*/
window.electronAPI.connected((_event, conn) => {
  if (conn) {
    g_gui.connected = true;
    document.getElementById("degree").classList.remove('off');
    document.getElementById("degree").classList.add('on');
  } else {
    g_gui.connected = false;
    document.getElementById("degree").classList.remove('on');
    document.getElementById("degree").classList.add('off');
  }
});





/*------------------------------------------------------
 * Function: window.electronAPI.getPosition
 * -------------------------------
 * received current position
 *
 * Invoked by:
 * . electronAPI  IPC           (gui/compass/js/preload_compass.js)
 *
 * Called Sub/Functions: 
 * . updateCompass              (gui/compass/js/compass.js)
 *
 * Global variables used: NONE
 * 
 * DOM items affected: NONE
 *
 * Arguments: NONE
*/
window.electronAPI.getPosition((_event, value) => { updateCompass(value); });



/*------------------------------------------------------
 * Function: window.electronAPI.targetReached
 * -------------------------------
 * Target reached
 *
 * Invoked by:
 * . electronAPI   IPC          (gui/compass/js/preload_compass.js)
 *
 * Called Sub/Functions: 
 * . managePresetGUI            (gui/compass/js/compass.js)
 *
 * Global variables used:
 * . g_gui                      (gui/compass/js/compass.js)
 *
 * DOM items affected: NONE
 *
 * Arguments: NONE
*/
window.electronAPI.targetReached((_event) => {
  g_gui.presetCur = null;
  managePresetGUI();
});



/*------------------------------------------------------
 * Function: compass_rx_misc
 * -------------------------------
 * Receives multiple information from main and 
 * configure item in GUI
 *
 * Invoked by:
 * . electronAPI                (gui/compass/js/ipc-render-main.js)
 *
 * Called Sub/Functions: NONE 
 *
 * Global variables used: NONE
 *
 * DOM items affected:
 * . version                    (gui/compass/compass.html)
 * . title
 * . stopSouth
 * . stopNorth
 *
 * Arguments: NONE
*/
window.electronAPI.getConfig((_event, configAsJSONString, version) => {
  
  // Parse JSON configuration string
  let configJSON = JSON.parse(configAsJSONString);
  console.log(configJSON);
  // version
  document.getElementById("version").innerHTML = "rotctlGUI v. " + version.toString() ;
  setOverlayDiv();

  if (configJSON.stop === 0) { document.getElementById("stopSouth").style.visibility = 'hidden'; document.getElementById("stopSouth").style.height = '0px'; }
  else { document.getElementById("stopNorth").style.visibility = 'hidden'; document.getElementById("stopNorth").style.height = '0px'; } ;

  document.getElementById("title").innerHTML = configJSON.name.substring(0, 20);
  document.title = configJSON.name.substring(0, 20) + " (rotcctlGUI)";
});
