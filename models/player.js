let mongoose = require('mongoose')
let Schema = mongoose.Schema

let playerSchema = new Schema({
  name: String,
  role: String
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
})

playerSchema.virtual('socket').get(() => {
    return this.__socket
}).set((val) => {
    this.__socket = val
})

playerSchema.virtual('game').get(() => {
    return this.__game
}).set((val) => {
    this.__game = val
})

playerSchema.virtual('health').get(() => {
    return this.__health
}).set((val) => {
    this.__health = val
})

module.exports = mongoose.model('player', playerSchema)
