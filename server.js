const mongoose = require('mongoose')
const config = require('config')
const GameSocket = require('./socket/server')

mongoose.Promise = global.Promise
mongoose.connect(config.mongoConnection)

exports.socket = new GameSocket()
exports.api = require('./api/server')