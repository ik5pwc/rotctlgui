/* --------------------------------------------------------------------------------------- 
 * File        : gui/config/js/config.js
 * Author      : Civinini Luca - IK5PWC
 *               luca@ik5pwc.it
 *               http://www.ik5pwc.it
 *
 * Description : Javascript functions used within the config page
 * ---------------------------------------------------------------------------------------
*/

// Global object storing current configuration
const g_currentCFG = {
    name    : "Rotator 1",
    address : "localhost",
    port    : 4533,
    polling : 500,
    error   : 0,
    stop    : 0,
    moveTo  : "",
    file    : "default.json",
    path    : ""
};  