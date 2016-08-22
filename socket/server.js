const mongoose = require('mongoose')
const chance = require('chance')()
const random = require('random-js')()
const server = require('http').createServer()
const io = require('socket.io').listen(server)
const Player = require('../models/player')
const Game = require('../models/game')
const config = require('../config')

module.exports = (arena) => {
  io.on('connection', (socket) => {
    let player = null

    const isInGame = () => {
      return socket.game != null
    }

    let emitInvalid = (errorMessage) => {
      socket.emit('invalid', {
        message: errorMessage
      })
    }

    let gameOver = (winner) => {

    }

    const moves = {
      attack: () => {

      },
      heal: () => {

      }
    }

    const chances = {
      takeASwing: () => {
        return chance.bool({
          likelihood: 90
        })
      },
      isCriticalHit: () => {
        return chance.bool({
          likelihood: 10
        })
      }
    }


    socket.on('attack', moves.attack)
    socket.on('heal', moves.heal)
    socket.on('ready to play', () => {
      console.log(player.name, 'is ready to play')
      if (player == null) {
        emitInvalid('not in arena')
        return
      }
      if (isInGame()) {
        emitInvalid('already in game')
        return
      }
      arena.freePlayers.push(player)
    })

    socket.on('enter arena', (data) => {
      if (player != null) {
        emitInvalid('already in arena')
        return
      }

      Player.findOne({
        _id: data.id
      }, (err, doc) => {
        if (err) {} else if (doc == null) {

        } else {
          player = doc
          player.socket = socket
          arena.players.push(player)
        }
        console.log(player.name, 'has entered the arena')
      })
    })

    socket.on('disconnect', () => {
      console.log(player.name, 'has disconnected')
      arena.leftArena(player.id)
    })
  })

  server.listen(config.socketPort)
  console.log('socket listening on port', config.socketPort, '\n\n')

}
