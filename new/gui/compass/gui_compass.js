// object storing additional data for this application
const g_gui = {
  compassCenterX : 0,
  compassCenterY : 0,
  compassRadius  : 0,
  needleRadius   : 0,
  needleLen      : 0,
  needleStart    : 0,
  prevAz         : null,
  presetNew      : null,
  presetCur      : null,
  connected      : false
};


// Update global objects data
function updateGlobal() {
  const dataset = document.getElementById("compass").dataset;             // Shortcut for RadialGauge options
  
  // Canvas center
  g_gui.compassCenterX  = parseInt(dataset.width/ 2);
  g_gui.compassCenterY  = parseInt(dataset.height/ 2);
  
  // Compass Radius  
  /* grab from radialgauge source */
  g_gui.compassRadius = (Math.min(dataset.width, dataset.height) )/2
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
  if (dataset.needleCircleInner) {g_gui.needleRadius = g_gui.compassRadius/100 * dataset.needleCircleSize * 0.75;}
  
  // If outer circle exist, then increase the value
  if (dataset.needleCircleOuter) {g_gui.needle = g_gui.compassRadius/100 * dataset.needleCircleSize;}

  // Needle length
  g_gui.needleLen = g_gui.compassRadius/100 * dataset.needleEnd;
  g_gui.needleStart = g_gui.compassRadius/100 * dataset.needleStart;
} 


// This function moves all div in their position based on 
// compass size
// Called on startup and on every window resize
function setOverlayDiv() {
  let degree = document.getElementById("degree");
  let presetNew = document.getElementById("preset_new");
  let presetCur = document.getElementById("preset_cur");

  // Position azimuth box
  degree.style.top = parseInt(g_gui.compassCenterY + 1.1*g_gui.needleStart) + "px";
  degree.style.left = parseInt(g_gui.compassCenterX - degree.clientWidth/2 - degree.clientLeft ) + "px";
  
  //position new preset box (usually hidden)
  presetNew.style.left = parseInt(g_gui.compassCenterX - presetNew.clientWidth/2 - presetNew.clientLeft ) + "px"; 
  presetNew.style.top = parseInt(g_gui.compassCenterY/2) + "px";

  //position current preset box (usually hidden)
  presetCur.style.left = parseInt(g_gui.compassCenterX - presetCur.clientWidth/2 - presetCur.clientLeft ) + "px"; 
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
  if ( (g_gui.prevAz != null)    &&  
       (g_gui.presetCur != null) && 
       ( 
         (g_gui.prevAz <= g_gui.presetCur && az >= g_gui.presetCur) || 
         (g_gui.prevAz >= g_gui.presetCur && az <= g_gui.presetCur) 
       )
     ) {
    g_gui.presetCur = null;
    managePresetGUI();
  }
		  
  // update previous value
  g_gui.prevAz = az;
}



function evalPresetAngle(x,y) {
  let dist = 0;            // pointer's distance from compass center
  let angle = 0;           // pointer azimuth

  // Compute mouse distance from compass center
  dist = Math.sqrt(Math.pow(x - g_gui.compassCenterX,2) + Math.pow(y - g_gui.compassCenterY,2));

  // evaluate distance
  if (dist < g_gui.compassRadius && dist > g_gui.compassRadius*0.6) {
    
    // Arguibly we are within the compass's degree, so compute the angle
    angle = parseInt((Math.atan2(x - g_gui.compassCenterX, g_gui.compassCenterY - y) ) * 180/Math.PI);
    
    // math.tan is a periodic function (0 to 180 degree) - Negative values are for 180-360 range
    if (angle < 0) { angle +=360;}

    // save current preset in global variable
    g_gui.presetNew = angle;
    	     
  } else {
	  // outside the valid annulus
    g_gui.presetNew = null;
  }
}

function managePresetGUI() {
  const dataset = document.getElementById("compass").dataset;     // compass RadialGauge dataset shortcut
  let presetNew = document.getElementById("preset_new");          // preset_new box shortcut
  let presetCur = document.getElementById("preset_cur");          // preset_cur box shortcut
  let highlight = "";
  
  // Current preset indicator & boxes
  if (g_gui.presetCur != null) {
    highlight += "{\"from\": " + (g_gui.presetCur-0.75) + ", \"to\": " + (g_gui.presetCur + 0.75 ) +", \"color\": \"rgba(63, 255, 183, .75)\"},"; 
	  presetCur.innerHTML = g_gui.presetCur.toString().padStart(3,"0");
	  presetCur.style.visibility = "visible";  
  } else {
	  presetCur.style.visibility = "hidden";
  }
  
  // New preset compass indicator and boxes
  if (g_gui.presetNew != null) {
	highlight += "{\"from\": " + (g_gui.presetNew-0.75) + ", \"to\": " + (g_gui.presetNew + 0.75 ) +", \"color\": \"rgba(200, 50, 50, .75)\"}"; 
    presetNew.innerHTML = g_gui.presetNew.toString().padStart(3,"0");
    presetNew.style.visibility = "visible";
  } else {
    presetNew.style.visibility = "hidden";
  }
  
  // Remove last comma in highlight property, if any
  highlight = highlight.replace(/},$/,'}');
  dataset.highlights="[" + highlight + "]";

}	


/* -------------------------- */
/* Event Handlers (from html) */
/* -------------------------- */

function compassMouseMove (mouseX,mouseY){
  if (g_gui.connected) {
    evalPresetAngle (mouseX,mouseY);
    managePresetGUI();
  }
}


function compassLeftClick() {
  if (g_gui.connected) {
    if (g_gui.presetNew != null) { g_gui.presetCur = g_gui.presetNew; }
    managePresetGUI();
    window.electronAPI.setTarget(g_gui.presetCur);
  }
}



function compassRightClick() {
  if (g_gui.connected) {
    g_gui.presetCur = null;
    g_gui.presetNew = null;
    managePresetGUI();
  }
}



/* -------------------------- */
/* Event Handlers (from node) */
/* -------------------------- */
window.electronAPI.onConnected(() => {
  g_gui.connected = true;
  document.getElementById("degree").classList.remove('off');
  document.getElementById("degree").classList.add('on');
});

window.electronAPI.onDisconnect(() => {
  g_gui.connected = false;
  document.getElementById("degree").classList.remove('on');
  document.getElementById("degree").classList.add('off');
});



window.electronAPI.onAzimuth((_event,value) => {updateCompass(value);});

vwindow.electronAPI.onTarget((_event,value) => {
  managePresetGUI();
});



// invoked ad application startup (i.e. page load)
function startApp () {
  // Update global variables
  updateGlobal();
  
  // Position degree boxes in proper position
  setOverlayDiv();
  
}
	 
	 
