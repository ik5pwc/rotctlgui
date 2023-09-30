/* --------------------------------------------------------------------------------------- 
 * File        : gui/compass/js/compass.js
 * Author      : Civinini Luca - IK5PWC
 *               luca@ik5pwc.it
 *               http://www.ik5pwc.it
 *
 * Description : Javascipt functions used within the compass page
 * ---------------------------------------------------------------------------------------
*/

// Helper object storing information to GUI
const g_compass = {
  centerX        : 0,
  centerY        : 0,
  radius         : 0,
  needleLen      : 0,
  needleStart    : 0,
  top            : 0,
  left           : 0
};

// Object for preset operation
const g_preset = {
  new      : null,
  current  : null,
}

// Object for connection status
const g_rotctld = {connected:null};


/* --------------------------------------------------------------------------------------------------------- */
/*                                        Event Handlers (from html)                                         /*
/* --------------------------------------------------------------------------------------------------------- */

/*------------------------------------------------------
 * Function: compassMouseMove
 * -------------------------------
 * Invoked when mouse moves over compass DIV
 *
 * Invoked by:
 * . onmousemove event          (gui/compass/compass.html)
 *
 * Called Sub/Functions: 
 * . evalPresetAngle            (this file)
 * . managePresetGUI            (this file)
 *
 * Global variables used:
 * . g_compass                  (this file)
 * . g_rotctld                  (this file)
 *
 * Arguments:
 * . mouseX, mouseY: mouse position relative to compass DIV
*/
function compassMouseMove(mouseX, mouseY) {
  
  // If connected evaluate the angle
  if (g_rotctld.connected) { g_preset.new = evalAngle(mouseX, mouseY); }
  
  // Update Preset boxes
  managePresetGUI();
}



/*------------------------------------------------------
 * Function: turn
 * -------------------------------
 * Invoked when manually move left ot tight
 *
 * Invoked by:
 * . onmousedown/onmouseup event    (gui/compass/compass.html)
 *
 * Called Sub/Functions: 
 * . managePresetGUI                (this file)
 * . window.electronAPI.turn        (gui/compass/preload_compass.js)
 *
 * Global variables used:
 * . g_preset                       (this file)
 *
 * Arguments:
 * . dir: direction (or stop) for rotation
*/
function turn(dir) {
  
  // If connected evaluate the angle
  if (g_rotctld.connected) {

    // Stop preset (if any) and clear preset info on GUI
    if (g_preset.current != null ) {
      g_preset.current = null;
      managePresetGUI();
    } 
    
    // Send command to main window
    switch (dir){
      case 'CW' : window.electronAPI.turn('CW') ; break;
      case 'CCW': window.electronAPI.turn('CCW'); break;
      case 'S'  : window.electronAPI.turn('S')  ; break;
    }
  }
}



/*------------------------------------------------------
* Function: compassClick
* -------------------------------
* Invoked on left click on compass DIV
*
* Invoked by:
* . onclick & oncontextmenu            (gui/compass/compass.html)
*
* Called Sub/Functions: 
* . managePresetGUI                    (this file)
* . electronAPI.setTarget              (gui/compass/preload_compass.js)
*
* Global variables used:
* . g_preset                           (this file)
*
* Arguments: NONE
*/
function compassClick(event) {
  
  // BLock default events
  event.preventDefault();

  // Manage mouse click only when connected
  if (g_rotctld.connected) {
    switch (event.button) {
      case 0:            // Standard click --> start moving to preset
        if (g_preset.new != null) {
          g_preset.current = g_preset.new;
          window.electronAPI.setTarget(g_preset.current);
        }
        break;

      case 2:            // Context menu click --> stop moving to preset
        // Set preset to null and stop the motor
        g_preset.current = null;
        g_preset.new = null;
        window.electronAPI.turn("S");
        break
    }

    // Update preset indicators if required
    managePresetGUI();
  }
}





/* --------------------------------------------------------------------------------------------------------- */
/*                             Event Handlers (from Inter process Electron API)                              */
/* --------------------------------------------------------------------------------------------------------- */

