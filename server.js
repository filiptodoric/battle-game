const mongoose = require('mongoose')
const config = require('./config')
const Arena = require('./arena')

arena = new Arena()

mongoose.connect(config.mongoConnection)

arena.test()
console.log(arena)

const socket = require('./socket/server')(arena)
const api = require('./api/server')(arena)
