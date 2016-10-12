const express = require('express')
const router = express.Router()
const Game = require('../../models/game')
const Player = require('../../models/player')

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
 * @apiSuccess {ObjectId[]} games.players The game players
 * @apiSuccess {String} games.current The player whose current move it is
 * @apiSuccess {String} games.winner The game winner
 * @apiSuccess {ObjectID} games.player1 The unique identifier of the first player
 * @apiSuccess {ObjectID} games.player2 The unique identifier of the second player
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "_id": "57fe85fe68713f95549aed06",
 *         "current": null,
 *         "started": "2016-10-12T18:50:38.739Z",
 *         "finished": "2016-10-12T18:51:59.390Z",
 *         "winner": "57fd89cc6221be8340c09f34",
 *         "players": [
 *           "57fd89cc6221be8340c09f34",
 *           "57fd8a266221be8340c09f35"
 *         ],
 *         "player2": "57fd8a266221be8340c09f35",
 *         "player1": "57fd89cc6221be8340c09f34"
 *       },
 *       {
 *         "_id": "57fe868f9e30dcc754a2127c",
 *         "current": null,
 *         "started": "2016-10-12T18:53:03.161Z",
 *         "finished": "2016-10-12T18:53:07.124Z",
 *         "winner": "57fd89cc6221be8340c09f34",
 *         "players": [
 *           "57fd89cc6221be8340c09f34",
 *           "57fd8a266221be8340c09f35"
 *         ],
 *         "player2": "57fd8a266221be8340c09f35",
 *         "player1": "57fd89cc6221be8340c09f34"
 *       }
 *     ]
 * @apiError (500) InternalServerError There was an issue retrieving the list of games
 */
    .get((req, res) => {
      Game.find()
          .then((games) => {
            res.json(games)
          })
          .catch((error) => {
            res.status(error.statusCode || 500).json(error)
          })
    })
    /**
     * @api {post} /games/ Add Game
     * @apiName AddGame
     * @apiGroup Game
     * @apiVersion 1.0.0
     *
     * @apiDescription Add a new game to the system
     * @apiParam {ObjectID} player1 The first player
     * @apiParam {ObjectID} player2 The second player
     *
     * @apiSuccess {ObjectID} id The unique identifier for the player
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 201 Created
     *     {
     *       'id': '56a5652c55ab891352f11fd0'
     *     }
     * @apiError (403) Forbidden The user does not have permission to perform this action
     * @apiError (400) BadRequest The player1 and/or player2 parameters were not specified
     * @apiError (400) BadRequest Player 1 could not be found
     * @apiError (400) BadRequest Player 1 is not connected
     * @apiError (400) BadRequest Player 1 is a spectator
     * @apiError (400) BadRequest Player 1 is in a game
     * @apiError (400) BadRequest Player 2 could not be found
     * @apiError (400) BadRequest Player 2 is not connected
     * @apiError (400) BadRequest Player 2 is a spectator
     * @apiError (400) BadRequest Player 2 is in a game
     * @apiError (500) InternalServerError There was an issue starting the game
     */
    .post((req, res) => {
      if (req.player.role !== "admin") {
        res.status(403).json({message: "you are not permitted to perform this action"})
      } else if (req.body.player1 == null || req.body.player2 == null) {
        res.status(400).json({message: "'player1' and 'player2' must be specified"})
      } else {
        let player1
        let player2

        Player.findOne({_id: req.body.player1})
            .then((player) => {
              // check that player 1 exists and is connected
              if (player == null) {
                res.status(400).json({message: "Player 1 not found"})
              } else if (player.socket == null) {
                res.status(400).json({message: "Player 1 is not connected"})
              } else if (player.role === "spectator") {
                res.status(400).json({message: "Player 1 is a spectator"})
              } else {
                player1 = player
                return Game.findOne({players: player._id, winner: null})
              }
            })
            .then((game) => {
              // check that player 1 is not in a game
              if (game != null) {
                res.status(400).json({message: "Player 1 is in a game"})
              } else {
                return Player.findOne({_id: req.body.player2})
              }
            })
            .then((player) => {
              // check that player 2 exists and is connected
              if (player == null) {
                res.status(400).json({message: "Player 2 not found"})
              } else if (player.socket == null) {
                res.status(400).json({message: "Player 2 is not connected"})
              } else if (player.role === "spectator") {
                res.status(400).json({message: "Player 2 is a spectator"})
              } else {
                player2 = player
                return Game.findOne({players: player._id, winner: null})
              }
            })
            .then((game) => {
              // check that player 2 is not in a game
              if (game != null) {
                res.status(400).json({message: "Player 2 is in a game"})
              } else {
                // neither players are
                return Game.startGame(player1, player2)
              }
            })
            .then((game) => {
              res.status(201).json({ id: game._id })
            })
            .catch((error) => {
              res.status(500).json({message: "there was an issue starting a game"})
            })
      }

      // logic to search for missing players
      // Game.find({winner: null})
      //     .then((result) => {
      //       let inGamePlayers = [].concat.apply([], result.map(game => game.players))
      //       console.log(inGamePlayers.length)
      //       return Player.aggregate([{
      //         $match: {
      //           _id: {$nin: inGamePlayers},
      //           socket: {$ne: null}
      //         }
      //       }, {$project: {_id: 1}}, {$sample: {size: missing}}])
      //     })


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
 * @apiError (500) InternalServerError There was an issue removing the game
 */
    .delete((req, res) => {
      Game.remove({_id: req.params.id})
          .then((game) => {
            res.status(200).json({
              message: 'record deleted'
            })
          })
          .catch((error) => {
            res.status(error.statusCode || 500).json(error)
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
     * @apiSuccess {Object} game The requested game
     * @apiSuccess {ObjectID} game._id The unique identifier for the game
     * @apiSuccess {Date} game.started The game start date/time
     * @apiSuccess {Date} game.finished The game finish date/time
     * @apiSuccess {ObjectId[]} game.players The game players
     * @apiSuccess {String} game.current The player whose current move it is
     * @apiSuccess {String} game.winner The game winner
     * @apiSuccess {ObjectID} game.player1 The unique identifier of the first player
     * @apiSuccess {ObjectID} game.player2 The unique identifier of the second player
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "_id": "57fe85fe68713f95549aed06",
     *       "current": null,
     *       "started": "2016-10-12T18:50:38.739Z",
     *       "finished": "2016-10-12T18:51:59.390Z",
     *       "winner": "57fd89cc6221be8340c09f34",
     *       "players": [
     *         "57fd89cc6221be8340c09f34",
     *         "57fd8a266221be8340c09f35"
     *       ],
     *       "player2": "57fd8a266221be8340c09f35",
     *       "player1": "57fd89cc6221be8340c09f34"
     *     }
     * @apiError (404) NotFound The requested game was not found
     * @apiError (500) InternalServerError There was an issue retrieving the game
     */
    .get((req, res) => {
      Game.findById(req.params.id)
          .then((game) => {
            if (game == null) {
              res.status(404).json({
                message: 'record not found'
              })
            } else {
              res.json(game)
            }
          })
          .catch((error) => {
            res.status(error.statusCode || 500).json(error)
          })
    })

module.exports = router
