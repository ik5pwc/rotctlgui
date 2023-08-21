/* ---------------------------------------------------------------------------------------
 * File        : rotctlProtocol.js
 * Author      : Civinini Luca - IK5PWC
 *                 luca@civinini.net - http://www.civinini.net
 *                 luca@ik5pwc.it    - http://www.ik5pwc.it
 *
 * Description : Manage communication to a rotctld instance 
 * ---------------------------------------------------------------------------------------
*/

/* --------------------- Required modules --------------------- */
const Net = require('node:net'); 
const { globalEmitter } = require('./node_events.js');
const { send } = require('node:process');
const { stat } = require('node:fs');



/* --------------------------------------------------------------------------------------------------------- */
/*                                              Global objects                                               /*
/* --------------------------------------------------------------------------------------------------------- */

const client = new Net.Socket();      // TCP Socket

const rotctld = {                     // ROTCTLD network information 
  host     : "" ,                     // FQDN or ip address - default: localhost
  port     : 0,                       // ROTCTLD listen port - default: 4533
  polling  : 10000,                   // Polling rate for position (ms) - default 500 ms
  minSkew  : 30,                      // minimum difference to start rotation   
  southStop: true                     // Rotor has south stop or north stop. Used only if point to target has to be
                                      // managed by GUI (i.e. this app will send "move left/right" to rotator, 
                                      // check current position and send stop command when is on target).
                                      // If null, then moving to target will be performed by rotctl "P" command
                                      // (i.e. is rotctld to determine if motor has to be moved CW or CCW)   
};

const status = {            // Manage rotctl protocol and store rotor configuration
  sent        :[],             // list of sent commands (FIFO)                     
  rxBuffer    : "",            // Received data from rotCTLD
  target      : null,          // Target value requested from GUI (0 ... 360)
  azimuth     : null,          // current azimuth (0 ... 360)
  targetSouth : null,          // target when south stop (-180 ... 180)
  azimuthSouth: null,          // current  azimut when south stop (-180 ... 180)
  motor       : "S",           // Motor status
  connected   : false,         // turn to true after verify connection
  errors      : 0              // Communication error
};

/* --------------------------------------------------------------------------------------------------------- */
/*                                            Exported Functions                                             /*
/* --------------------------------------------------------------------------------------------------------- */

exports.connect      = connect;
exports.pointTo      = pointTo;
exports.stopMotor    = stopMotor;
exports.turn         = turn;
exports.setAddress   = function (address) {rotctld.host = address;};
exports.setPort      = function (port)    {rotctld.port = port;};
exports.setPolling   = function (rate)    {rotctld.polling = rate;};
exports.setminSkew   = function (skew)    {rotctld.minSkew = skew;};
exports.setSouthStop = function (stop)    {rotctld.southStop = stop;};
exports.getAddress   = function () {return rotctld.host;};
exports.getPort      = function () {return rotctld.port ;};
exports.getPolling   = function () {return rotctld.polling;};
exports.getminSkew   = function () {return rotctld.minSkew;};
exports.getSouthStop = function () {return rotctld.southStop;};



/*------------------------------------------------------
 * Function: pointTo
 * -------------------------------
 * Point antenna to specified azimutb
 *
 * Invoked by:
 * . event emitter          (main.js)
 *
 * Called Sub/Functions: 
 * . sendCommand            (rotctlProtocol.js)
 *
 * Global variables used: 
 * . status                 (rotctlProtocol.js)
 * . rotctld                (rotctlProtocol.js)
 * . globalEmitter          (node_events.js)
 *
 * Arguments:
 * . target: pointer to configuration structure managing all configuration states
*/
function pointTo(target) {
  console.log("Pointing to " + target);
  status.target = parseInt(target);

  if (rotctld.southStop === true && target > 180) {status.targetSouth = target - 360;} else {status.targetSouth = target;}
  // check target > minSkew
  if (Math.abs(status.azimuth - status.target) < rotctld.minSkew) {
    // target near to current azimuth, report as done
    globalEmitter.emit('onTarget');    
    status.motor = "S";

  } else {
    switch (rotctld.southStop) {
      case true:
        if ( (status.target/180 <1 && status.azimuth/180 <1) ||  (status.target/180 >1 && status.azimuth/180 >1)) {
          // both target and current position are in the same "half" (0-180 / 180-360)
          if ( status.target > status.azimuth) { status.motor = "CW";} else { status.motor = "CCW";}
        } else {
          if ( status.target > status.azimuth) { status.motor = "CCW";} else { status.motor = "CW";}
        }
        break;

      case false:
        if ( status.target > status.azimuth) { status.motor = "CW";} else { status.motor = "CCW";}
        break;

      case null:
        // Rotor support "P" command 
        status.motor = "P"
        break;
    }
  }
  
  // Send appropriate command to rotctld
  switch (status.motor){
    case "CW" : sendCommand("+M 16 0")                       ; break;
    case "CCW": sendCommand("+M 8 0")                        ; break;
    case "S"  : sendCommand("+S")                            ; break;
    case "P"  : sendCommand("+P " + status.target + ".0 0.0"); break;
  }
}



