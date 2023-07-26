// object storing additional data for this application
const g_app = {
  compassCenterX : 0,
  compassCenterY : 0,
  compassRadius  : 0,
  needleRadius   : 0,
  needleLen      : 0,
  needleStart    : 0,
  prevAz         : null,
  presetNew      : null,
  presetCur      : null
}


// Update global objects data
function updateGlobal() {
  const dataset = document.getElementById("compass").dataset;             // Shortcut for RadialGauge options
  
  // Canvas center
  g_app.compassCenterX  = parseInt(dataset.width/ 2);
  g_app.compassCenterY  = parseInt(dataset.height/ 2);
  
  // Compass Radius  
  /* grab from radialgauge source */
  g_app.compassRadius = (Math.min(dataset.width, dataset.height) )/2
                     - (dataset.borderShadowWidth ? dataset.borderShadowWidth : 0)
                     - (dataset.borderOuterWidth  ? dataset.borderOuterWidth  : 0)
                     - (dataset.borderMiddleWidth ? dataset.borderMiddleWidth : 0)
                     - (dataset.borderInnerWidth  ? dataset.borderInnerWidth  : 0 ) 
                     + (dataset.borderOuterWidth ? 0.5 : 0)
                     + (dataset.borderMiddleWidth ? 0.5 : 0)
                     + (dataset.borderInnerWidth ? 0.5 : 0);
  
  // Needle center radius
  // Apply default values (same as used in gauge.min.js
  if (dataset.needleCircleSize === undefined ) {dataset.needleCircleSize = 10;}
  if (dataset.needleCircleInner === undefined ) {dataset.needleCircleInner = true;}
  if (dataset.needleCircleOuter === undefined ) {dataset.needleCircleOuter = true;}
  
  // Needle circle when only inner is defined
  if (dataset.needleCircleInner) {g_app.needleRadius = g_app.compassRadius/100 * dataset.needleCircleSize * 0.75;}
  
  // If outer circle exist, then increase the value
  if (dataset.needleCircleOuter) {g_app.needle = g_app.compassRadius/100 * dataset.needleCircleSize;}

  // Needle length
  g_app.needleLen = g_app.compassRadius/100 * dataset.needleEnd;
  g_app.needleStart = g_app.compassRadius/100 * dataset.needleStart;
  
} 


// This function move the degree box exactly under the needle
// Called on startup and on every window resize
function setOverlayDiv() {
  let degree = document.getElementById("degree");
  let presetNew = document.getElementById("preset_new");
  let presetCur = document.getElementById("preset_cur");
  
  // Position azimuth box
  degree.style.top = parseInt(g_app.compassCenterY + 1.1*g_app.needleStart) + "px";
  degree.style.left = parseInt(g_app.compassCenterX - degree.clientWidth/2 - degree.clientLeft ) + "px";
  
  //position new preset box (usually hidden)
  presetNew.style.left = parseInt(g_app.compassCenterX - presetNew.clientWidth/2 - presetNew.clientLeft ) + "px"; 
  presetNew.style.top = parseInt(g_app.compassCenterY/2) + "px";

  //position current preset box (usually hidden)
  presetCur.style.left = parseInt(g_app.compassCenterX - presetCur.clientWidth/2 - presetCur.clientLeft ) + "px"; 
  presetCur.style.top = degree.offsetTop + presetCur.clientHeight*1.2 + "px";

}



function updateCompass(az){
  let degree = document.getElementById("degree"); 	
  let compass = document.getElementById("compass");
  
  // Update compass
  compass.dataset.value = az;
  
  // Update degree box
  degree.innerHTML = az.toString().padStart(3,"0");

  // check if preset has been reached
  if ( (g_app.prevAz != null)    &&  
       (g_app.presetCur != null) && 
       ( 
         (g_app.prevAz <= g_app.presetCur && az >= g_app.presetCur) || 
         (g_app.prevAz >= g_app.presetCur && az <= g_app.presetCur) 
       )
     ) {
    g_app.presetCur = null;
    managePresetGUI();
  }
		  
  // update previous value
  g_app.prevAz = az;
}



function evalPresetAngle(x,y) {
  let dist = 0;            // pointer's distance from compass center
  let angle = 0;           // pointer azimuth

  // Compute mouse distance from compass center
  dist = Math.sqrt(Math.pow(x - g_app.compassCenterX,2) + Math.pow(y - g_app.compassCenterY,2));

  // evaluate distance
  if (dist < g_app.compassRadius && dist > g_app.compassRadius*0.6) {
    
    // Arguibly we are within the compass's degree, so compute the angle
    angle = parseInt((Math.atan2(x - g_app.compassCenterX, g_app.compassCenterY - y) ) * 180/Math.PI);
    
    // math.tan is a periodic function (0 to 180 degree) - Negative values are for 180-360 range
    if (angle < 0) { angle +=360;}

    // save current preset in global variable
    g_app.presetNew = angle;
    	     
  } else {
	// outside the valid annulus
    g_app.presetNew = null;
  }
}

function managePresetGUI() {
  const dataset = document.getElementById("compass").dataset;     // compass RadialGauge dataset shortcut
  let presetNew = document.getElementById("preset_new");          // preset_new box shortcut
  let presetCur = document.getElementById("preset_cur");          // preset_cur box shortcut
  let highlight = "";
  
  // Current preset indicator & boxes
  if (g_app.presetCur != null) {
    highlight += "{\"from\": " + (g_app.presetCur-0.75) + ", \"to\": " + (g_app.presetCur + 0.75 ) +", \"color\": \"rgba(63, 255, 183, .75)\"},"; 
	presetCur.innerHTML = g_app.presetCur.toString().padStart(3,"0");
	presetCur.style.visibility = "visible";  
  } else {
	presetCur.style.visibility = "hidden";
  }
  
  // New preset compass indicator and boxes
  if (g_app.presetNew != null) {
	highlight += "{\"from\": " + (g_app.presetNew-0.75) + ", \"to\": " + (g_app.presetNew + 0.75 ) +", \"color\": \"rgba(200, 50, 50, .75)\"}"; 
    presetNew.innerHTML = g_app.presetNew.toString().padStart(3,"0");
    presetNew.style.visibility = "visible";
  } else {
    presetNew.style.visibility = "hidden";
  }
  
  // Remove last comma if any
  highlight = highlight.replace(/},$/,'}');
  dataset.highlights="[" + highlight + "]";

}	


/* -------------------------- */
/*       Event Handlers       */
/* -------------------------- */

function compassMouseMove (mouseX,mouseY){
  evalPresetAngle (mouseX,mouseY);
  managePresetGUI();
}


function compassLeftClick() {
  if (g_app.presetNew != null) { g_app.presetCur = g_app.presetNew; }
  managePresetGUI();
}



function compassRightClick() {
  g_app.presetCur = null;
  g_app.presetNew = null;
  managePresetGUI();
}








// invoked ad application startup (i.e. page load)
function startApp () {
  // Update global variables
  updateGlobal();
  
  // Position degree boxes in proper position
  setOverlayDiv();
  
}
	 
	 
