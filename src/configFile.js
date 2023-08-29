/* ---------------------------------------------------------------------------------------
 * File        : configFile.js
 * Author      : Civinini Luca - IK5PWC
 *                 luca@civinini.net - http://www.civinini.net
 *                 luca@ik5pwc.it    - http://www.ik5pwc.it
 *
 * Description : Manage configuration file 
 * ---------------------------------------------------------------------------------------
*/

/* ---------------- Required modules and files ---------------- */
const fs = require('fs');
const path = require('path');



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
const defaultCfg ="{"
                 +" \"name\": \"Rotator 1\","
                 +" \"address\": \"localhost\","
                 +" \"port\": " + defaultPort + ","
                 +" \"polling\": " + defaultPolling + ","
                 +" \"max_degree_error\": " + defaultMaxDegreeError + ","
                 +" \"stop\": \"" + defaultStop + "\","
                 +" \"move_to_supported\": \"" + defaultMoveToSupported + "\" "
                 +"}";

// Store configuration JSON
let configJSON= JSON.parse(defaultCfg);
let configFile = "";
let configPath = "";

/* --------------------------------------------------------------------------------------------------------- */
/*                                            Exported Functions                                             /*
/* --------------------------------------------------------------------------------------------------------- */

exports.readConfigFile   = readConfigFile;
exports.getName          = function () {return configJSON.name;};
exports.getAddress       = function () {return configJSON.address;};
exports.getPort          = function () {return configJSON.port;};
exports.getPolling       = function () {return configJSON.polling;};
exports.getminSkew       = function () {return configJSON.max_degree_error;};
exports.getStop          = function () {return configJSON.stop;};
exports.getMoveSupported = function () {return configJSON.move_to_supported;};
exports.getConfigFile    = function () {return configFile;};
exports.getConfigPath    = function () {return configPath;};


/*------------------------------------------------------
 * Function: readConfigFile
 * -------------------------------
 * Read  configuration file or apply default settings 
 *
 * Invoked by:
 * . event emitter          (main.js)
 *
 * Called Sub/Functions: 
 * . validateConfig         (configFile.js)
 *
 * Global variables used: 
 * . configJSON             (configFile.js)
 * . configFile             (configFile.js)
 * . configPath             (configFile.js)
 * 
 * Global Objects used: NONE
 * . fs                     (configFile.js)   
 *
 * Arguments:
 * . file: full path to configuration file
*/
function readConfigFile(file) {
  configPath = path.dirname(file);
  configFile = path.basename(file);

  // Try to read configuration file
  try {   
    // parse configuration file
    configJSON = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log("Reading configuration file " + file);
    validateConfig();
    
    
  } catch {
    console.error(file + " doesn't exist or is not a properly configured JSON file, loading default values...");

    // Save config file
    saveConfigFile(file);
  }
}




/* --------------------------------------------------------------------------------------------------------- */
/*                                        Module (private) functions                                         */
/* --------------------------------------------------------------------------------------------------------- */


/*------------------------------------------------------
 * Function: validateConfig
 * -------------------------------
 * Validate all configuration options, using
 * default values if configured one is wrong
 *
 * Invoked by:
 * . readConfigFile         (configFile.js)
 *
 * Called Sub/Functions: NONE
 * 
 * Global constants used:
 * . defaultPort            (configFile.js))
 * . defaultPolling         (configFile.js))
 * . defaultMaxDegreeError  (configFile.js))
 * . defaultStop            (configFile.js))
 * . defaultMoveToSupported (configFile.js))
 *
 * Global variables used: 
 * . configJSON             (configFile.js)
 *
 * Global Objects used: NONE                   
 *
 * Arguments: NONE
*/
function validateConfig () {
  
  // Check for valid port number
  if ( ! (!isNaN(configJSON.port) && configJSON.port >1 &&  configJSON.port < 65535)) {
    console.warn("Invalid configuration for \"port\": " + configJSON.port + " (allowed value: 1 ... 65535). Using default " + defaultPort);
    configJSON.port = defaultPort;
  } 

  // Check for valid polling rate 
  if ( ! (!isNaN(configJSON.polling) && configJSON.polling >200 &&  configJSON.polling < 9999)) {
    console.warn("Invalid configuration for \"polling\": " + configJSON.polling + "(allowed value: 100 ... 9999). Using default " + defaultPolling);
    configJSON.polling = defaultPolling;
  }

  // Check for valid max_degree_error value 
  if ( ! (!isNaN(configJSON.max_degree_error) && configJSON.max_degree_error >1 &&  configJSON.max_degree_error < 16)) {
    console.warn("Invalid configuration for \"max_degree_error\": " + configJSON.max_degree_error + " (allowed value: 1 ... 15). Using default: " + defaultMaxDegreeError);
    configJSON.max_degree_error = defaultMaxDegreeError;
  } 

  // Check for valid stop value 
  if (configJSON.stop.toString().match(/(s|n)/i) == undefined ) {
    console.warn("Invalid configuration for \"stop\": " + configJSON.stop + " (allowed value: S or N). Using default " + defaultStop);
    configJSON.stop = defaultStop;
  } 

  // check for valid move_to_supported value
  if (configJSON.move_to_supported.toString().match(/(y|n)/i) == undefined) {
    console.warn("Invalid configuration for \"move_to_supported\": " + configJSON.move_to_supported + " (allowed value: Y or N). Using default " + defaultMoveToSupported);
    configJSON.move_to_supported = defaultMoveToSupported;
  }
}



/*------------------------------------------------------
 * Function: saveConfigFile
 * -------------------------------
 * Write JSON configuration file to disk.
 *
 * Invoked by:
 * . readConfigFile         (configFile.js)
 *
 * Called Sub/Functions: NONE
 * 
 * Global constants used: NONE
 *
 * Global variables used: 
 * . configJSON             (configFile.js)
 *
 * Global Objects used: NONE                   
 *
 * Arguments: 
 * . file: full path to file to write
*/
function saveConfigFile(file){
  try {
    // Create path and save
    fs.mkdirSync(path.dirname(file),{recursive:true});
    fs.writeFileSync(file,JSON.stringify(configJSON,null,2));
  } catch {
    console.error("Unable to save config file " + file);
  }
}