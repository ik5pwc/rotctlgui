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
const fs        = require('fs');
const path      = require('path');
const os        = require("os");
const myClasses = require('./myclasses.js');


/* --------------------------------------------------------------------------------------------------------- */
/*                                              Global objects                                               /*
/* --------------------------------------------------------------------------------------------------------- */



/* --------------------------------------------------------------------------------------------------------- */
/*                                            Exported Functions                                             /*
/* --------------------------------------------------------------------------------------------------------- */

exports.readConfigFile   = readConfigFile;
exports.writeConfigFile  = writeConfigFile;


/*------------------------------------------------------
 * Function: readConfigFile
 * -------------------------------
 * Read  configuration file and return settings 
 *
 * Invoked by:
 * . startup                (main.js)
 *
 * Called Sub/Functions: 
 * . validateConfig         (configFile.js)
 *
 * Global variables used: NONE
 * 
 * Global Objects used: NONE
 * . fs            

Use the os.EOL constant instead.

var os = require("os");         (configFile.js)   
 *
 * Arguments:
 * . file: full path to configuration file
*/
function readConfigFile(config) {
  let JSONConfig= ""                              // JSON data from file
  let defcfg = new myClasses.config               // used for default config
  let file = path.join(config.path,config.file);  // full file path

  // Set the default config file name and path the same as passed from caller
  defcfg.path = config.path;
  defcfg.file = config.file;

  // Try to read and parse configuration file
  try {   
    // parse configuration file
    JSONConfig = JSON.parse(fs.readFileSync(file, 'ascii'));
    console.log("Reading configuration file " + file);
    JSONConfig = validateConfig(JSONConfig);
   
    // populate configuration data structure passed from caller
    config.name    = JSONConfig.name;
    config.address = JSONConfig.address;
    config.port    = JSONConfig.port;
    config.polling = JSONConfig.polling;
    config.error   = JSONConfig.max_degree_error;
    config.stop    = JSONConfig.stop_degree;
    config.moveTo  = JSONConfig.move_to_supported;
    
  } catch {
    console.error(file + " doesn't exist or is not a properly configured JSON file, creating it using default values...");
    
    // Save config file
    writeConfigFile(defcfg);

    // Return default values
    config.name    = defcfg.name;
    config.address = defcfg.address;
    config.port    = defcfg.port;
    config.polling = defcfg.polling;
    config.error   = defcfg.max_degree_error;
    config.stop    = defcfg.stop_degree;
    config.moveTo  = defcfg.move_to_supported;
  }
}



/*------------------------------------------------------
 * Function: writeConfigFile
 * -------------------------------
 * Write JSON configuration file to disk.
 *
 * Invoked by:
 * . readConfigFile         (configFile.js)
 * . electron ipc           (main.js)
 *
 * Called Sub/Functions: NONE
 * 
 * Global constants used: NONE
 *
 * Global variables used: NONE
 *
 * Global Objects used: NONE                   
 *
 * Arguments: 
 * . config: configuration object to write to file
 * 
*/
function writeConfigFile(config){
  let JSONConfig= ""                              // JSON data to file
  let file = path.join(config.path,config.file);  // full file path

  // Create JSON string data
  JSONConfig = "{" + os.EOL
                +" \"name\": \"" + config.name + "\"," + os.EOL
                +" \"address\": \"" + config.address + "\"," + os.EOL
                +" \"port\": " + config.port + "," + os.EOL
                +" \"polling\": " + config.polling + "," + os.EOL
                +" \"max_degree_error\": " + config.error + "," + os.EOL
                +" \"stop_degree\": " + config.stop + "," + os.EOL
                +" \"move_to_supported\": \"" + (config.moveTo ? "Y" : "N" ) + "\" " + os.EOL
              +"}";

  try {
    // Create path and save
    fs.mkdirSync(config.path,{recursive:true});
    fs.writeFileSync(file,JSONConfig,{encoding:'ascii',flag:'w'});
  } catch {
    console.error("Unable to save config file " + file);
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
 * Global variables used: NONE
 *
 * Global Objects used: NONE                   
 *
 * Arguments: 
 * . file: full path to file to write
 * . cfg: JSON configuration string
 * 

function saveConfigFile(config){
  let JSONConfig= ""                          // JSON data to file

  // Create file data
  JSONConfig = "{"
                +" \"name\": \"" + config.name + "\","
                +" \"address\": \"" + config.address + "\","
                +" \"port\": " + config.port + ","
                +" \"polling\": " + config.polling + ","
                +" \"max_degree_error\": " + config.error + ","
                +" \"stop_degree\": " + config.stop + ","
                +" \"move_to_supported\": \"" + config.moveTo + "\" "
              +"}";

  try {
    // Create path and save
    fs.mkdirSync(config.path,{recursive:true});
    fs.writeFileSync(zz,JSON.stringify(JSONcfg,null),{encoding:'ascii'});
  } catch {
    console.error("Unable to save config file " + file);
  }
}
/*


/* --------------------------------------------------------------------------------------------------------- */
/*                                        Module (private) functions                                         */
/* --------------------------------------------------------------------------------------------------------- */


/*------------------------------------------------------
 * Function: validateConfig
 * -------------------------------
 * Validate all configuration options, using
 * default values if a value is wrong. Return a 
 * "clean"  JSON string
 *
 * Invoked by:
 * . readConfigFile         (configFile.js)
 *
 * Called Sub/Functions: NONE
 * 
 * Global constants used: NONE
 *
 * Global variables used: NONE 
 *
 * Global Objects used: NONE                   
 *
 * Arguments: 
 * . cfg: configuration data in JSON format
 */
function validateConfig (cfg) {
  let defcfg = new myClasses.config();         // empty "config" object used for loading default if error found

  // Check for valid port number
  if ( ! (!isNaN(cfg.port) && cfg.port >1024 &&  cfg.port < 65535)) {
    console.warn("Invalid configuration for \"port\": " + cfg.port + " (allowed value: 1 ... 65535). Using default " + defcfg.port);
    cfg.port = defcfg.port;
  } 

  // Check for valid polling rate 
  if ( ! (!isNaN(cfg.polling) && cfg.polling >200 &&  cfg.polling < 9999)) {
    console.warn("Invalid configuration for \"polling\": " + cfg.polling + "(allowed value: 100 ... 9999). Using default " + defcfg.polling);
    cfg.polling = defcfg.polling;
  }

  // Check for valid max_degree_error value 
  if ( ! (!isNaN(cfg.max_degree_error) && cfg.max_degree_error >1 &&  cfg.max_degree_error < 16)) {
    console.warn("Invalid configuration for \"max_degree_error\": " + cfg.max_degree_error + " (allowed value: 1 ... 15). Using default: " + defcfg.error);
    cfg.max_degree_error = defcfg.error;
  } 

  // Check for valid stop value 
  if ( !isNaN(cfg.stop_degree) && cfg.stop_degree != 180 && cfg.stop_degree != 0 ) {
    console.warn("Invalid configuration for \"stop\": " + cfg.stop_degree + " (allowed value: 0 or 180). Using default " + defcfg.stop);
    cfg.stop = defcfg.stop;
  } 

  // check for valid move_to_supported value
  if (cfg.move_to_supported.toString().match(/(y|n)/i) == undefined) {
    console.warn("Invalid configuration for \"move_to_supported\": " + cfg.move_to_supported + " (allowed value: Y or N). Using default " + cfg.moveTo);
    cfg.move_to_supported = defcfg.moveTo;
  }

  // Return updated config object
  return cfg
}
