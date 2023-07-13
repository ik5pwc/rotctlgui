<!-- 
-- WebRotator --
Web interface for antenna rotator remote control
v. 1.1


Requires hamlib libraries 4.1
Supported rotators https://github.com/Hamlib/Hamlib/wiki/Supported-Rotators


Author
Johnny IZ8EWD
Website https://www.pianetaradio.it/


Acknowledgments
Rotator command provided by Hamlib rotctl and rotctld utility https://hamlib.github.io/
Dial gauge by javascript code of Canvas Gauges https://canvas-gauges.com/
Preset display developed on the basis of WebRig by OK1ZIA and OK1HRA http://tucnak.nagano.cz/wiki/WebRig


Changelog
- 1.1, 2021-04: graphic bug correction for Options menu button
				refresh time list changed
				code cleanup
- 1.0, 2021-03: first official release
- 0.2, 2021-02: beta version
- 0.1, 2021-01: alfa release

-->


<!DOCTYPE html>
<html>
<head>
    <title>WebRotator</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <!--meta name="viewport" content="width=500px"-->
    <!--meta name="viewport" content="width=device-width, initial-scale=1"-->
    <link rel="stylesheet" type="text/css" href="style.css">
    <script src="./js/zjslib.js" type="text/javascript"></script>
	<script src="./js/rot.js" type="text/javascript"></script>
	<script src="./js/mousectl.js" type="text/javascript"></script>
	<script src="./js/gauge-radial.min.js" type="text/javascript"></script>

<style>

</style>

    <script>
	function start(){
		rotstart();
    }
	window.onload = start;
 	</script>
	
</head>

<body oncontextmenu="return false;">
<div>
	<span id="header">
	</span>
</div>

<div>	
<?php 
    require_once("rot.php");
    rot();
?>
</div>

</body>
</html>