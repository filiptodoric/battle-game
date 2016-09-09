const Game = require('./models/game')

module.exports = Arena

function Arena() {

  let players = {}
  let freePlayers = []
  let games = {}
  let testVariable = 0

  process.on('game over', (game) => {
    delete games[game.id]
  })

  this.test = () => {
    console.log('here there', testVariable++)
  }

  this.listPlayers = () => {
    let listOfPlayers = []
    Object.keys(players).forEach((key) => {
      listOfPlayers.push(players[key])
    })
    return listOfPlayers
  }

  this.startGame = (player1Id, player2Id) => {
    return new Promise((resolve, reject) => {
      if (player1Id == null) {
        player1Id = freePlayers[0]
      } else if (freePlayers.indexOf(player1Id) < 0) {
        reject("Player 1 not found or not available to play")
        return
      }

      if (player2Id == null) {
        player2Id = freePlayers[0]
        if (player1Id === player2Id) {
          player2Id = freePlayers[1]
        }
      } else if (freePlayers.indexOf(player2Id) < 0) {
        reject("Player 2 not found or not available to play")
        return
      }
      freePlayers.splice(freePlayers.indexOf(player1Id), 1)
      freePlayers.splice(freePlayers.indexOf(player2Id), 1)

      let player1 = players[player1Id]
      let player2 = players[player2Id]
      Game.startGame(player1, player2).then((game) => {
        player1.socket.game = game
        player1.socket.emit('start game', game)

        player2.socket.game = game
        player2.socket.emit('start game', game)

        games[game.id] = game
        resolve(game)
      })
    })
  }

  this.availableToPlay = (playerId) => {
    freePlayers.push(playerId)
  }

  this.enteredArena = (player) => {
    players[player.id] = player
    Object.keys(games).forEach((key) => {
      if(games[key].players.indexOf(player.id) >= 0) {
        player.socket.game = games[key]
        console.log(player.id, "IS IN GAME")
        player.socket.emit('in game', games[key])
        return
      }
    })
  }

  this.leftArena = (playerId) => {
    delete players[playerId]
    freePlayers.splice(freePlayers.indexOf(playerId), 1)
  }
}
