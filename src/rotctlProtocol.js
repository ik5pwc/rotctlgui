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
const Net               = require('node:net'); 
const config            = require('./configFile.js');
const myClasses         = require('./myclasses.js');
const main              = require('./main.js');


/* --------------------------------------------------------------------------------------------------------- */
/*                                              Global objects                                               /*
/* --------------------------------------------------------------------------------------------------------- */


const client = new Net.Socket();                 // TCP Socket
const status = new myClasses.protocolStatus();   // protocol-related informations


/* --------------------------------------------------------------------------------------------------------- */
/*                                            Exported Functions                                             /*
/* --------------------------------------------------------------------------------------------------------- */


module.exports = {
  startPolling,
  connect,
  setTarget,
  turn
  /*configure*/ 
}


function configure (cfg) {
  config = JSON.parse(cfg)
}


/*------------------------------------------------------
 * Function: setTarget
 * -------------------------------
 * Point antenna to specified azimuth
 *
 * Invoked by:
 * . event emitter          (main.js)
 *
 * Called Sub/Functions: 
 * . sendCommand            (rotctlProtocol.js)
 * . turn                   (rotctlProtocol.js)
 * . stopMotor              (rotctlProtocol.js)
 *
 * Global variables used: 
 * . status                 (rotctlProtocol.js)
 * . main.config            (main.js)
 *
 * Arguments:
 * . target: pointer to configuration structure managing all configuration states
*/
function setTarget (target) {
  let current = status.azimuth;   // copy of current pointing
  let motor = "S"                 // set current motor status as STOP

  console.log("Pointing to " + target);
  
  // Store target in global status
  status.target = parseInt(target);
  
  // check target > minSkew
  if (Math.abs(status.azimuth - status.target) < config.error) {
    // target near to current azimuth, report as done
    main.onTarget(); 
    turn("S");

  } else {
    if (config.moveTo == 'Y') {
        // Rotor support "P" command, all job is performed by rotctld
        status.motor = "P"
        sendCommand("+P " + status.target + ".0 0.0") 
    } else {
      // Manage values when stop is at 180
      if (target > 180)  {target -= 2*config.stop;} 
      if (current > 180) {current -= 2*config.stop;} 
      
      // now that target and current have been properly scaled, check turn direction
      if (target < current) {turn ("CCW")} else {turn ("CW");}
    }
  }
}



