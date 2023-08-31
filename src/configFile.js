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

// Below the default values for all parameters

//CFGDefault.port    = 4533;
//CFGDefault.polling = 500;
//CFGDefault.error   = 5;
//CFGDefault.stop    = "S";
//CFGDefault.moveTo  = "N";


// Here is the corresponding JSON for default config
/*
const JSONdefault ="{"
                 +" \"name\": \"Rotator 1\","
                 +" \"address\": \"localhost\","
                 +" \"port\": " + CFGDefault.port + ","
                 +" \"polling\": " + CFGDefault.polling + ","
                 +" \"max_degree_error\": " + CFGDefault.error + ","
                 +" \"stop\": \"" + CFGDefault.stop + "\","
                 +" \"move_to_supported\": \"" + CFGDefault.moveTo + "\" "
                 +"}";
*/
// Store configuration JSON
//let JSONConfig= JSON.parse(JSONdefault);
let configFile = "";
let configPath = "";

/* --------------------------------------------------------------------------------------------------------- */
/*                                            Exported Functions                                             /*
/* --------------------------------------------------------------------------------------------------------- */

exports.readConfigFile   = readConfigFile;
exports.getName          = function () {return JSONConfig.name;};
exports.getAddress       = function () {return JSONConfig.address;};
exports.getPort          = function () {return JSONConfig.port;};
exports.getPolling       = function () {return JSONConfig.polling;};
exports.getminSkew       = function () {return JSONConfig.max_degree_error;};
exports.getStop          = function () {return JSONConfig.stop;};
exports.getMoveSupported = function () {return JSONConfig.move_to_supported;};
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
function readConfigFile(file,config) {
  let JSONConfig= ""                             // JSON data from file
  //let configFromFile = new myClasses.config();   // configuration object

  // Try to read configuration file
  try {   
    // parse configuration file
    JSONConfig = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log("Reading configuration file " + file);
    JSONConfig = validateConfig(JSONConfig);
  } catch {
    console.error(file + " doesn't exist or is not a properly configured JSON file, loading default values...");
    JSONConfig = createJSONfromConfig(new myClasses.config);

    // Save config file
    saveConfigFile(file, JSONConfig);
  }
  
  // populate configuration data structure passed from caller
  config.name    = JSONConfig.name;
  config.address = JSONConfig.address;
  config.port    = JSONConfig.port;
  config.polling = JSONConfig.polling;
  config.error   = JSONConfig.error;
  config.stop    = JSONConfig.stop;
  config.moveTo  = JSONConfig.port;
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
function validateConfig (cfg) {
  let defcfg = new myClasses.config();         // empty "config" object used for default data

  // Check for valid port number
  if ( ! (!isNaN(cfg.port) && cfg.port >1 &&  cfg.port < 65535)) {
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
  if (cfg.stop.toString().match(/(s|n)/i) == undefined ) {
    console.warn("Invalid configuration for \"stop\": " + cfg.stop + " (allowed value: S or N). Using default " + defcfg.stop);
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
 * Global variables used: 
 * . configJSON             (configFile.js)
 *
 * Global Objects used: NONE                   
 *
 * Arguments: 
 * . file: full path to file to write
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



function createJSONfromConfig(cfg) {

  const JSONdefault ="{"
  +" \"name\": \"" + cfg.name + "\","
  +" \"address\": \"" + cfg.address + "\","
  +" \"port\": " + cfg.port + ","
  +" \"polling\": " + cfg.polling + ","
  +" \"max_degree_error\": " + cfg.error + ","
  +" \"stop\": " + cfg.stop + ","
  +" \"move_to_supported\": \"" + CFGDefault.moveTo + "\" "
  +"}";



}