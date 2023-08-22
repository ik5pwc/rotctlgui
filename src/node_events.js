/* ---------------------------------------------------------------------------------------
 * File        : node_events.js
 * Author      : Civinini Luca - IK5PWC
 *                 luca@civinini.net - http://www.civinini.net
 *                 luca@ik5pwc.it    - http://www.ik5pwc.it
 *
 * Description : Global event emitter available in all modules 
 * ---------------------------------------------------------------------------------------
*/
const EventEmitter = require('events');
const globalEmitter = new EventEmitter();
exports.globalEmitter = globalEmitter;