const express = require('express')
const router = express.Router()
const Game = require('../../models/game')
const Move = require('../../models/move')
const Player = require('../../models/player')

router.route('/')
/**
 * @api {post} /moves/ Add Move
 * @apiName AddMove
 * @apiGroup Move
 * @apiVersion 1.0.0
 *
 * @apiDescription Add a new move to the system
 * @apiParam {String} name The name for the move
 *
 * @apiSuccess {ObjectID} id The unique identifier for the move
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
     *       'id': '56a5652c55ab891352f11fd0'
     *     }
 * @apiError (400) BadRequest The text parameter was not specified
 */
    .post((req, res) => {
      if (req.body.action == null) {
        res.status(400).json({message: "post missing 'action' parameter"})
      } else {
        Player.findOne({"_id": req.player._id})
            .then((player) => {
              Game.findOne({"players": player._id, winner: null})
                  .populate('players')
                  .then((game) => {
                    if (game == null) {
                      console.error("Issue retrieving game on move POST", err, game)
                      res.status(500).json({message: "not in a game"})
                    } else {
                      if (req.body.action === "attack") {
                        game.attack(player)
                            .then((move) => {
                              res.json(move)
                            })
                            .catch((error) => {
                              console.error("error on attacking", error)
                              res.status(500).json(error)
                            })
                      } else if (req.body.action == "heal") {
                        game.heal(player)
                            .then((move) => {
                              res.json(move)
                            })
                            .catch((error) => {
                              console.error("error on healing", error)
                              res.status(500).json(error)
                            })
                      } else {
                        console.error("player", player._id, "tried to play illegal move", req.body.action)
                        res.status(400).json({message: "illegal move action passed"})
                      }
                    }
                  })
                  .catch((error) => {
                    console.error("Issue retrieving game on move POST", error, game)
                    res.status(error ? err.statusCode : 500).json({message: "processing of move failed"})
                  })
            })
            .catch((error) => {
              console.error("Issue retrieving player on move POST", error)
              res.status(error.statusCode || 500).json({message: "processing of move failed"})
            })
      }
    })
    /**
     * @api {get} /players/ List Players
     * @apiName ListPlayers
     * @apiGroup Player
     * @apiVersion 1.0.0
     *
     * @apiDescription List all players in the system
     * @apiSuccess {Object[]} players A list of players
     * @apiSuccess {ObjectID} players._id The unique identifier for the player
     * @apiSuccess {String} players.name The player name
     * @apiSuccess {String} players.role The player role
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
      Move.find()
          .then((moves) => {
            res.json(moves)
          })
          .catch((error) => {
            console.error("error retrieving list of moves", error)
            res.status(error.statusCode || 500).json(error)
          })
    })

router.route('/:id')
/**
 * @api {delete} /players/:id Delete Player
 * @apiName DeletePlayer
 * @apiGroup Player
 * @apiVersion 1.0.0
 *
 * @apiDescription Delete a player from the system
 * @apiParam {ObjectID} :id The unique identifier for the player
 *
 * @apiSuccess {String} player The player 'record deleted'
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
     *       'message': 'record deleted'
     *     }
 */
    .delete((req, res) => {
      if (req.player.role !== "admin") {
        res.status(403).json({message: "you are not permitted to perform this action"})
      } else {
        Move.remove({_id: req.params.id})
            .then((move) => {
              res.status(200).json({message: 'record deleted'})
            })
            .catch((error) => {
              res.status(error.statusCode || 500).json(error)
            })
      }
    })
    /**
     * @api {get} /players/:id Get Player Details
     * @apiName GetPlayer
     * @apiGroup Player
     * @apiVersion 1.0.0
     *
     * @apiDescription Give details about a player in the system
     * @apiParam {ObjectID} :id The unique identifier for the player
     *
     * @apiSuccess {Object} player The requested player
     * @apiSuccess {ObjectID} player._id The unique identifier for the player
     * @apiSuccess {String} player.name The player name
     * @apiSuccess {Boolean} player.role The player role
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
      Move.findById(req.params.id)
          .then((move) => {
            if (move == null) {
              res.status(404).json({
                message: 'record not found'
              })
            } else {
              res.json(move)
            }
          })
          .catch((error) => {
            res.status(error.statusCode || 500).json(error)
          })
    })

module.exports = router