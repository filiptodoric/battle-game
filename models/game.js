let mongoose = require('mongoose')
let Schema = mongoose.Schema

let playerSchema = new Schema({
  name: String,
  health: Number
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
})

let moveSchema = new Schema({
  player: Schema.ObjectId,
  action: String,
  value: Number,
  received: Date
})

let gameSchema = new Schema({
  players: [playerSchema],
  moves: [moveSchema],
  current: Schema.ObjectId,
  winner: Schema.ObjectId
})

module.exports = mongoose.model('game', gameSchema)