/*------------------------------------------------------
 * Function: connect
 * -------------------------------
 * Establish connection to rotctld instance 
 *
 * Invoked by:
 * . startup                (main.js)
 *
 * Called Sub/Functions: NONE
 *
 * Global variables used: 
 * . client                 (rotctlProtocol.js)
 *
 * Arguments: NONE
*/
function connect() {
  console.log("Starting connection to " + rotctld.host + ":" + rotctld.port);
  
  // Generic connection parameters
  client.setKeepAlive = true;
  client.setTimeout = 2000;

  // Start Connection
  client.connect({ port: rotctld.port, host: rotctld.host },undefined);
}



/*------------------------------------------------------
 * Function: stopMotor
 * -------------------------------
 * Immediatly stop motor 
 *
 * Invoked by:
 * . startup                (main.js)
 *
 * Called Sub/Functions: 
 * . sendCommand            (rotctlProtocol.js)
 *
 * Global variables used: NONE
 *
 * Arguments: NONE
*/
function stopMotor() {
  console.log("Stopping motor");
  
  // Generic connection parameters
  sendCommand("+S");
}



/*------------------------------------------------------
 * Function: turn
 * -------------------------------
 * rotate motor CW or CCW
 *
 * Invoked by:
 * . startup                (main.js)
 *
 * Called Sub/Functions: 
 * . sendCommand            (rotctlProtocol.js)
 *
 * Global variables used: NONE
 *
 * Arguments: 
 * . direction: can be CW or CCW 
*/
function turn(direction) {
  switch (direction) {
    case "CW":
      console.log("Turning rotor CW");
      sendCommand("+M 16 0");
      break;
    case "CCW":
    console.log("Turning rotor CCW");
    sendCommand("+M 8 0");
    break;
  }
}



/* --------------------------------------------------------------------------------------------------------- */
/*                                        Module (private) functions                                         /*
/* --------------------------------------------------------------------------------------------------------- */

/*------------------------------------------------------
 * Function: getAzimuth
 * -------------------------------
 * Periodic function to ask for current position
 *
 * Invoked by:
 * . Javascript timer       (rotctlProtocol.js)
 *
 * Called Sub/Functions: 
 * . sendCommand            (rotctlProtocol.js)
 *
 * Global variables used: 
 * . rotctld                (rotctlProtocol.js)
 * 
 * Arguments: NONE
*/
function getAzimuth () {
  if (status.connected) {sendCommand("+p");}
  setTimeout(()=>{getAzimuth()},rotctld.polling);
}



/*------------------------------------------------------
 * Function: sendCommand
 * -------------------------------
 * Send specific command to rotctld
 *
 * Invoked by:
 * . hEstablished           (rotctlProtocol.js)
 * . getAzimuth             (rotctlProtocol.js)
 * . pointTo                (rotctlProtocol.js)
 *
 * Called Sub/Functions: NONE
 *
 * Global variables used: 
 * . status                 (rotctlProtocol.js)
 * . client                 (rotctlProtocol.js)
 * 
 * Arguments: 
 * . cmd: command to send
*/
function sendCommand(cmd) {
  // Send command only if connection is established
  if (! client.closed) { 
    status.sent.push(cmd); 
    client.write (cmd + "\n");
  }
}



/*------------------------------------------------------
 * Function: checkReply
 * -------------------------------
 * Evaluate replies to sent commands
 *
 * Invoked by:
 * . hdata                  (rotctlProtocol.js)
 *
 * Called Sub/Functions: 
 * . replyCapabilities      (rotctlProtocol.js)
 * . replyGetPos            (rotctlProtocol.js)
 * . replySetPos            (rotctlProtocol.js)
 * . manageProtocolError    (rotctlProtocol.js)
 * 
 * Global variables used: 
 * . status                 (rotctlProtocol.js)
 * 
 * Arguments: 
 * . reply: string containing reply to be evaluated
*/
function checkReply(reply) {
  let replyOK = false;        // by default reply is wrong

  switch (status.sent.pop().substring(0,2)) {

    case "1" : replyOK = replyCapabilities(reply); break; 
    case "+p": replyOK = replyGetPos(reply)      ; break;
    case "+P": replyOK = replySetPos(reply)      ; break;       
    case "+S": replyOK = true                    ; break;       // Reply to Stop command    
    case "+M": replyOK = true                    ; break;       // Reply to Move command
  }

  // if reply has been successfull parsed, then clear error control else evaulate communications
  if (replyOK) {status.errors = 0;} else {manageProtocolError();}
}


