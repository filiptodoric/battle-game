module.exports = {
  players: {},
  freePlayers: [],
  games: [],
  listPlayers: () => {

  },
  startGame: () => {

  }
  leftArena: (playerId) => {
    delete players[playerId]
    delete freePlayers[playerId]
  }
}
