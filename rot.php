<script>

//Display meter level
function dispmeter(position){
	var gauge = new RadialGauge({
    renderTo: 'meter',
	width: 350,
	height: 350,
	colorPlate: "#181817",
	title: "Web Rotator",
	colorTitle: "#b4b0a9",
    minValue: 0,
    maxValue: 360,
    majorTicks: [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW",
        "N"
    ],
    minorTicks: 9,
    ticksAngle: 360,
    startAngle: 180,
    strokeTicks: false,
    highlights: false,
    colorMajorTicks: "#b4b0a9",
    colorMinorTicks: "#b4b0a9",
    colorNumbers: "#b4b0a9",
    needleType: "arrow",
	animation: false,
    needleWidth: 3,
    colorNeedle: "#d4aa00",
    colorNeedleCircleInner: "#616161",
    needleCircleSize: 15,
    needleCircleOuter: false,
	needleShadow: false,
    borders: true,
    borderInnerWidth: 0,
    borderMiddleWidth: 0,
    borderOuterWidth: 5,
    colorBorderOuter: "#616161",
    borderShadowWidth: 0,
	valueBox: true,
	valueInt: 3,
	valueDec: 0,
    valueTextShadow: false,
	colorValueText: "#554400",
	colorValueBoxBackground: "#d4aa00",
	colorValueBoxRect: "#616161",
	value: position
}).draw();
	
	
}


//Display Preset
function dispqrg(qrg){
    var val = qrg;
	for (i = 0; i <= 2; i++){
		var d = val % 10;
        var img = big[d];
        val = Math.floor(val / 10);
        //if (val == 0 && d == 0) img = (i >= 3) ? bigspace : smallspace;
        document.getElementById("qrg" + i.toString()).src = img.src;
    }
}


//Poll rotator for status update
function poll(){
    loadXMLDoc("rotctl.php?q=p", function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
                var a = xmlhttp.responseText.split("\n");
                
				//get_Azimuth
				gazimuth = parseInt(a[0]);
                //dispqrg(gazimuth);
				dispmeter(gazimuth);
				
				//get_Elevation
                gelevation = parseInt(a[1]);
                //disprit(gelevation);
        }
    });
}


//Update the screen
function rotstart(){
	
    showhide("divopts");
	
    big = new Array();
    big["0"] = new Image();
    big["0"].src = "img/68_0.png";
    big["1"] = new Image();
    big["1"].src = "img/68_1.png";
    big["2"] = new Image();
    big["2"].src = "img/68_2.png";
    big["3"] = new Image();
    big["3"].src = "img/68_3.png";
    big["4"] = new Image();
    big["4"].src = "img/68_4.png";
    big["5"] = new Image();
    big["5"].src = "img/68_5.png";
    big["6"] = new Image();
    big["6"].src = "img/68_6.png";
    big["7"] = new Image();
    big["7"].src = "img/68_7.png";
    big["8"] = new Image();
    big["8"].src = "img/68_8.png";
    big["9"] = new Image();
    big["9"].src = "img/68_9.png";
    bigdot = new Image();
    bigdot.src = "img/68_dot.png";
    bigminus = new Image();
    bigminus.src = "img/68_minus.png";
    bigspace = new Image();
    bigspace.src = "img/68_space.png";
    
    small = new Array();
    small["0"] = new Image();
    small["0"].src = "img/46_0.png";
    small["1"] = new Image();
    small["1"].src = "img/46_1.png";
    small["2"] = new Image();
    small["2"].src = "img/46_2.png";
    small["3"] = new Image();
    small["3"].src = "img/46_3.png";
    small["4"] = new Image();
    small["4"].src = "img/46_4.png";
    small["5"] = new Image();
    small["5"].src = "img/46_5.png";
    small["6"] = new Image();
    small["6"].src = "img/46_6.png";
    small["7"] = new Image();
    small["7"].src = "img/46_7.png";
    small["8"] = new Image();
    small["8"].src = "img/46_8.png";
    small["9"] = new Image();
    small["9"].src = "img/46_9.png";
    smalldot = new Image();
    smalldot.src = "img/46_dot.png";
    smallminus = new Image();
    smallminus.src = "img/46_minus.png";
    smallspace = new Image();
    smallspace.src = "img/46_space.png";


    for (i = 0; i <= 2; i++) document.getElementById("qrg" + i.toString()).addEventListener("wheel", tunewheel);
 
    document.body.addEventListener("pointerdown", mousedown);
    document.body.addEventListener("pointermove", mousemove);
    document.body.addEventListener("pointerup", mouseup);
  
    dispqrg(gpreset);

    var refresh = getCookie("refresh");
    if (refresh == "") refresh = 1000;
    setCookie("refresh", refresh, 366);
    document.getElementById("refresh").value = refresh;

    poll();
    if (refresh != "OFF") polltimer = setInterval("poll()", refresh);
    
}


//Settings
function setrefresh(){
    var refresh = document.getElementById('refresh').value;
    setCookie('refresh', refresh, 366);
    clearInterval(polltimer);
    if (refresh != "OFF") polltimer = setInterval("poll()", refresh);
}

    
var big, bigdot, bigminus, bigspace;
var small, smalldot, smallminus, smallspace;
var gazimuth, gelevation;
var gpreset = 0;
var gqrg = 0;
var grit = 0;
var gtx = 0;
var polltimer;
var modal = false;
    
    </script>

<?php
function rot(){
?>    
   <span id="rig1">
      <canvas id="meter" width="350" height="350"></canvas>
    </span><br/>
	<span id="rig2">
	  <span id="spanoptions" onclick="showhide('divopts');modal=true"><img src="img/options24.png" title="Options" alt="Options"></span>
	  <span id="help" onclick="window.open('https://www.pianetaradio.it/blog/web-rotator', '_blank')"><img src="img/help24.png" title="Help" alt="Help"></span>
      <span id="qrg1span">
        <img class="digit" id="qrg2" src="img/68_space.png" alt=x><img 
		class="digit" id="qrg1" src="img/68_space.png" alt=x><img 
		class="digit" id="qrg0" src="img/68_space.png" alt=x>
	  </span>
	  <span id="prit" onclick="setposition(gpreset)">GO</span><span id="nrit" onclick="setstop()">STOP</span>
    </span>
	<br/>

    <div id="divopts">
      <table id="options">
      <tr><th colspan="2">Options</th></tr>
      <tr><td colspan="2"><hr></td></tr>
      <tr class="odd"><td class="right">Refresh:</td><td>
      <select id="refresh" onchange="setrefresh()">
		<option value="500">500ms</option>
        <option value="1000">1s</option>
        <option value="1500">1.5s</option>
        <option value="2000">2s</option>
        <option value="3000">3s</option>
		<option value="5000">5s</option>
        <option value="OFF">Off</option>
      </select>         
      </td></tr>
      <tr><td colspan="2"><hr></td></tr>
      <tr><td colspan="2"><button onclick="showhide('divopts');modal=false">Close</button></td></tr>
      </table>
    </div>  
    
    <div id="debug"></div>


<?php
}
?>
