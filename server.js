const mongoose = require('mongoose')
const config = require('config')
const Arena = require('./arena')

arena = new Arena()

mongoose.Promise = global.Promise
mongoose.connect(config.mongoConnection)

exports.socket = require('./socket/server')(arena)
exports.api = require('./api/server')(arena)