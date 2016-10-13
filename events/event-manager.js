const EventEmitter = require('events')

class EventManager extends EventEmitter {}

const manager = new EventManager()

module.exports = manager