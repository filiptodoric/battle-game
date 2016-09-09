const mongoose = require('mongoose')
const Schema = mongoose.Schema
const random = require('random-js')()
const Move = require('./move')

let gameSchema = new Schema({
  started: Date,
  finished: Date,
  players: [Schema.ObjectId],
  current: Schema.ObjectId,
  winner: Schema.ObjectId
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
})

gameSchema.methods.moveInTurn = function(playerId) {
  return new Promise((resolve, reject) => {
    console.log(playerId," - ", this.current.toString())
    if (playerId !== this.current.toString()) {
      let message = 'move made out of turn'
      console.log(message)
      if (playerId === this.player1.id) {
        this.player1.socket.emit('invalid', message)
        reject(message)
      } else {
        this.player2.socket.emit('invalid', message)
        reject(message)
      }
    } else {
      console.log('in turn')
      resolve()
    }
  })
}

gameSchema.methods.attack = function(playerId) {
  return new Promise((resolve, reject) => {
    this.moveInTurn(playerId).then(() => {
      console.log('attack in turn')
      const move = new Move({
        game: this.id,
        player: playerId,
        action: 'attack',
        received: Date.now()
      })

      if (random.bool(1,10)) {
        // missed
        move.result = 'miss'
        move.value = 0
      } else {
        if (random.bool(1,10)) {
          // critical hit
          move.result = 'critical'
          move.value = random.integer(31, 50)
        } else {
          // normal attack
          move.result = 'hit'
          move.value = random.integer(10, 30)
        }
      }

      move.save((err, doc) => {
        this.moves.push(doc)
        if (playerId === this.player1.id) {
          // player 1 is attacking
          this.current = this.player2.id
          this.player2.health -= move.value
        } else {
          // player 2 is attacking
          this.current = this.player1.id
          this.player1.health -= move.value
        }
        if (this.player1.health <= 0 || this.player2.health <= 0) {

          this.gameOver(doc)
        } else {
          this.player1.socket.emit('move played', doc)
          this.player2.socket.emit('move played', doc)
        }
      })
    }).catch(reject)
  })
}

gameSchema.methods.heal = function(playerId) {
  return new Promise((resolve, reject) => {
    this.moveInTurn(playerId).then(() => {
      console.log('heal in turn')
      const move = new Move({
        game: this.id,
        player: playerId,
        action: 'attack',
        result: 'healed',
        value: random.integer(10, 30),
        received: Date.now()
      })

      move.save((err, doc) => {
        this.moves.push(doc)
        if (playerId === this.player1.id) {
          // player 1 is healing
          this.current = this.player2.id
          this.player1.health += move.value
        } else {
          // player 2 is healing
          this.current = this.player1.id
          this.player2.health += move.value
        }
        this.player1.socket.emit('move played', doc)
        this.player2.socket.emit('move played', doc)
      })
    }).catch(reject)
  })
}

gameSchema.methods.gameOver = function(finalMove) {
  if (this.player1.health <= 0) {
    // player 2 has won
    this.winner = this.player2.id
  } else {
    this.winner = this.player1.id
  }
  this.current = null
  this.finished = Date.now()
  this.save((err, doc) => {
    let data = {
      game: this,
      winningMove: finalMove
    }
    process.emit('game over', this)
    this.player1.socket.game = null
    this.player2.socket.game = null
    this.player1.socket.emit('game over', data)
    this.player2.socket.emit('game over', data)
  })
}

gameSchema.statics.startGame = function startGame(player1, player2) {
  return new Promise((resolve, reject) => {
    let game = new this()
    game.started = Date.now()
    game.moves = []

    game.players.push(player1.id)
    game.player1 = player1
    player1.health = 100

    game.players.push(player2.id)
    game.player2 = player2
    player2.health = 100

    game.current = player1.id
    game.save((err, doc) => {
      if (err) {
        reject(err)
      } else {
        resolve(game)
      }
    })
  })
}

gameSchema.virtual('player1').get(function() {
  return this.__player1
}).set(function(val) {
  this.__player1 = val
})

gameSchema.virtual('player2').get(function() {
  return this.__player2
}).set(function(val) {
  this.__player2 = val
})

gameSchema.virtual('moves').get(function() {
  return this.__moves
}).set(function(val) {
  this.__moves = val
})

module.exports = mongoose.model('game', gameSchema)
