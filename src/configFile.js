/* ---------------------------------------------------------------------------------------
 * File        : configFile.js
 * Author      : Civinini Luca - IK5PWC
 *                 luca@civinini.net - http://www.civinini.net
 *                 luca@ik5pwc.it    - http://www.ik5pwc.it
 *
 * Description : Manage configuration file 
 * ---------------------------------------------------------------------------------------
*/

/* --------------------- Required modules --------------------- */
const fs = require('fs');


/* --------------------------------------------------------------------------------------------------------- */
/*                                              Global objects                                               /*
/* --------------------------------------------------------------------------------------------------------- */

// Below the default values for all parameters
const defaultPort            = 4533;
const defaultPolling         = 500;
const defaultMaxDegreeError  = 5;
const defaultStop            = "S";
const defaultMoveToSupported = "N";

// Here is the corresponding JSON for default config
const defaultCfg ="{\n"
                 +" \"name\": \"Rotator 1\",\n"
                 +" \"address\": \"localhost\",\n"
                 +" \"port\": " + defaultPort + ",\n"
                 +" \"polling\": " + defaultPolling + ",\n"
                 +" \"max_degree_error\": " + defaultMaxDegreeError + ",\n"
                 +" \"stop\": \"" + defaultStop + "\",\n"
                 +" \"move_to_supported\": \"" + defaultMoveToSupported + "\" \n"
                 +"}";

// Store configuration JSON
let configJSON= JSON.parse(defaultCfg);

/* --------------------------------------------------------------------------------------------------------- */
/*                                            Exported Functions                                             /*
/* --------------------------------------------------------------------------------------------------------- */

exports.readConfig = readConfig;
exports.getName          = function () {return configJSON.name;};
exports.getAddress       = function () {return configJSON.address;};
exports.getPort          = function () {return configJSON.port;};
exports.getPolling       = function () {return configJSON.polling;};
exports.getminSkew       = function () {return configJSON.max_degree_error;};
exports.getStop          = function () {return configJSON.stop;};
exports.getMoveSupported = function () {return configJSON.move_to_supported;};


function readConfig(dir, name ='default.json' ) {
  let fullConfigFilePath = dir + "/" + name;                  //full path to file

  // Try to read configuration file
  try {   
    // parse configuration file
    configJSON = JSON.parse(fs.readFileSync(fullConfigFilePath, 'utf8')); 
    console.log("Reading configuration file " + fullConfigFilePath);
    validateConfig(config);
  } catch {
    console.error(fullConfigFilePath + " doesn't exist or is not a properly configured JSON file, loading default values...");
    configJSON = JSON.parse(defaultCfg);
  }
}

function validateConfig (json) {
  
  // Check for valid port number
  if ( ! (!isNaN(json.port) && json.port >1 &&  json.port < 65535)) {
    console.warn("Invalid configuration for \"port\": " + json.port + " (allowed value: 1 ... 65535). Using default " + defaultPort);
    json.port = defaultPort;
  } 

  // Check for valid polling rate 
  if ( ! (!isNaN(json.polling) && json.polling >200 &&  json.polling < 9999)) {
    console.warn("Invalid configuration for \"polling\": " + json.polling + "(allowed value: 100 ... 9999). Using default " + defaultPolling);
    json.polling = defaultPolling;
  }

  // Check for valid max_degree_error value 
  if ( ! (!isNaN(json.max_degree_error) && json.max_degree_error >1 &&  json.max_degree_error < 16)) {
    console.warn("Invalid configuration for \"max_degree_error\": " + json.max_degree_error + " (allowed value: 1 ... 15). Using default: " + defaultMaxDegreeError);
    json.max_degree_error = defaultMaxDegreeError;
  } 

  // Check for valid stop value 
  if (json.stop.toString().match(/(s|n)/i) == undefined ) {
    console.warn("Invalid configuration for \"stop\": " + json.stop + " (allowed value: S or N). Using default " + defaultStop);
    json.stop = defaultStop;
  } 

  // check for valid move_to_supported value
  if (json.move_to_supported.toString().match(/(y|n)/i) == undefined) {
    console.warn("Invalid configuration for \"move_to_supported\": " + json.move_to_supported + " (allowed value: Y or N). Using default " + defaultMoveToSupported);
    json.move_to_supported = defaultMoveToSupported;
  }
}

