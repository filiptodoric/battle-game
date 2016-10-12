const mongoose = require('mongoose')
const Schema = mongoose.Schema
const random = require('random-js')()
const Move = require('./move')
const express = require('express')
const io = require('../socket/server').io()
const config = require('config')

let gameSchema = new Schema({
  started: Date,
  finished: Date,
  players: [{type: Schema.ObjectId, ref: 'player'}],
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

gameSchema.methods.moveInTurn = function (playerId) {
  return new Promise((resolve, reject) => {
    if (playerId.toString() !== this.current.toString()) {
      let message = 'move made out of turn'
      if (playerId.toString() === this.player1.id) {
        reject(message)
      } else {
        reject(message)
      }
    } else {
      resolve()
    }
  })
}

gameSchema.methods.attack = function (playerId) {
  return new Promise((resolve, reject) => {
    this.moveInTurn(playerId).then(() => {
      const move = new Move({
        game: this.id,
        player: playerId,
        action: 'attack',
        received: Date.now()
      })

      if (random.bool(1, 10)) {
        // missed
        move.result = 'miss'
        move.value = 0
      } else {
        if (random.bool(1, 10)) {
          // critical hit
          move.result = 'critical'
          move.value = random.integer(31, 50)
        } else {
          // normal attack
          move.result = 'hit'
          move.value = random.integer(10, 30)
        }
      }

      move.save()
          .then((doc) => {
            if (playerId.toString() === this.player1.id) {
              // player 1 is attacking
              this.current = this.player2.id
              this.player2.health -= move.value
              return this.player2.save()
            } else {
              // player 2 is attacking
              this.current = this.player1.id
              this.player1.health -= move.value
              return this.player1.save()
            }
          })
          .then((player) => {
            return this.postMove(move)
          })
          .then(() => {
            resolve(move)
          })
    }).catch(reject)
  })
}

gameSchema.methods.heal = function (playerId) {
  return new Promise((resolve, reject) => {
    this.moveInTurn(playerId).then(() => {
      const move = new Move({
        game: this.id,
        player: playerId,
        action: 'heal',
        result: 'heal',
        value: random.integer(10, 30),
        received: Date.now()
      })

      move.save()
          .then((doc) => {
            if (playerId.toString() === this.player1.id) {
              // player 1 is healing
              this.current = this.player2.id
              this.player1.health += move.value
              return this.player1.save()
            } else {
              // player 2 is healing
              this.current = this.player1.id
              this.player2.health += move.value
              return this.player2.save()
            }
          })
          .then((player) => {
            return this.postMove(move)
          })
          .then(() => {
            resolve(move)
          })
    }).catch(reject)
  })
}

gameSchema.methods.postMove = function (move) {
  return new Promise((resolve, reject) => {
    this.save()
        .then((game) => {
          if (this.player1.health <= 0 || this.player2.health <= 0) {
            this.gameOver()
            resolve()
          } else {
            Move.count({game: this._id})
                .then((moveCount) => {
                  if (moveCount >= config.maxMoves) {
                    this.gameOver()
                  } else {
                    io.to(this._id).emit('move played', {id: move.id})
                    io.to("spectators").emit('move played', {id: move.id})
                  }
                  resolve()
                })
          }
        })
  })
}

gameSchema.methods.determineWinner = function () {
  return new Promise((resolve, reject) => {
    if (this.player1.health <= 0) {
      this.winner = this.player2.id
      resolve()
    } else if (this.player2.health <= 0) {
      this.winner = this.player1.id
      resolve()
    } else {
      console.log("MAX MOVES REACHED")
      let player1Sum
      let player2Sum
      Move.aggregate({ $match: { game: this._id,
        player: this.player1._id, result: { $ne: "heal" } }},
          { $group: { _id: null, total: { $sum: "$value"  } } })
          .then((sum) => {
            player1Sum = sum
            return Move.aggregate({ $match: { game: this._id,
                  player: this.player2._id, result: { $ne: "heal" } }},
                { $group: { _id: null, total: { $sum: "$value"  } } })
          })
          .then((sum) => {
            player2Sum = sum
            if(player1Sum > player2Sum) {
              this.winner = this.player1.id
            } else if (player2Sum > player1Sum) {
              this.winner = this.player2.id
            } else if (this.player1.health > this.player2.health) {
              this.winner = this.player1.id
            } else {
              this.winner = this.player2.id
            }
            resolve()
          })
    }
  })
}

gameSchema.methods.gameOver = function () {
  this.determineWinner()
      .then(() => {
        this.current = null
        this.finished = Date.now()
        this.save((err, doc) => {
          process.emit('game over', {id: this._id})
          io.to(this._id).emit('game over', {id: this._id})
          io.to("spectators").emit('game over', {id: this._id})
          io.sockets.connected[this.player1.socket].leave(this._id)
          io.sockets.connected[this.player2.socket].leave(this._id)
        })
      })
}

gameSchema.statics.startGame = function startGame(player1, player2) {
  return new Promise((resolve, reject) => {
    if (player1 == null || player2 == null)
      reject("Not enough players available to play")
    else {
      let game = new this()
      game.started = Date.now()

      game.players.push(player1.id)
      game.player1 = player1
      player1.health = 100

      game.players.push(player2.id)
      game.player2 = player2
      player2.health = 100

      game.current = player1.id

      player1.save()
          .then((result) => {
            return player2.save()
          })
          .then((result) => {
            return game.save()
          })
          .then((doc) => {
            io.sockets.connected[player1.socket].join(doc._id)
            io.sockets.connected[player2.socket].join(doc._id)
            io.to(doc._id).emit('start game', {id: doc._id})
            io.to("spectators").emit('start game', {id: doc._id})
            resolve(doc)
          })
          .catch((err) => {
            console.error("Issue starting game", err)
            reject("Error starting game")
          })
    }
  })
}

gameSchema.virtual('player1').get(function () {
  return this.players[0]
})

gameSchema.virtual('player2').get(function () {
  return this.players[1]
})

gameSchema.virtual('moves').get(function () {
  return this.__moves
}).set(function (val) {
  this.__moves = val
})

module.exports = mongoose.model('game', gameSchema)