/*------------------------------------------------------
 * Function: turn
 * -------------------------------
 * rotate motor CW or CCW or stop it
 *
 * Invoked by:
 * . event emitter          (main.js)
 *
 * Called Sub/Functions: 
 * . sendCommand            (rotctlProtocol.js)
 * . setTarget              (rotctlProtocol.js)
 *
 * Global variables used: NONE
 *
 * Arguments: 
 * . direction: can be CW or CCW or S to sopr motor
*/
function turn(direction) {
  if (status.isConnected) {
    switch (direction) {
      case "CW":
        console.log("Turning rotor CW");
        sendCommand("+M 16 0");
        status.motor = "CW";
        break;
      case "CCW":
        console.log("Turning rotor CCW");
        sendCommand("+M 8 0");
        status.motor = "CCW";
        break;
      case "S":
        console.log("Stopping motor");
        sendCommand("+S");

        status.motor = "S";
        break;
    }
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
 * . main.config            (main.js)
 *
 * Arguments: NONE
*/
function connect() {
  
  // Disconnect active connections
  if (client.isConnected) {
    console.log("Closing connection to " + client.address + ":" + client.port);
    client.destroy();
  }

  // Logging
  console.log("Starting connection to " + config.address + ":" + config.port);
  
  // Generic connection parameters
  client.setKeepAlive = true;
  client.setTimeout = 2000;

  // Start Connection
  client.connect({ port: config.port, host: config.address },undefined);
}



/*------------------------------------------------------
 * Function: startPolling
 * -------------------------------
 * Start polling rotctld for position (if connected) 
 *
 * Invoked by:
 * . startup                (main.js)
 * . updateConfiguration
 *
 * Called Sub/Functions: NONE
 *
 * Global variables used: 
 * . status                 (rotctlProtocol.js)
 *
 * Arguments: 
 * . rate: polling rate in milliseconds
*/
function startPolling(rate) {
  if (status.pollID != 0) {clearInterval(status.poll)}
  status.pollID = setInterval(() => {if (status.connected) {sendCommand("+p")}},rate);
}



/* --------------------------------------------------------------------------------------------------------- */
/*                                        Module (private) functions                                         /*
/* --------------------------------------------------------------------------------------------------------- */

/*------------------------------------------------------
 * Function: sendCommand
 * -------------------------------
 * Send specific command to rotctld
 *
 * Invoked by:
 * . hEstablished           (rotctlProtocol.js)
 * . polling Timer ()            (rotctlProtocol.js)
 * . setTarget              (rotctlProtocol.js)
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



/*--------------------------------
 * Function: checkReply
 * -------------------------------
 * Evaluate replies to sent commands
 *
 * Invoked by:sendCommand(
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



/*------------------------------------------------------
 * Function: replySetPos
 * -------------------------------
 * Evaluate reply when command sent was "+P"
 *
 * Invoked by:
 * . checkReply             (rotctlProtocol.js)
 *module.exports = function () {
  console.log("hello world")
}
 * Called Sub/Functions: NONE 
 * 
 * Global variables used: NONE
 * 
 * Arguments: 
 * . buffer: string containing reply to be evaluated
*/
function replySetPos(buffer) {
  let replySetPos = buffer.match('set_pos: (-?[0-9]{1,})\.[0-9]{1,} 0.0');
  if (replySetPos != undefined) {return true;} else {return false;}
}



/*------------------------------------------------------
 * Function: replyCapabilities
 * -------------------------------
 * Evaluate reply when command sent was "1"
 *
 * Invoked by:
 * . checkReply             (rotctlProtocol.js)
 *
 * Called Sub/Functions: 
 * . pollAzimuth            (rotctlProtocol.js) 
 * . globalEmitter          (node_events.js)
 * 
 * Global variables used: NONE
 * 
 * Arguments: 
 * . buffer: string containing reply to be evaluated
*/
function replyCapabilities(buffer) {
  // Message format
  let model = buffer.match("Model name:\t\t(.*)\n");       
  
  if (model != undefined) { 
    console.log("Rotator model: " + model[1]);
    status.connected = true;                            // update connection status
    main.isConnected(true);                             // inform GUI about status

    // Valid response detected
    return true;
  }
  // by default return invalid message
  return false;
}



/*------------------------------------------------------
 * Function: replyGetPos
 * -------------------------------
 * Evaluate reply when command sent was "+p"
 *
 * Invoked by:
 * . checkReply             (rotctlProtocol.js)
 *
 * Called Sub/Functions: 
 * . sendCommand            (rotctlProtocol.js)
 * . globalEmitter          (node_events.js)
 * 
 * Global variables used: 
 * . status                 (rotctlProtocol.js)
 * 
 * Arguments: 
 * . buffer: string containing reply to be evaluated
*/
function replyGetPos(buffer){
  let target = status.target;     // Target and current position used
  let current = 0;                // to perform calculation without altering "master value" 
  
  // Message format
  let replyPos = buffer.match('get_pos:\nAzimuth: (-?[0-9]{1,})\.[0-9]{2}\nElevation: [0-9]{1,}\.[0-9]{2}\n');
  
  if (replyPos != undefined) {
    // Save value and send event to main application
    status.azimuth = replyPos[1];
    current = status.azimuth;
    main.curAzimuth(status.azimuth);

    // Computer target and azimuth based on "stop"
    if (current > 180) {current -=2*config.stop;}
    if (target > 180)  {target  -=2*config.stop;}
    
    // Check for target or  errors
    if ( (status.motor != "S" && status.target != null) &&
         ( ( status.azimuth == config.stop ) ||                               // Stop position reached
           (Math.abs(status.azimuth - status.target) < config.error) ||       // near target
           (current > target && status.motor == "CW") ||
           (current < target && status.motor == "CCW")                             // target overshot 
   
         )
      ) {
         // stop motor and inform target has been reached
         turn("S");
         status.target = null;
         main.onTarget();
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
// Simply ignore any kind of error
client.on('error',() => {});



/*------------------------------------------------------
 * Event: net.socket close
 * -------------------------------
 * Triggered when socket is closed: connection
 * retry after 2 seconds
 *
 * Invoked by:
 * . Net                    (nodejs Net module)
 *
 * Called Sub/Functions: 
 * . connect                (rotctlProtocol.js)
 * . main.isConnected       (main.js)
 * 
 * Global variables used: 
 * . status                 (rotctlProtocol.js)
 * 
 * Arguments: NONE
*/
client.on('close',() => {
  console.warn("Connection to " + config.address + ":" + config.port + " closed. Retry in 2 sec.")
  
  // Notify GUI about disconnect
  main.isConnected(false);
  
  // Retry connection
  setTimeout(()=>{connect()},2000);

  // clear RX buffer
  status.rxBuffer = "";
  status.sent=[];
  status.connected = false;
});



/* Connection event handlers */
client.on("connect",  () => {
  console.log("Connected to " + config.address + ": " + config.port + " . Verify rotctld instance..")

  // Send basic command to verify we're connected to a rotctld instance
  sendCommand("1");
});



client.on('data',(data) => {
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
});


