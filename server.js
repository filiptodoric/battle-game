const mongoose = require('mongoose')
const config = require('./config')
const arena = require('./arena')

mongoose.connect(config.mongoConnection)

console.log(arena)

const socket = require('./socket/server')(arena)
const api = require('./api/server')(arena)
