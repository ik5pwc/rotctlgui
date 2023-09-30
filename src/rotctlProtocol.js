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
const Net       = require('node:net'); 
const config    = require('./configFile.js');
const myClasses = require('./myclasses.js');
const main      = require('./main.js');


/* --------------------------------------------------------------------------------------------------------- */
/*                                              Global objects                                               /*
/* --------------------------------------------------------------------------------------------------------- */

const client = new Net.Socket();                   // TCP Socket
const g_status = new myClasses.protocolStatus();   // protocol-related informations

// Real constant: how many errors before closing connection
const MAX_ERRORS = 3;


/* --------------------------------------------------------------------------------------------------------- */
/*                                            Exported Functions                                             /*
/* --------------------------------------------------------------------------------------------------------- */

module.exports = {
  startPolling,
  connect,
  setTarget,
  turn
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
 * . sendCommand            (this file)
 * . turn                   (this file)
 * . stopMotor              (this file)
 *
 * Global variables used: 
 * . g_status               (this file)
 * . main.config            (main.js)
 *
 * Arguments:
 * . target: pointer to configuration structure managing all configuration states
*/
function setTarget (target) {
  let current = g_status.azimuth;   // copy of current pointing
  let motor = "S"                 // set current motor status as STOP

  console.log("Pointing to " + target);
  
  // Store target in global status
  g_status.target = parseInt(target);
  
  // check target > minSkew
  if (Math.abs(g_status.azimuth - g_status.target) < config.error) {
    // target near to current azimuth, report as done
    main.onTarget(); 
    turn("S");

  } else {
    if (config.moveTo == 'Y') {
        // Rotor support "P" command, all job is performed by rotctld
        g_status.motor = "P"
        sendCommand("+P " + g_status.target + ".0 0.0") 
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
  if (g_status.isConnected) {
    switch (direction) {
      case "CW":
        console.log("Turning rotor CW");
        sendCommand("+M 16 0");
        g_status.motor = "CW";
        break;
      case "CCW":
        console.log("Turning rotor CCW");
        sendCommand("+M 8 0");
        g_status.motor = "CCW";
        break;
      case "S":
        console.log("Stopping motor");
        sendCommand("+S");

        g_status.motor = "S";
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
 * . g_status               (thi file)
 *
 * Arguments: 
 * . rate: polling rate in milliseconds
*/
function startPolling(rate) {
  if (g_status.pollID != 0) {clearInterval(g_status.poll)}
  g_status.pollID = setInterval(() => {if (g_status.connected) {sendCommand("+p")}},rate);
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
 * . g_status               (this file)
 * . client                 (rotctlProtocol.js)
 * 
 * Arguments: 
 * . cmd: command to send
*/
function sendCommand(cmd) {
  // Send command only if connection is established
  if (! client.closed) { 
    g_status.sent.push(cmd); 
    client.write (cmd + "\n");
  }
}



/*--------------------------------
 * Function: checkReply
 * -------------------------------
 * Evaluate replies to sent commands
 *
 * Invoked by:sendCommand(
 * . client data event      (this file)
 *
 * Called Sub/Functions: 
 * . replyCapabilities      (this file)
 * . replyGetPos            (this file)
 * . replySetPos            (this file)
 * . manageProtocolError    (this file)
 * 
 * Global variables used: 
 * . g_status               (this file)
 * 
 * Arguments: 
 * . reply: string containing reply to be evaluated
*/
function checkReply(reply) {
  let replyOK = false;        // by default reply is wrong

  switch (g_status.sent.pop().substring(0,2)) {
    case "1" : replyOK = replyCapabilities(reply); break; 
    case "+p": replyOK = replyGetPos(reply)      ; break;
    case "+P": replyOK = replySetPos(reply)      ; break;       
    case "+S": replyOK = true                    ; break;       // Reply to Stop command    
    case "+M": replyOK = true                    ; break;       // Reply to Move command
  }

  // if reply has been successfull parsed, then clear error control else evaulate communications
  if (replyOK) {g_status.errors = 0;} else {manageProtocolError();}
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
    g_status.connected = true;                            // update connection status
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
 * . checkReply             (this file)
 *
 * Called Sub/Functions: 
 * . sendCommand            (this file)
 * . globalEmitter          (node_events.js)
 * 
 * Global variables used: 
 * . g_status               (this file)
 * 
 * Arguments: 
 * . buffer: string containing reply to be evaluated
*/
function replyGetPos(buffer){
  let target = g_status.target;     // Target and current position used
  let current = 0;                // to perform calculation without altering "master value" 
  
  // Message format
  let replyPos = buffer.match('get_pos:\nAzimuth: (-?[0-9]{1,})\.[0-9]{2}\nElevation: [0-9]{1,}\.[0-9]{2}\n');
  
  if (replyPos != undefined) {
    // Save value and send event to main application
    g_status.azimuth = replyPos[1];
    current = g_status.azimuth;
    main.curAzimuth(g_status.azimuth);

    // Computer target and azimuth based on "stop"
    if (current > 180) {current -=2*config.stop;}
    if (target > 180)  {target  -=2*config.stop;}
    
    // Check for target or  errors
    if ( (g_status.motor != "S" && g_status.target != null) &&
         ( ( g_status.azimuth == config.stop ) ||                               // Stop position reached
           (Math.abs(g_status.azimuth - g_status.target) < config.error) ||       // near target
           (current > target && g_status.motor == "CW") ||
           (current < target && g_status.motor == "CCW")                             // target overshot 
   
         )
      ) {
         // stop motor and inform target has been reached
         turn("S");
         g_status.target = null;
         main.onTarget();
    }

    // Valid response detected
    return true;
  } 
  
  // by default return invalid message
  return false;
}



/*------------------------------------------------------
 * Function: manageProtocolError
 * -------------------------------
 * Keep track on rotcld protocoll error and disconnect
 * if limit is reached
 *
 * Invoked by:
 * . checkReply             (this file)
 *
 * Called Sub/Functions: 
 * . sendCommand            (this file)
 * . globalEmitter          (node_events.js)
 * 
 * Global variables used: 
 * . g_status               (this file)
 * 
 * Arguments: 
 * . buffer: string containing reply to be evaluated
*/
function manageProtocolError() {
  // Increment error counter
  g_status.errors++;

  if (g_status.errors > MAX_ERRORS) {
     console.error("Too many protocol errors, disconnecting");
    connect()
  }
}





/* --------------------------------------------------------------------------------------------------------- */
/*                                          Event Receivers and Handlers                                     */
/* --------------------------------------------------------------------------------------------------------- */
// Simply ignore any protocol of error
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
 * . connect                (this file)
 * . main.isConnected       (main.js)
 * 
 * Global variables used: 
 * . g_status               (this file)
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
  g_status.rxBuffer = "";
  g_status.sent=[];
  g_status.connected = false;
});



/*------------------------------------------------------
 * Event: net.socket connect
 * -------------------------------
 * Triggered when socket connects and then send "1" command
 * to retrieve rotator capabilities (used to check the other
 * side is really a rotctld instance)
 *
 * Invoked by:
 * . Net                    (nodejs Net module)
 *
 * Called Sub/Functions: 
 * . sendCommand            (this file)
 * 
 * Global variables used: NONE 
 * 
 * Arguments: NONE
*/
client.on("connect",  () => {
  console.log("Connected to " + config.address + ": " + config.port + " . Verify rotctld instance..")

  // Send basic command to verify we're connected to a rotctld instance
  sendCommand("1");
});



/*------------------------------------------------------
 * Event: net.socket data
 * -------------------------------
 * Triggered when socket receive data.
 *
 * Invoked by:
 * . Net                    (nodejs Net module)
 *
 * Called Sub/Functions: 
 * . checkReply             (this file)
 * 
 * Global variables used: NONE 
 * 
 * Arguments: NONE
*/
client.on('data',(data) => {
  // Append data to global buffer
  for (let i=0; i<data.length;i++) {
    g_status.rxBuffer += data.toString()[i];
    
    // Parse reply command when answer has been correctly reported
    let endOfCommand = g_status.rxBuffer.match("RPRT (-?[0-9]*)\n$")
    
    //End of command ?
    if (  endOfCommand != undefined  ) {
      // Completed without error ?
      if (endOfCommand[1] != '0') { 
        manageProtocolError() 
      } else {        
        // Evaluate reply and clear buffer
        checkReply(g_status.rxBuffer.substring(0,endOfCommand.index));
        g_status.rxBuffer = "";
      }
    }
  }  
});