const express = require('express')
const router = express.Router()
const Game = require('../../models/game')
const Move = require('../../models/move')

module.exports = (arena) => {
  router.route('/')
  /**
   * @api {get} /games/ List Games
   * @apiName ListGames
   * @apiGroup Game
   * @apiVersion 1.0.0
   *
   * @apiDescription List all games in the system
   * @apiSuccess {Object[]} games A list of games
   * @apiSuccess {ObjectID} games._id The unique identifier for the game
   * @apiSuccess {Date} games.started The game start date/time
   * @apiSuccess {Date} games.finished The game finish date/time
   * @apiSuccess {Array} games.players The game players
   * @apiSuccess {String} games.current The player whose current move it is
   * @apiSuccess {String} games.winner The game winner
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     [
   *       {
     *         '_id': '56a5652c55ab891352f11fd0',
     *         'name': 'Qlikachu',
     *         'role': 'player'
     *       },
   *       {
     *         '_id': '56a5652c55ab891352f11fd5',
     *         'name': 'Qlikasaur',
     *         'role': 'player'
     *       }
   *     ]
   */
      .get((req, res) => {
        Game.find((err, games) => {
          if (err) {
            res.status(err.statusCode || 500).json(err)
          } else {
            res.json(games)
          }
        })
      })
      .post((req, res) => {
        arena.startGame(req.params.player1, req.params.player2)
            .then((game) => {
              res.json(game)
            })
            .catch((err) => {
              res.status(500)
              res.json({message: err})
            })
      })


  router.route('/:id')
  /**
   * @api {delete} /games/:id Delete Game
   * @apiName DeleteGame
   * @apiGroup Game
   * @apiVersion 1.0.0
   *
   * @apiDescription Delete a game from the system
   * @apiParam {String} :id The unique identifier for the game
   *
   * @apiSuccess {String} message The message 'record deleted'
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
     *       'message': 'record deleted'
     *     }
   */
      .delete((req, res) => {
        Game.remove({
          _id: req.params.id
        }, function (err, game) {
          if (err) {
            res.status(err.statusCode || 500).json(err)
          } else {
            res.status(200).json({
              message: 'record deleted'
            })
          }
        })
      })
      /**
       * @api {get} /games/:id Get Game Details
       * @apiName GetGame
       * @apiGroup Game
       * @apiVersion 1.0.0
       *
       * @apiDescription Give details about a game in the system
       * @apiParam {ObjectID} :id The unique identifier for the game
       *
       * @apiSuccess {ObjectID} game._id The unique identifier for the game
       * @apiSuccess {Date} game.started The game start date/time
       * @apiSuccess {Date} game.finished The game finish date/time
       * @apiSuccess {Array} game.players The game players
       * @apiSuccess {String} game.current The player whose current move it is
       * @apiSuccess {String} game.winner The game winner
       * @apiSuccessExample {json} Success-Response:
       *     HTTP/1.1 200 OK
       *     {
     *       '_id': '56a5652c55ab891352f11fd0',
     *       'name': 'Qlikachu'
     *       'role': 'player'
     *     }
       * @apiError (404) NotFound The requested player was not found
       * @apiError (500) InternalServerError The identifier specified was invalid
       */
      .get((req, res) => {
        Game.findById(req.params.id, function (err, game) {
          if (err) {
            res.status(err.statusCode || 500).json(err)
          } else if (game == null) {
            res.status(404).json({
              message: 'record not found'
            })
          } else {
            game.moves = []
            Move.find({
              game: game.id
            }, (err, moves) => {
              game.moves = moves
              res.json(game)
            })
          }
        })
      })

  return router;
}
