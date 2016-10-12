let mongoose = require('mongoose')
let Schema = mongoose.Schema

let playerSchema = new Schema({
  name: String,
  role: String,
  apiId: String,
  apiSecret: String,
  socket: String,
  health: Number,
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

module.exports = mongoose.model('player', playerSchema)
