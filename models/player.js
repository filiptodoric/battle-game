let mongoose = require('mongoose')
let Schema = mongoose.Schema

let playerSchema = new Schema({
  name: String,
  role: String,
  apiId: String,
  apiSecret: String
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: false
  }
})

playerSchema.virtual('socket').get(function() {
  return this.__socket
}).set(function(val) {
  this.__socket = val
})

playerSchema.virtual('health').get(function() {
  return this.__health
}).set(function(val) {
  this.__health = val
})

module.exports = mongoose.model('player', playerSchema)
