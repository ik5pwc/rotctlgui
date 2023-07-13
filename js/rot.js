//***********************************************
//Variables
//var gazimuth, gelevation;


//Get rotator status
function getstatus(){
    loadXMLDoc("rotctl.php?q=p", function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			var rotstatus = xmlhttp.responseText.split("\n");
			//debug(rotstatus);
			
			//Azimuth
			gazimuth = parseInt(rotstatus[0]);
			//debug(gazimuth);
			
			//Elevation
			gelevation = parseInt(rotstatus[1]);
			//debug(gelevation);
			
        }
	});
}

function setposition(azimuth){ //set position
	gpreset = azimuth;
	dispqrg(gpreset);

	loadXMLDoc("rotctl.php?q=P " + azimuth + " 0", function(){});
}


function setstop(){ //set stop
	loadXMLDoc("rotctl.php?q=S ", function(){});
}


//Preset button
function preset(pos){
	switch (pos){
		case 0:
			setposition(0);
		break;
		case 45:
			setposition(45);
		break;
		case 90:
			setposition(90);
		break;
		case 135:
			setposition(135);
		break;
		case 180:
			setposition(180);
		break;
		case 225:
			setposition(225);
		break;		
		case 270:
			setposition(270);
		break;
		case 315:
			setposition(315);
		break;
		case 360:
			setposition(359);
		break;		
		case 1000: //Park
			setposition(340);
		break;
	}
}