const eventManager = require('./events/event-manager')
const Player = require('./models/player')
const Game = require('./models/game')
require('./server')
let players = {}
let pendingGames = []
let gameRunning = false

eventManager.on("player connected", (player) => {
  players[player.id] = []
  findGames(player)
})

eventManager.on("player disconnected", (player) => {
  delete players[player.id]
  for (let i = 0; i < pendingGames.length; i++) {
    if (pendingGames[i].indexOf(player.id) >= 0) {
      pendingGames.splice(i, 1)
      i--
    }
  }
  Object.keys(players).forEach((playerId) => {
    for(let i=0; i<players[playerId].length; i++) {
      if(players[playerId][i] === player.id) {
        players[playerId].splice(i, 1)
        i--
      }
    }
  })
})

eventManager.on("game started", (game) => {
  let gameRunning = true
})

eventManager.on("game over", (game) => {
  let gameRunning = false
  startGame()
})

let findGames = (player) => {
  Object.keys(players).forEach((playerId) => {
    if (playerId != player.id && players[player.id].indexOf(playerId) < 0) {
      // this player hasn't played this person
      players[playerId].push(player.id)
      players[player.id].push(playerId)
      pendingGames.push([playerId, player.id])
    }
  })
  startGame()
}

let startGame = () => {
  if(!gameRunning) {
    if(pendingGames.length > 0) {
      let pendingPlayers = pendingGames.shift()
      let player1
      Player.findById(pendingPlayers[0])
          .then((firstPlayer) => {
            player1 = firstPlayer
            return Player.findById(pendingPlayers[1])
          })
          .then((secondPlayer) => {
            return Game.startGame(player1, secondPlayer)
          })
          .then((result) => {
            console.log("Game Started")
          })
          .catch((error) => {
            console.error("Issue starting game", error)
          })
    } else {
      console.error("no pending games")
    }
  }
}