//***********************************************
//Mouse and Touch control


//VFO increment and update
function tune(delta, order){
    if (delta == 0) return;
    gpreset += delta;
    if (gpreset < 0) gpreset = 359;
    if (gpreset >= 360) gpreset = 0;
    //if (clrlow){
    //    gqrg = Math.floor(gqrg / order) * order;
    //}
    dispqrg(gpreset);
    //loadXMLDoc("rigctl.php?q=F " + gqrg.toString(), function(){});
}

//RIT increment and update
function rit(delta, order){
    //var dummy = "delta="+delta.toString()+" order=" + order.toString();
    grit += delta;
    if (grit < -9999) grit = -9999;
    if (grit >= 9999) grit = 9999;
    if (clrlow){
        grit = Math.floor(grit / order) * order;
        if (grit < -9000) grit = -9000;
    }
    disprit(grit);
    loadXMLDoc("rigctl.php?q=J " + grit.toString(), function(){});
}


//***********************************************
//Mouse
var isqrgdown = false;
var isritdown = false;
var downy = 0;
var starty = 0;
var thr = 10;
var downi = 0;

//Mouse button press
function mousedown(e){
    if (modal) return;
	
    if (e.target.id.substring(0, 3) == "qrg"){
		starty = parseInt(e.clientY);
        downy = starty;
        isqrgdown = true;
        downi = parseInt(e.target.id.substring(3));
        e.preventDefault();
    }
    if (e.target.id.substring(0, 3) == "rit"){
        starty = parseInt(e.clientY);
        downy = starty;
        isritdown = true;
        downi = parseInt(e.target.id.substring(3));
        e.preventDefault();
    }
}

//Mouse move
function mousemove(e){
    if (modal) return;

    var dist = starty - parseInt(e.clientY);
    if (isqrgdown){
        if (Math.abs(dist) >= thr){
            tune(Math.floor(dist / thr) * Math.pow(10, downi), Math.pow(10, downi));
            starty = parseInt(e.clientY);
        }
        e.preventDefault();
    }
    if (isritdown){
        if (Math.abs(dist) >= thr){
            rit(dist, Math.pow(10, downi));
            starty = parseInt(e.clientY);
        }
        e.preventDefault();
    }
}

//Mouse button release
function mouseup(e){
    if (modal) return;

    var dist = downy - parseInt(e.clientY);
    if (isqrgdown){
        if (Math.abs(dist) < thr){
            if (e.which == 1) tune(Math.pow(10, downi), Math.pow(10, downi)); // left
            if (e.which == 3) tune(-Math.pow(10, downi), Math.pow(10, downi)); // right
            e.preventDefault();
        }
        isqrgdown = false;
    }
    if (isritdown){
        if (Math.abs(dist) < thr){
            if (e.which == 1) rit(Math.pow(10, downi), Math.pow(10, downi)); // left
            if (e.which == 3) rit(-Math.pow(10, downi), Math.pow(10, downi)); // right
            e.preventDefault();
        }
        isritdown = false;
    }
}

//Mouse scroll
function tunewheel(ae){ //VFO
    if (modal) return;
	
    var ev=window.event || ae //equalize event object
/*    var delta=ev.detail ? ev.detail*(-120) : evt.wheelDelta //delta returns +120 when wheel is scrolled up, -120 when scrolled down
    delta /= 360;*/
	
	if (ev.deltaY > 0) var delta = -1; //scroll down
	else if (ev.deltaY < 0) var delta = 1; //scroll up
	else delta = 0;
	
    if (ev.target) targ = ev.target;
    else if (ev.srcElement) targ = ev.srcElement;
    if (targ.nodeType == 3) targ = targ.parentNode; // defeat Safari bug
    var nr = targ.id.substring(3);
    tune(delta * Math.pow(10, nr), Math.pow(10, nr)); //change vfo frequency
}

function ritwheel(ae){ //Clarifier
    if (modal) return;

    var ev=window.event || ae //equalize event object
    /* var delta=ev.detail ? ev.detail*(-120) : evt.wheelDelta //delta returns +120 when wheel is scrolled up, -120 when scrolled down
    delta /= 360; */

	if (ev.deltaY > 0) var delta = -1; //scroll down
	else if (ev.deltaY < 0) var delta = 1; //scroll up
	else delta = 0;	
	
    if (ev.target) targ = ev.target;
    else if (ev.srcElement) targ = ev.srcElement;
    if (targ.nodeType == 3) targ = targ.parentNode; // defeat Safari bug
    var nr = targ.id.substring(3);
    rit(delta * Math.pow(10, nr), Math.pow(10, nr)); //change rit frequency
}


//***********************************************
//Touch
var touchqrgi = -1;
var touchriti = -1;
var touchqrg = 1;
var touchrit = 1;

//Touch press
function touchstart(e){
    if (modal) return;

	var touchobj = e.changedTouches[0];
    starty = parseInt(touchobj.clientY);
    
    if (e.target.id.substring(0, 3) == "qrg"){
        touchqrgi = parseInt(e.target.id.substring(3));
        touchqrg = gpreset;
        e.target.style.backgroundColor = "red";
        e.preventDefault();
        return;
    }else{
        touchqrgi = -1;
    }
    
    if (e.target.id.substring(0, 3) == "rit"){
        touchriti = parseInt(e.target.id.substring(3));
        touchrit = grit;
        e.target.style.backgroundColor = "red";
        e.preventDefault();
        return;
    }else{
        touchriti = -1;
    }
}

//Touch move
function touchmove(e){
    if (modal) return;

    var touchobj = e.changedTouches[0];
    var dist = starty - parseInt(touchobj.clientY);

    if (touchqrgi >= 0){
        tune(Math.round(dist / 10) * Math.pow(10, touchqrgi) + touchqrg - gpreset, Math.pow(10, touchqrgi));
        e.preventDefault();
    }

    if (touchriti >= 0){
        if (dist != 0) rit(Math.round(dist / 10) * Math.pow(10, touchriti) + touchrit - grit, Math.pow(10, touchriti));
        e.preventDefault();
    }
}

//Touch release
function touchend(e){
    if (modal) return;

    if (touchqrgi >= 0){
        var img = document.getElementById("qrg" + touchqrgi.toString());
        img.style.backgroundColor = "#d4aa00";
        touchqrgi = -1;
    }
    
    if (touchriti >= 0){
        var img = document.getElementById("rit" + touchriti.toString());
        img.style.backgroundColor = "#d4aa00";
        touchriti = -1;
    }
//    e.preventDefault();
}