/*------------------------------------------------------
 * Function: getConfig
 * -------------------------------
 * Receive configuration from main module and
 * adjust GUI accordingly.
 *
 * Invoked by:
 * . main (via electronIPC)    (main.js)
 *
 * Called Sub/Functions: NONE 
 *
 * Global variables used: NONE
 *
 * DOM items affected:
 * - compass                   (/gui/compass/compass.html)           
 * - degree                    (/gui/compass/compass.html)
 * - presetNew                 (/gui/compass/compass.html)
 * - presetCur                 (/gui/compass/compass.html)
 * - title                     (/gui/compass/compass.html)
 * - north                     (/gui/compass/compass.html)
 * - let south                 (/gui/compass/compass.html)
 * - let compass               (/gui/compass/compass.html)
 * . version                   (/gui/compass/compass.html)
 * . title                     (/gui/compass/compass.html)
 *
 * Arguments: 
 * - configAsJSONString: current configuration formatted ad JSON string
 * - version: current application version
*/
window.electronAPI.getConfig((_event, configAsJSONString, version) => {
  
  // Define some shortcut to DOM Elements (or parts)
  let dataset    = document.getElementById("compass").dataset;           
  let degree     = document.getElementById("degree");
  let presetNew  = document.getElementById("preset_new");
  let presetCur  = document.getElementById("preset_cur");
  let title      = document.getElementById("title");
  let north      = document.getElementById("north")
  let south      = document.getElementById("south")
  let compass    = document.getElementById("compass");

  // Parse JSON configuration string
  let configJSON = JSON.parse(configAsJSONString);

  // Canvas center
  g_compass.centerX  = parseInt(dataset.width/ 2);
  g_compass.centerY  = parseInt(dataset.height/ 2);
  
  // Compass Radius  
  /* grab from radialgauge source */
  g_compass.radius = (Math.min(dataset.width, dataset.height) )/2
                      - (dataset.borderShadowWidth ? dataset.borderShadowWidth : 0)
                      - (dataset.borderOuterWidth  ? dataset.borderOuterWidth  : 0)
                      - (dataset.borderMiddleWidth ? dataset.borderMiddleWidth : 0)
                      - (dataset.borderInnerWidth  ? dataset.borderInnerWidth  : 0 ) 
                      + (dataset.borderOuterWidth ? 0.5 : 0)
                      + (dataset.borderMiddleWidth ? 0.5 : 0)
                      + (dataset.borderInnerWidth ? 0.5 : 0);

  // Needle length
  g_compass.needleLen = g_compass.radius/100 * dataset.needleEnd;
  g_compass.needleStart = g_compass.radius/100 * dataset.needleStart;

  // write version
  document.getElementById("version").innerHTML = "rotctlGUI v. " + version.toString() ;

  // display proper STOP indicator
  if (configJSON.stop === 0) { north.style.display=""    ; south.style.display="none" }
  else                       { north.style.display="none"; south.style.display=""     }

  // Retrieve current compass position within the page (After STOP indicator has being properly positioned)
  g_compass.top = compass.offsetTop;
  g_compass.left = compass.offsetLeft;
  
  // update document title
  title.innerHTML = configJSON.name.substring(0, 20);
  document.title = configJSON.name.substring(0, 20) + " (rotcctlGUI)";

  // firstly move each box to hgui/compass/js/preload_compassis default position.
  degree.style.top    = "0px";                  
  presetNew.style.top = "0px";                  
  presetCur.style.top = "0px";                  
  
  // now position boxes in desired position
  degree.style.top =  parseInt(compass.offsetTop + g_compass.centerY + 1.1*g_compass.needleStart - degree.offsetTop) + "px"; 
  presetNew.style.top = parseInt(compass.offsetTop + g_compass.centerY/2  - presetNew.offsetTop) + "px";
  presetCur.style.top = degree.offsetTop + degree.offsetHeight - presetCur.offsetTop+ "px";
});



/*------------------------------------------------------
 * Function: window.electronAPI.connected
 * -------------------------------
 * Perform GUI changes when connected or disconnected to rotctld
 *
 * Invoked by:
 * . main (via electronIPC)     (main.js)
 *
 * Called Sub/Functions: NONE
 *
 * Global variables used:
 * . g_rotctld                  (this file)
 * 
 * DOM items affected:
 * . degree                     (gui/compass/compass.html)
 *
 * Arguments: NONE
*/
window.electronAPI.connected((_event, conn) => {
  
  // set connected status 
  g_rotctld.connected = conn;

  // Change accordingly the style of degree box
  if (conn) {
    document.getElementById("degree").classList.add('on'); 
    document.getElementById("cw").classList.add('on'); 
    document.getElementById("ccw").classList.add('on'); 
  } else {
    document.getElementById("degree").classList.remove('on');
    document.getElementById("cw").classList.remove('on'); 
    document.getElementById("ccw").classList.remove('on'); 
  } 
});



