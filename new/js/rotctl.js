const g_gui = {
	compassCenterX : 0,
	compassCenterY : 0,
	compassRadius  : 0,
	degreeBoxTop   : 0,
	degreeBoxLeft  : 0,
	degreeBoxWidth : 0
}

const g_compass = new RadialGauge ({
  renderTo         : 'compass',
  width            : 360,
  height           : 360,
  title            : "VHF Tower",
  startAngle       : 180,
  value            : 180,
  minValue         : 0,
  maxValue         : 360,
  ticksAngle       : 360,
  borderOuterWidth : 3,
  borderInnerWidth : 0,
  borderMiddleWidth: 0,
  needleWidth      : 3,
  needleType       : "arrow",
  needleEnd        : 80,
  needleStart      : 15,
  colorNeedle      : "#d4aa00",
  colorNeedleCircleInner : "#616161",
  needleCircleSize : 12,
  needleCircleOuter: false,
  needleCircleInner: true,
  needleShadow     : false,
  colorPlate       : "#181817",
  minorTicks       : 9,
  highlights       : false,
  majorTicks       : ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"],
  strokeTicks      : false,
  colorPlate       : "#181817",
  colorMajorTicks  : "#f5f5f5",
  colorMinorTicks  : "#ddd",
  colorTitle       : "#fff",
  colorNumbers     : "#eee",
  colorNeedleStart : "rgba(240, 128, 128, 1)",
  colorNeedleEnd   : "rgba(255, 160, 122, .9)",
  valueBox         : false,
  animation        : false,
  myCenterX        : 0,
  myCenterY        : 0,
  myRadius         : 0,
  myNeedleRadius   : 0
}).draw();


function updateMyProperties() {
  let options = g_compass.options;             // Shortcut for RadialGauge options
  
  // Canvas center
  options.myCenterX  = parseInt(options.width/ 2);
  options.myCenterY  = parseInt(options.height/ 2);

  // Compass Radius
  /* grab from radialgauge source */
  options.myRadius = (Math.min(options.width, options.height) )/2
                     - options.borderShadowWidth
                     - options.borderOuterWidth 
                     - options.borderMiddleWidth
                     - options.borderInnerWidth 
                     + (options.borderOuterWidth ? 0.5 : 0)
                     + (options.borderMiddleWidth ? 0.5 : 0)
                     + (options.borderInnerWidth ? 0.5 : 0);
 
  /* 
   * Needle center radius
   * Grab from radialgauge source
   */
   console.log(options.needleCirleInner);
  if (options.needleCircleInner) {options.myNeedleRadius = options.myRadius/100 * options.needleCircleSize * 0.75;}
  
  // If outer circle exist, then increase the value
  if (options.needleCircleOuter) {options.myNeedleRadius= options.myRadius/100 * options.needleCircleSize;}
}


function positionItems() {
  let degree = document.getElementById("compass_degree");
  console.log("ppp");
  degree.style.top = g_compass.options.myCenterY + 2*g_compass.options.myNeedleRadius + "px";
  degree.style.left = g_compass.options.myCenterX - parseInt(degree.clientWidth/2) - degree.clientLeft + "px";
}

