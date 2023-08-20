const EventEmitter = require('events');
const globalEmitter = new EventEmitter();
exports.globalEmitter = globalEmitter;