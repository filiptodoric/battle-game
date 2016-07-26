let mongoose = require('mongoose')
let Schema = mongoose.Schema

let playerSchema = new Schema({
  name: String,
  health: Number,
  played: [Schema.ObjectId]
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
})

playerSchema.virtual('socket').get(() => {
    return this.__socket
}).set((val) => {
    this.__socket = val
})

module.exports = mongoose.model('player', playerSchema)