function updateCompass(az){
  let degree = document.getElementById("compass_degree"); 	

  // Update compass
  g_compass.value = az;
  
  if (az < 10 )  { degree.innerHTML = "00" + az;} else
  if (az < 100 ) { degree.innerHTML = "0" + az;} else
  { degree.innerHTML = az;}
}
/* 
  const objCompass = document.getElementById(name);
  const objOverlay = document.getElementById (name + "_overlay");
  const objDegree  = document.getElementById(name + "_degree");
  
  let myBorderSize = 0;
  let myCenterX = 0;
  let myCenterY = 0;  
  let compassRadius = 0;
  let needleRadius = 0;
  
  let datasetWidth = objCompass.height;
  
  // Canvas center
  myCenterX  = Math.round(parseInt(objCompass.height;) / 2);
  myCenterY  = Math.round(parseInt(objCompass.height;) / 2);
    
  // Border size
  if (objCompass.dataset.borderInnerWidth !== undefined ) {myBorderSize += parseInt(objCompass.dataset.borderInnerWidth);}
  if (objCompass.dataset.borderMiddleWidth !== undefined) {myBorderSize += parseInt(objCompass.dataset.borderMiddleWidth);}
  if (objCompass.dataset.borderOuterWidth !== undefined ) {myBorderSize += parseInt(objCompass.dataset.borderOuterWidth);}
    
  objCompass.dataset.customBorderSize  = myBorderSize;
  
  // Compass radius evaluation
  // Formula based on gauge.min.js
  compassRadius = Math.min(myCenterX, myCenterY) - (objCompass.dataset.borderShadowWidth ? objCompass.dataset.borderShadowWidth : 0) - myBorderSize*window.devicePixelRatio;

  /* 
   * needle radius evaluation - Formula based on gauge.min.js
   * 
   * Default values within gauge.min.js
   *   needleCircleSize: 10,
   *   needleCircleInner: true
   *   needleCircleOuter: true
   *   needleStart: 20
   * 
   */   
 // if (objCompass.dataset.needleCircleSize
  
  //needleRadius = (compassRadius/100) * objCompass.dataset.needleCircleSize +  
  
  //let r2 = abs(max / 100 * options.needleCircleSize * 0.75);
  
   
  // Store values as custom data properties within canvas
 /* objCompass.dataset.myCenterX       = myCenterX;
  objCompass.dataset.myCenterY       = myCenterY;
  objCompass.dataset.myRadius        = compassRadius;
 let r2 = abs(max / 100 * options.needleCircleSize * 0.75);
 
 
  // Store values in global obj
  g_gui.compassCenterX = myCenterX;
  g_gui.compassCenterY = myCenterY;
  g_gui.compassRadius  = compassRadius;

  
  objCompass.dataset.myCenterX       = myCenterX;
  objCompass.dataset.myCenterY       = myCenterY;
  objCompass.dataset.myRadius        = myRadius;
    
  // Compass degree sizes
  objDegree.style.top = myCenterY + "px";
  //objDegree.style.top = "300px";
  //objDegree.style.top = "300px";
  
  // Update overlay
  //objOverlay.height = 0;
  //objOverlay.width = 0;
}

*/



function preset(mouseX,mouseY,name) {
  //get compass object
  const objCompass = document.getElementById(name);
  const myCenterX  = objCompass.dataset.myCenterX;
  const myCenterY  = objCompass.dataset.myCenterY;
  const myRadius   = objCompass.dataset.myRadius;
	console.log ("mousex: " + mouseX);
	console.log ("mousey; " + mouseY);
  // Compute mouse distance from compass center
  let dist = Math.sqrt(Math.pow(mouseX - gui.compassCenterX,2) + Math.pow(mouseY-myCenterY,2));

  // evaluate distance
  if (dist < myRadius && dist > myRadius*0.6) {
    // Arguibly we are within the compass's degree, so compute the angle
    let preset = parseInt((Math.atan2( mouseX-myCenterX, myCenterY - mouseY) ) * 180/Math.PI);

	   console.log(preset);
    objCompass.dataset.highlights =  "[{\"from\": " + (preset-1.5) + ", \"to\": " + (preset +1.5) +", \"color\": \"rgba(200, 50, 50, .75)\"}]";
	   if (preset < 0) {preset+=360;}
	  //console.log("ok " + angolo );
  } else {
    objCompass.dataset.highlights = "";
  }
	  /*
	  const canvas = document.getElementById("preset");
const ctx = canvas.getContext("2d");

ctx.beginPath(); // Start a new path
ctx.moveTo(30, 50); // Move the pen to (30, 50)
ctx.lineTo(150, 100); // Draw a line to (150, 100)
ctx.stroke(); // Render the path
*/
	
}


function clearPreset(name) {document.getElementById("compass").dataset.highlights="";}
