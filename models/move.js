const mongoose = require('mongoose')
const Schema = mongoose.Schema

let moveSchema = new Schema({
  game: Schema.ObjectId,
  player: Schema.ObjectId,
  action: String,
  result: String,
  value: Number,
  received: Date
})

module.exports = mongoose.model('move', moveSchema)
