const mongoose = require('mongoose')
const config = require('./config')
const Arena = require('./arena')

arena = new Arena()

mongoose.connect(config.mongoConnection)

const socket = require('./socket/server')(arena)
const api = require('./api/server')(arena)