function replySetPos(buffer) {
  let replySetPos = buffer.match('set_pos: (-?[0-9]{1,})\.[0-9]{1,} 0.0');
  if (replySetPos != undefined) {return true;} else {return false;}
}



function replyCapabilities(buffer) {
  // Message format
  let model = buffer.match("Model name:\t\t(.*)\n");       
  
  if (model != undefined) { 
    console.log("Rotator model: " + model[1]);
    globalEmitter.emit('connected');    // Inform GUI connection is successfull
    getAzimuth();                       // Start polling
    status.connected = true;

    // Valid response detected
    return true;
  }
  // by default return invalid message
  return false;
}


function replyGetPos(buffer){
  // Message format
  let replyPos = buffer.match('get_pos:\nAzimuth: (-?[0-9]{1,})\.[0-9]{2}\nElevation: [0-9]{1,}\.[0-9]{2}\n');
  
  if (replyPos != undefined) {
    // Save value and send event to main application
    status.azimuth = replyPos[1];
    if (rotctld.southStop === true && status.azimuth > 180) {status.azimuthSouth = status.azimuth - 360;} else {status.azimuthSouth = status.azimuth;} 
    globalEmitter.emit('azimuth',status.azimuth);

    // Check for target or  errors
    if ( (status.motor != "S" ) &&

         // Stop position reached
         (rotctld.southStop === false && status.azimuth == 0)  ||   
         (rotctld.southStop === true  && status.azimuth == 180) ||

         // North stop rotor, target has been outdated
         (rotctld.southStop === false && status.motor == "CW" && status.azimuth > status.target)  ||
         (rotctld.southStop === false && status.motor == "CCW" && status.azimuth < status.target) ||

         // South stop rotor, target outdated
         (rotctld.southStop === true  && status.motor == "CW" && status.azimuthSouth > status.targetSouth)  || // target has been outdated (CW)
         (rotctld.southStop === true  && status.motor == "CCW" && status.azimuthSouth < status.targetSouth)) { // target has been outdated (CW)
        
        sendCommand("+S");
        status.target = null;
        status.motor = "S";
        globalEmitter.emit('onTarget');
    }

    // Valid response detected
    return true;
  } 
  
  // by default return invalid message
  return false;
}





function manageProtocolError() {
    status.errors++;
    //TODO: controllo errori
//    console.log ("Command " + rotctlComm.sentCMD + " terminated with error code: " + replyError );

}






/* --------------------------------------------------------------------------------------------------------- */
/*                                          Event Receivers and Handlers                                     */
/* --------------------------------------------------------------------------------------------------------- */
client.on('error',    () => {hClosed()});
client.on('end',      () => {hClosed()});
client.on("connect",  () => {hEstablished()});
client.on('data', (data) => {hData(data);});

/* Connection event handlers */
function hEstablished() {
  console.log("Connected to " + rotctld.host + ": " + rotctld.port + " . Verify rotctld instance..")
  // Send basic command to verify we're connected to a rotctld instance
  sendCommand("1");
}


function hData (data) {
  // Append data to global buffer
  for (let i=0; i<data.length;i++) {
    status.rxBuffer += data.toString()[i];
    
    // Parse reply command when answer has been correctly reported
    let endOfCommand = status.rxBuffer.match("RPRT (-?[0-9]*)\n$")
    
    //End of command ?
    if (  endOfCommand != undefined  ) {
      // Completed without error ?
      if (endOfCommand[1] != '0') { manageProtocolError() }
      else {        
        // Evaluate reply and clear buffer
        checkReply(status.rxBuffer.substring(0,endOfCommand.index));
        status.rxBuffer = "";
      }
    }
  }  
}



function hClosed(){
  console.log("Connection to " + rotctld.host + ":" + rotctld.port + " closed. Retry in 2 sec.")
  
  // Notify GUI about disconnect
  globalEmitter.emit('disconnected');
  
  // Retry connection
  setTimeout(()=>{connect()},2000);

  // clear RX buffer
  status.rxBuffer = "";
  status.sent=[];
  status.connected = false;
}
