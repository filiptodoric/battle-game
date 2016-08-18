const mongoose = require('mongoose')
const chance = require('chance')()
const random = require('random-js')()
const server = require('http').createServer()
const io = require('socket.io').listen(server)
const Player = require('./models/player')
const Game = require('./models/game')
const config = require('./config')
let freePlayers = []
let playerSockets = {}

mongoose.connect(config.mongoConnection);

io.on('connection', (socket) => {
  let player = null

  socket.markAsPlayed = (opponentId) => {
    player.played.push(opponentId)
    player.save()
  }

  const chances = {
    takeASwing: () => {
      return chance.bool({likelihood: 90})
    },
    isCriticalHit: () => {
      return chance.bool({likelihood: 10})
    }
  }

  let emitInvalid = (errorMessage) => {
    socket.emit('invalid', {
      message: errorMessage
    })
  }

  let isInGame = () => {
    return socket.game != null
  }

  let checkForUnplayedPlayers = () => {
    let opponent = null

    console.log('checking on free players for', player.name)

    for (let i = 0; i < freePlayers.length; i++) {
      if (freePlayers[i].id !== player.id &&
        player.played.indexOf(freePlayers[i].id) === -1) {
        opponent = freePlayers.splice(i, 1)[0]
        break;
      }
    }

    if (opponent === null) {
      freePlayers.push(player)
      console.log(player.name, 'is waiting to play')
      socket.emit('waiting', {})
    } else {
      socket.opponent = opponent
      playerSockets[socket.opponent.id].opponent = player
      socket.game = new Game()
      playerSockets[socket.opponent.id].game = socket.game
      player.health = 100
      socket.opponent.health = 100
      socket.game.players.push(player)
      socket.game.players.push(socket.opponent)
      socket.game.current = socket.opponent.id
      socket.game.save()
      console.log(player.name, 'is now playing', socket.opponent.name)
      socket.emit('start game', socket.game.toJSON())
      playerSockets[socket.opponent.id].emit('start game', socket.game.toJSON())
    }
  }

  let gameOver = (winner) => {
    socket.game.winner = winner
    socket.game.save()
    socket.emit('game over', socket.game)
    let winnerName = undefined
    let loserName = undefined
    if (winner === player.id) {
      winnerName = player.name
      loserName = socket.opponent.name
    } else {
      winnerName = socket.opponent.name
      loserName = player.name
    }
    console.log("*".repeat(10), winnerName, "has defeated",
      loserName, "*".repeat(10))
    playerSockets[socket.opponent.id].emit('game over', socket.game)
    let opponentId = socket.opponent.id
    socket.markAsPlayed(opponentId)
    playerSockets[opponentId].markAsPlayed(player.id)
    delete playerSockets[opponentId].opponent
    delete playerSockets[opponentId].game
    delete socket.opponent
    delete socket.game
  }

  socket.emit('request registration', {})

  socket.on('register', (data) => {
    if (player != null) {
      emitInvalid('already registered')
      return
    }

    Player.findOne({
      name: data.name
    }, (err, doc) => {
      if (err) {} else if (doc == null) {
        player = new Player({
          name: data.name
        })
        player.save()
      } else {
        player = doc
      }
      playerSockets[player.id] = socket
      socket.emit('registered', {
        id: player.id
      })
      console.log(player.name, 'has registered')
    })

    socket.on('request game', () => {
      console.log(player.name, 'is requesting a game')
      if (player == null) {
        emitInvalid('not registered')
        return
      }
      if (isInGame()) {
        emitInvalid('already in game')
        return
      }
      checkForUnplayedPlayers()
    })

    socket.on('attack', () => {
      if (!isInGame()) {
        emitInvalid('not in game')
        return
      }

      if (player.id != socket.game.current) {
        console.log(player.name, 'tried to play out of turn')
        emitInvalid('not your turn')
        return
      }

      let move = {
        player: player.id,
        action: 'attack',
        received: Date.now()
      }

      if(!chances.takeASwing()) {
        move.value = 0
        move.result = "miss"
      } else if (chances.isCriticalHit()) {
        move.value = random.integer(31,50)
        move.result = "critical"
      } else {
        move.value = random.integer(1,30)
        move.result = "hit"
      }

      socket.game.moves.push(move)
      socket.opponent.health -= move.value
      if (socket.opponent.health <= 0) {
        gameOver(player.id)
      } else {
        socket.game.current = socket.opponent.id
        socket.emit('played', move)
        playerSockets[socket.opponent.id].emit('opponent played', move)
      }
    })

    socket.on('heal', () => {
      if (!isInGame()) {
        emitInvalid('not in game')
        return
      }

      if (player.id != socket.game.current) {
        console.log(player.name, 'tried to play out of turn')
        emitInvalid('not your turn')
        return
      }

      let move = {
        player: player.id,
        action: 'heal',
        received: Date.now(),
        value: random.integer(1, 30)
      }

      socket.game.moves.push(move)
      player.health += move.value
      socket.game.current = socket.opponent.id
      socket.emit('played', move)
      playerSockets[socket.opponent.id].emit('opponent played', move)
    })

    socket.on('disconnect', () => {
      console.log(player.name, 'has disconnected')
      for (let i = 0; i < freePlayers.length; i++) {
        if (freePlayers[i].id === player.id) {
          freePlayers.splice(i, 1)[0]
          break;
        }
      }
      if (socket.game != null) {
        gameOver(socket.opponent.id)
      }
    })
  })
})

server.listen(config.listenPort)
console.log('listening on port', config.listenPort, '\n\n')
