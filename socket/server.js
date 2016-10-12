const mongoose = require('mongoose')
const chance = require('chance')()
const random = require('random-js')()
const server = require('http').createServer()
const socketio = require('socket.io')
const Player = require('../models/player')
let Game
const config = require('config')

let io = null

exports.io = function() {
  return io
}

exports.initialize = function() {
  io = socketio.listen(server)
  // need to initialize Game below because
  // socket io is required in the game model
  Game = require('../models/game')

  io.on("connection", (socket) => {
    let thisPlayer = null
    if (socket.handshake.query.apiId == null || socket.handshake.query.apiSecret == null) {
      socket.emit("invalid", {message: "missing 'apiId' and/or 'apiSecret' parameters"})
      socket.disconnect()
    } else {
      Player.findOne({
        apiId: socket.handshake.query.apiId,
        apiSecret: socket.handshake.query.apiSecret
      }).then((doc) => {
        if (doc == null) {
          socket.emit("invalid", {message: "player not found"})
        } else {
          thisPlayer = doc
          thisPlayer.socket = socket.id
          thisPlayer.save()
              .then((result) => {
                console.log(thisPlayer.name, "has connected")
                socket.emit("success", {id: thisPlayer.id})
                if(thisPlayer.role === "spectator") {
                  socket.join("spectators")
                }

                Game.findOne({ players: thisPlayer._id, winner: null })
                    .then((game) => {
                      if (game != null) {
                        socket.emit("in game", {id: game._id})
                        socket.join(game.id)
                      }
                    })
              })
        }
      })
    }

    socket.on('disconnect', () => {
      console.log(thisPlayer.name, 'has disconnected')
      thisPlayer.socket = null
      thisPlayer.save()
          .then((result) => {

          })
    })
  })

  server.listen(config.socketPort)
  console.log('socket listening on port', config.socketPort, '\n\n')
  return io
}