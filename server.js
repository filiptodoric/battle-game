const mongoose = require('mongoose')
const config = require('config')

mongoose.Promise = global.Promise
mongoose.connect(config.mongoConnection)

exports.socket = require('./socket/server').io()
exports.api = require('./api/server')