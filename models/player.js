let mongoose = require('mongoose')
let Schema = mongoose.Schema

let playerSchema = new Schema({
  name: String,
  role: String,
  apiId: String,
  apiSecret: String,
  maxSkills: { type: Number, default: 0 },
  skills: {
    strength: { type: Number, default: 0 },
    agility: { type: Number, default: 0 },
    distraction: { type: Number, default: 0 }
  }
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: false
  }
})

playerSchema.methods.addSkills = function(skills) {
  if(skills != null) {
    if(skills.strength != null)
      this.skills.strength = skills.strength
    if(skills.agility != null)
      this.skills.agility = skills.agility
    if(skills.distraction != null)
      this.skills.distraction = skills.distraction
  }
}

playerSchema.virtual('socket').get(function () {
  return this.__socket
}).set(function (val) {
  this.__socket = val
})

playerSchema.virtual('health').get(function () {
  return this.__health
}).set(function (val) {
  this.__health = val
})

module.exports = mongoose.model('player', playerSchema)
