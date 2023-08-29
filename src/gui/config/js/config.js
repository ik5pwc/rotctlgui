/* --------------------------------------------------------------------------------------- 
 * File        : gui/config/js/config.js
 * Author      : Civinini Luca - IK5PWC
 *               luca@ik5pwc.it
 *               http://www.ik5pwc.it
 *
 * Description : Javascript functions used within the config page
 * ---------------------------------------------------------------------------------------
*/

// Global object storing current configuration
const g_currentCFG = {
    name    : "Rotator 1",
    address : "0",
    port    : 0,
    polling : 0,
    error   : 0,
    stop    : "",
    moveTo  : "",
    file    : "default.json",
    path    : ""
};
  


/*------------------------------------------------------
 * Function: startConfig
 * -------------------------------
 * Perform all related task when page has been loaded
 *
 * Invoked by:
 * . page load event        (gui/config/config.html)
 *
 * Called Sub/Functions: 
 * . addListeners           (gui/compass/js/events.js)
 * . setOverlayDiv          (gui/compass/js/compass.js)
 * 
 * Global variables used: NONE
 *
 * DOM items affected: NONE
 * 
 * Arguments: NONE
*/
function startConfig () {
    // Add event listeners
    addListeners();
  
    // Update global variables
    updateGlobal();
    
    // Position degree boxes in proper position
    setOverlayDiv();  
  }
  