const Game = require('./models/game')

class Arena {

  constructor() {
    this.players = {}
    this.freePlayers = []
    this.games = {}

    process.on('game over', (game) => {
      delete this.games[game.id]
    })
  }


  listPlayers() {
    let listOfPlayers = []
    Object.keys(this.players).forEach((key) => {
      listOfPlayers.push(this.players[key])
    })
    return listOfPlayers
  }

  startGame(player1Id, player2Id) {
    return new Promise((resolve, reject) => {
      if (player1Id == null) {
        player1Id = this.freePlayers[0]
      } else if (this.freePlayers.indexOf(player1Id) < 0) {
        reject("Player 1 not found or not available to play")
        return
      }

      if (player2Id == null) {
        player2Id = this.freePlayers[0]
        if (player1Id === player2Id) {
          player2Id = this.freePlayers[1]
        }
      } else if (this.freePlayers.indexOf(player2Id) < 0) {
        reject("Player 2 not found or not available to play")
        return
      }
      this.freePlayers.splice(this.freePlayers.indexOf(player1Id), 1)
      this.freePlayers.splice(this.freePlayers.indexOf(player2Id), 1)

      let player1 = this.players[player1Id]
      let player2 = this.players[player2Id]
      Game.startGame(player1, player2)
          .then((game) => {
            player1.socket.game = game
            player1.socket.emit('start game', game)

            player2.socket.game = game
            player2.socket.emit('start game', game)

            this.games[game.id] = game
            resolve(game)
          })
          .catch(reject)
    })
  }

  availableToPlay(playerId) {
    this.freePlayers.push(playerId)
  }

  enteredArena(player) {
    this.players[player.id] = player
    Object.keys(this.games).forEach((key) => {
      if (this.games[key].players.indexOf(player.id) >= 0) {
        player.socket.game = this.games[key]
        console.log(player.id, "IS IN GAME")
        player.socket.emit('in game', this.games[key])
        return
      }
    })
  }

  isInGame(player) {
    let inGame = false
    Object.keys(this.games).forEach((key) => {
      if (this.games[key].players.indexOf(player.id) >= 0) {
        inGame = true
      }
    })
    return inGame
  }

  leftArena(playerId) {
    delete this.players[playerId]
    this.freePlayers.splice(this.freePlayers.indexOf(playerId), 1)
  }
}

module.exports = Arena