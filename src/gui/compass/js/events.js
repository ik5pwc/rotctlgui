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
 * Attach listeners to HTML objects
 *
 * Invoked by:
 * . startApp               (gui/compass/js/compass.js)
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
  
  compass.addEventListener( "mousemove",(event) => {compassMouseMove(event.layerX,event.layerY);}, false,);
  compass.addEventListener( "mouseout",(event) => {compassMouseMove(event.layerX,event.layerY);}, false,);
  compass.addEventListener( "click", () => {compassLeftClick();},false);
  compass.addEventListener( "contextmenu", (e)=> {e.preventDefault();compassRightClick();},false);
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
function compassMouseMove (mouseX,mouseY){
  if (g_gui.connected) {
    evalPresetAngle (mouseX,mouseY);
    managePresetGUI();
  }
}

  
  
 /*------------------------------------------------------
 * Function: compassLeftClick
 * -------------------------------
 * Invoked on left click on compass DIV
 *
 * Invoked by:
 * . event Listenter                 (gui/compass/js/events.js)
 *
 * Called Sub/Functions: 
 * . managePresetGUI                 (gui/compass/js/compass.js)
 * . electronAPI.render_setTarget    (gui/compass/js/preload.js)
 *
 * Global variables used:
 * . g_gui                           (gui/compass/js/compass.js)
 *
 * Arguments: NONE
*/
function compassLeftClick() {
  if (g_gui.connected && g_gui.presetNew != null) { 
    g_gui.presetCur = g_gui.presetNew; 
    managePresetGUI();
    window.electronAPI.render_setTarget(g_gui.presetCur);
  }
}
  
 

/*------------------------------------------------------
 * Function: compassRightClick
 * -------------------------------
 * Invoked on right click on compass DIV
 *
 * Invoked by:
 * . event Listenter                   (gui/compass/js/events.js)
 *
 * Called Sub/Functions: 
 * . managePresetGUI                   (gui/compass/js/compass.js)
 * . electronAPI.render_stopMotor      (gui/compass/js/preload.js)
 *
 * Global variables used:
 * . g_gui                              (gui/compass/js/compass.js)
 *
 * Arguments: NONE
*/
function compassRightClick() {
  if (g_gui.connected) {
    g_gui.presetCur = null;
    g_gui.presetNew = null;
    window.electronAPI.render_stopMotor();
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
 * . electronAPI.render_stopMotor      (gui/compass/js/preload.js)
 *
 * Global variables used: NONE
 *
 * Arguments: 
 * . obj: is the HTML object triggering the event
*/
function releaseButton(obj){ 
  obj.classList.remove('push');
  window.electronAPI.render_stopMotor();
}



/*------------------------------------------------------
 * Function: pushButton
 * -------------------------------
 * Invoked when CW or CCW button is being released
 *
 * Invoked by:
 * . event Listenter            (gui/compass/main.html)
 *
 * Called Sub/Functions: 
 * . electronAPI.render_turn    (gui/compass/js/preload.js)
 *
 * Global variables used: 
 * . g_gui                      (gui/compass/js/compass.js)
 *
 * Arguments: 
 * . obj: is the HTML object triggering the event
*/
function pushButton(obj){
  if (g_gui.connected) {
    obj.classList.add('push');
    window.electronAPI.render_turn(obj.innerHTML) 
  }
}



/* --------------------------------------------------------------------------------------------------------- */
/*                                        Event Handlers (from node)                                         /*
/* --------------------------------------------------------------------------------------------------------- */

/*------------------------------------------------------
 * Function: onConnected
 * -------------------------------
 * Connected to rotctl event
 *
 * Invoked by:
 * . electronAPI                (gui/compass/js/preload.js)
 *
 * Called Sub/Functions: NONE
 *
 * Global variables used:
 * . g_gui                      (gui/compass/js/compass.js)
 *
 * Arguments: NONE
*/
window.electronAPI.onConnected(() => {
  g_gui.connected = true;
  document.getElementById("degree").classList.remove('off');
  document.getElementById("degree").classList.add('on');
});
  


/*------------------------------------------------------
 * Function: onDisconnect
 * -------------------------------
 * Disconnected from rotctl event
 *
 * Invoked by:
 * . electronAPI                (gui/compass/js/preload.js)
 *
 * Called Sub/Functions: NONE
 *
 * Global variables used:
 * . g_gui                      (gui/compass/js/compass.js)
 *
 * Arguments: NONE
*/
window.electronAPI.onDisconnect(() => {
  g_gui.connected = false;
  document.getElementById("degree").classList.remove('on');
  document.getElementById("degree").classList.add('off');
});
  
  

/*------------------------------------------------------
 * Function: onAzimuth
 * -------------------------------
 * received current position
 *
 * Invoked by:
 * . electronAPI                (gui/compass/js/preload.js)
 *
 * Called Sub/Functions: 
 * . updateCompass              (gui/compass/js/compass.js)
 *
 * Global variables used: NONE
 *
 * Arguments: NONE
*/
window.electronAPI.onAzimuth((_event,value) => {updateCompass(value);});



/*------------------------------------------------------
 * Function: onTarget
 * -------------------------------
 * Target reached
 *
 * Invoked by:
 * . electronAPI                (gui/compass/js/preload.js)
 *
 * Called Sub/Functions: 
 * . managePresetGUI            (gui/compass/js/compass.js)
 *
 * Global variables used:
 * . g_gui                      (gui/compass/js/compass.js)
 *
 * Arguments: NONE
*/
window.electronAPI.onTarget((_event) => {
  g_gui.presetCur = null;
  managePresetGUI();
});
  
  window.electronAPI.setTitle((_event,title) =>{
alert(title);



  })