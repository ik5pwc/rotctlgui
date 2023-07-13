<?php


header('Content-Type: text/plain');
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Expires: -1");

$q = Preg_Replace('/[^-_ a-z0-9]/i', '', $_GET['q']);
system("rotctl -m 2 $q");


?>