/*------------------------------------------------------
 * Function: window.electronAPI.getPosition
 * -------------------------------
 * Received current position
 *
 * Invoked by:
 * . main (via electronIPC)     (main.js)
 *
 * Called Sub/Functions: NONE 
 *
 * Global variables used: NONE
 * 
 * DOM items affected:
 * . degree                     (gui/compass/compass.html) 
 * . compass                    (gui/compass/compass.html) 
 *
 * Arguments: 
 * . value: azimuth value received from main
*/
window.electronAPI.getPosition((_event, value) => { 
  let degree = document.getElementById("degree"); 	
  let compass = document.getElementById("compass");
  
  // Update compass
  compass.dataset.value = value;
  
  // Update degree box
  degree.innerHTML = value.toString().padStart(3,"0");
});



/*------------------------------------------------------
 * Function: window.electronAPI.targetReached
 * -------------------------------
 * Invoked when rotctld reached desired targer
 *
 * Invoked by:
 * . main (via electronIPC)     (main.js)
 *
 * Called Sub/Functions: 
 * . managePresetGUI            (this file)
 *
 * Global variables used:
 * . g_preset                   (this file)
 *
 * DOM items affected: NONE
 *
 * Arguments: NONE
*/
window.electronAPI.targetReached((_event) => { 
  g_preset.current = null;
  managePresetGUI();
});





/* --------------------------------------------------------------------------------------------------------- */
/*                                               Private functions                                           */
/* --------------------------------------------------------------------------------------------------------- */


/*------------------------------------------------------
 * Function: evalAngle
 * -------------------------------
 * Compute angle for current mouse position when moving
 * on compass annulus (from neeedle to outer circle). Return
 * null if outside.
 *
 * Invoked by:
 * . compassMouseMove       (this file)
 *
 * Called Sub/Functions: NONE
 *
 * Global variables used: NONE
 *
 *  DOM items affected: NONE
 * 
 * Arguments: 
 * . x,y: absolute mouse coordinates
*/
function evalAngle(x,y) {
  let dist = 0;            // pointer's distance from compass's center
  let angle = null;        // pointer azimuth (default null, i.e invalid)

  // Compute mouse distance from compass center
  dist = Math.sqrt(Math.pow(x - (g_compass.left + g_compass.radius),2) + Math.pow(y - (g_compass.top + g_compass.radius),2));

  // evaluate distance
  if (dist < g_compass.radius && dist > g_compass.radius*0.6) {
    
    // Arguibly we are within the compass's degree, so compute the angle
    angle = parseInt((Math.atan2(x - (g_compass.left + g_compass.centerX), (g_compass.top + g_compass.centerY) - y) ) * 180/Math.PI);

    // math.tan is a periodic function (0 to 180 degree) - Negative values are for 180-360 range
    if (angle < 0) { angle +=360;}
  }

  // return the value
  return angle;
}



/*------------------------------------------------------
 * Function: managePresetGUI
 * -------------------------------
 * Manage preset indicators boxes and compass highligths
 *
 * Invoked by:
 * . compassMouseMove                   (this file)
 * . compassClick                       (this file)
 * . window.electronAPI.targetReached   (this file)
 *
 * Called Sub/Functions: NONE
 *
 * Global variables used: 
 * . g_gui                              (this file) 
 * . g_preset                           (this file) 
 *
 * DOM items affected:
 * . compass                            (gui/compass/compass.html)
 * . preset_new                         (gui/compass/compass.html)
 * . preset_cur                         (gui/compass/compass.html)
 * 
 * Arguments: NONE
*/
function managePresetGUI() {
  const dataset = document.getElementById("compass").dataset;     // compass RadialGauge dataset shortcut
  let presetNew = document.getElementById("preset_new");          // preset_new box shortcut
  let presetCur = document.getElementById("preset_cur");          // preset_cur box shortcut
  let highlight = "";
  
  // Current preset indicator & boxes
  if (g_preset.current != null) {
    highlight += "{\"from\": " + (g_preset.current-0.75) + ", \"to\": " + (g_preset.current + 0.75 ) +", \"color\": \"rgba(63, 255, 183, .75)\"},"; 
	  presetCur.innerHTML = g_preset.current.toString().padStart(3,"0");
	  presetCur.style.visibility = "visible";  
  } else {
	  presetCur.style.visibility = "hidden";
  }
  
  // New preset compass indicator and boxes
  if (g_preset.new != null) {
    highlight += "{\"from\": " + (g_preset.new-0.75) + ", \"to\": " + (g_preset.new + 0.75 ) +", \"color\": \"rgba(200, 50, 50, .75)\"}"; 
    presetNew.innerHTML = g_preset.new.toString().padStart(3,"0");
    presetNew.style.visibility = "visible";
  } else {
    presetNew.style.visibility = "hidden";
  }
  
  // Remove last comma in highlight property, if any
  highlight = highlight.replace(/},$/,'}');
  dataset.highlights="[" + highlight + "]";
}	



