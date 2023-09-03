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
const myClasses = require('./myclasses.js');



/* --------------------------------------------------------------------------------------------------------- */
/*                                              Global objects                                               /*
/* --------------------------------------------------------------------------------------------------------- */



/* --------------------------------------------------------------------------------------------------------- */
/*                                            Exported Functions                                             /*
/* --------------------------------------------------------------------------------------------------------- */

exports.readConfigFile   = readConfigFile;


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
 * . fs                     (configFile.js)   
 *
 * Arguments:
 * . file: full path to configuration file
*/
function readConfigFile(file,config) {
  let JSONConfig= ""                          // JSON data from file
  let defcfg = new myClasses.config          // used for default config

  // Try to read and parse configuration file
  try {   
    // parse configuration file
    JSONConfig = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log("Reading configuration file " + file);
    JSONConfig = validateConfig(JSONConfig);
  } catch {
    console.error(file + " doesn't exist or is not a properly configured JSON file, loading default values...");
    JSONConfig = "{"
                  +" \"name\": \"" + defcfg.name + "\","
                  +" \"address\": \"" + defcfg.address + "\","
                  +" \"port\": " + defcfg.port + ","
                  +" \"polling\": " + defcfg.polling + ","
                  +" \"max_degree_error\": " + defcfg.error + ","
                  +" \"stop_degree\": " + defcfg.stop + ","
                  +" \"move_to_supported\": \"" + defcfg.moveTo + "\" "
                  +"}";
   
    // Save config file
    saveConfigFile(file, JSONConfig);
  }
  
  // populate configuration data structure passed from caller
  config.name    = JSONConfig.name;
  config.address = JSONConfig.address;
  config.port    = JSONConfig.port;
  config.polling = JSONConfig.polling;
  config.error   = JSONConfig.max_degree_error;
  config.stop    = JSONConfig.stop_degree;
  config.moveTo  = JSONConfig.move_to_supported;
  config.file    = path.basename(file);
  config.path    = path.dirname(file);
}



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
  let defcfg = new myClasses.config();         // empty "config" object used for default data

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
  if ( !isNaN(cfg.stop_degree) && cfg.stop != 180 && cfg.stop_degree != 0 ) {
    console.warn("Invalid configuration for \"stop\": " + cfg.stop_degree + " (allowed value: 0 or 180). Using default " + defcfg.stop);
    cfg.stop = defcfg.stop;
  } 

  // check for valid move_to_supported value
  if (cfg.move_to_supported.toString().match(/(y|n)/i) == undefined) {
    console.warn("Invalid configuration for \"move_to_supported\": " + cfg.move_to_supported + " (allowed value: Y or N). Using default " + cfg.moveTo);
    cfg.move_to_supported = defcfg.moveTo;
  }

  // Return updated config object
  return cfg;
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
*/
function saveConfigFile(file,cfg){
  try {
    // Create path and save
    fs.mkdirSync(path.dirname(file),{recursive:true});
    fs.writeFileSync(file,JSON.stringify(cfg,null,2));
  } catch {
    console.error("Unable to save config file " + file);
  }
}


