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
    let thisPlayer = null

    const isInGame = () => {
      return socket.game != null
    }

    let emitInvalid = (errorMessage) => {
      socket.emit('invalid', errorMessage)
    }

    let gameOver = (winner) => {

    }

    const moves = {
      attack: () => {
        if(isInGame()) {
          socket.game.attack(thisPlayer.id)
        } else {
          emitInvalid('not currently in a game')
        }
      },
      heal: () => {
        if (isInGame()) {
          socket.game.heal(thisPlayer.id)
        } else {
          emitInvalid('not currently in a game')
        }
      }
    }


    socket.on('attack', moves.attack)
    socket.on('heal', moves.heal)
    socket.on('ready to play', () => {
      console.log(thisPlayer.name, 'is ready to play')
      if (thisPlayer == null) {
        emitInvalid('not in arena')
        return
      }
      if (isInGame()) {
        emitInvalid('already in game')
        return
      }
      arena.availableToPlay(thisPlayer.id)
    })

    socket.on('enter arena', (data) => {
      if (thisPlayer != null) {
        emitInvalid('already in arena')
        return
      }

      Player.findOne({
        _id: data.id
      }, (err, doc) => {
        if (err) {} else if (doc == null) {

        } else {
          thisPlayer = doc
          thisPlayer.socket = socket
          arena.enteredArena(thisPlayer)
        }
        console.log(thisPlayer.name, 'has entered the arena')
        socket.emit('in arena',{})
      })
    })

    socket.on('disconnect', () => {
      console.log(thisPlayer.name, 'has disconnected')
      arena.leftArena(thisPlayer.id)
    })
  })

  server.listen(config.socketPort)
  console.log('socket listening on port', config.socketPort, '\n\n')

}