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
/*                                          Module Global objects                                            /*
/* --------------------------------------------------------------------------------------------------------- */
let g_config = new myClasses.config;
let g_config_json = "";


/* --------------------------------------------------------------------------------------------------------- */
/*                                            Exported Functions                                             /*
/* --------------------------------------------------------------------------------------------------------- */
module.exports ={
  readConfigFile : readConfigFile,  
  writeConfigFile: writeConfigFile,
  
  getAsJSONString: ()  => {return JSON.stringify(g_config)},
  setAsJSONString: (x) => {g_config = JSON.parse(x)},

  // Exporting properties
  get name()     { return g_config.name;},         // name (read)
  set name(x)    { g_config.name = x;},            // name (write)

  get address()  { return g_config.address;},      // Address (read)
  set address(x) { g_config.address = x;},         // Address (write)
  
  get port()     { return g_config.port;},         // Port (read)
  set port(x)    { g_config.port = x;},            // port (write)
  
  get polling()  { return g_config.polling;},      // Polling (read)
  set polling(x) { g_config.polling = x;},         // Polling (write)

  get error()    { return g_config.error;},        // Error (read)
  set error(x)   { g_config.error = x;},           // Error (write)

  get stop()     { return g_config.stop;},         // Stop (read) 
  set stop(x)    { g_config.stop = x;},            // Stop (write) 

  get file()     { return g_config.file;},         // file (read)
  set file(x)    { g_config.file = x;},            // file (write)
 
  get path()     { return g_config.path;},         // path (read)
  set path(x)    { g_config.path = x;},            // path (write)
 
  get moveTo()   { return g_config.moveTo;},       // moveTo (read)
  set moveTo(x)  { g_config.moveTo = x;},          // moveTo (write)

  get json()     { return JSON.stringify(g_config)},
  set json(x) {},

}



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
function readConfigFile(dir,file) {
  let JSONConfig= ""                              // JSON data from file
  let defcfg = new myClasses.config               // used for default config
  let fullFilePath = path.join(dir,file);        // full file path

  // Set the default config file name and path the same as passed from caller
  defcfg.path = dir;
  defcfg.file = file;

  // Try to read and parse configuration file
  try {   
    // parse configuration file
    JSONConfig = JSON.parse(fs.readFileSync(fullFilePath, 'ascii'));
    console.log("Reading configuration file " + fullFilePath);
    JSONConfig = validateConfig(JSONConfig);
   
    // populate configuration data structure passed from caller
    g_config.name    = JSONConfig.name;
    g_config.address = JSONConfig.address;
    g_config.port    = JSONConfig.port;
    g_config.polling = JSONConfig.polling;
    g_config.error   = JSONConfig.max_degree_error;
    g_config.stop    = JSONConfig.stop_degree;
    g_config.moveTo  = JSONConfig.move_to_supported;
    g_config.path    = dir;
    g_config.file    = file;
    
  } catch {
    console.error(fullFilePath + " doesn't exist or is not a properly configured JSON file, creating it using default values...");
    
    // Use default values
    g_config.name    = defcfg.name;
    g_config.address = defcfg.address;
    g_config.port    = defcfg.port;
    g_config.polling = defcfg.polling;
    g_config.error   = defcfg.max_degree_error;
    g_config.stop    = defcfg.stop_degree;
    g_config.moveTo  = defcfg.move_to_supported;
    g_config.file    = dir;
    g_config.path    = path;
  
    // Save config file
     writeConfigFile();
  }
  prova="plutolo";
  exports.prova = prova;
}



/*------------------------------------------------------
 * Function: writeConfigFile
 * -------------------------------
 * Write configuration data to disk in JSON format.
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
function writeConfigFile(){
  let JSONConfig= ""                              // JSON data to file
  let fullFilePath = path.join(g_config.path,g_config.file);  // full file path

  // Create JSON string data
  JSONConfig = "{" + os.EOL
                +" \"name\": \""              + g_config.name                  + "\"," + os.EOL
                +" \"address\": \""           + g_config.address               + "\"," + os.EOL
                +" \"port\": "                + g_config.port                  + ","   + os.EOL
                +" \"polling\": "             + g_config.polling               + ","   + os.EOL
                +" \"max_degree_error\": "    + g_config.error                 + ","   + os.EOL
                +" \"stop_degree\": "         + g_config.stop                  + ","   + os.EOL
                +" \"move_to_supported\": \"" + (g_config.moveTo ? "Y" : "N" ) + "\""  + os.EOL
              +"}";

  try {
    // Create path and save
    fs.mkdirSync(g_config.path,{recursive:true});
    fs.writeFileSync(fullFilePath,JSONConfig,{encoding:'ascii',flag:'w'});
  } catch {
    console.error("Unable to save config file " + fullFilePath);
  }
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
