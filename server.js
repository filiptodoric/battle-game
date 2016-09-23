const mongoose = require('mongoose')
const config = require('config')
const Arena = require('./arena')

arena = new Arena()

mongoose.Promise = global.Promise
mongoose.connect(config.mongoConnection)

const socket = require('./socket/server')(arena)
module.exports = require('./api/server')(arena)