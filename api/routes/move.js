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
 * @apiParam {String="attack","heal"} action The name for the move
 *
 * @apiSuccess (201) {ObjectID} id The unique identifier for the move
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       'id': '56a5652c55ab891352f11fd0'
 *     }
 * @apiError (400) ParameterNotSpecified The action parameter was not specified
 * @apiError (400) IllegalActionSpecified An illegal move action was specified
 * @apiError (500) PlayerNotInGame The player is not in a game
 * @apiError (500) GameAttackError There was an issue attacking
 * @apiError (500) GameHealError There was an issue healing
 * @apiError (500) MongoFindOneError There was an issue retrieving the player
 * @apiError (500) MongoGameFindOneError There was an issue retrieving the game
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
     * @api {get} /moves/ List Moves
     * @apiName ListMoves
     * @apiGroup Move
     * @apiVersion 1.0.0
     *
     * @apiDescription List all moves in the system
     * @apiSuccess (200) {Object[]} moves A list of players
     * @apiSuccess (200) {ObjectID} moves._id The unique identifier for the move
     * @apiSuccess (200) {Number} moves.value The end value of the move
     * @apiSuccess (200) {String} moves.result The resulting action of the move
     * @apiSuccess (200) {ObjectID} moves.game The unique identifier of the game the move was performed in
     * @apiSuccess (200) {ObjectID} moves.player The player that played the action
     * @apiSuccess (200) {String} moves.action The action requested by the player
     * @apiSuccess (200) {Date} moves.received The time the move was created
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     [
     *       {
     *         "_id": "57fe864c097a46a65427d45e",
     *         "value": 10,
     *         "result": "hit",
     *         "game": "57fe85fe68713f95549aed06",
     *         "player": "57fd89cc6221be8340c09f34",
     *         "action": "attack",
     *         "received": "2016-10-12T18:51:56.017Z"
     *       },
     *       {
     *         "_id": "57fe864f097a46a65427d45f",
     *         "value": 24,
     *         "result": "hit",
     *         "game": "57fe85fe68713f95549aed06",
     *         "player": "57fd8a266221be8340c09f35",
     *         "action": "attack",
     *         "received": "2016-10-12T18:51:59.063Z"
     *       }
     *     ]
     * @apiError (500) MongoFindError There was an issue retrieving the list of moves
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
 * @api {delete} /players/:id Delete Move
 * @apiName DeleteMove
 * @apiGroup Move
 * @apiVersion 1.0.0
 *
 * @apiDescription Delete a move from the system
 * @apiParam {ObjectID} :id The unique identifier for the move
 *
 * @apiSuccess (200) {String} message The message 'record deleted'
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
     *       'message': 'record deleted'
     *     }
 * @apiError (403) Forbidden The user does not have permission to perform this action
 * @apiError (500) MongoRemoveError There was an issue removing the move
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
     * @api {get} /moves/ Get Move Details
     * @apiName GetMove
     * @apiGroup Move
     * @apiVersion 1.0.0
     *
     * @apiDescription Get details about a move in the system
     * @apiParam {ObjectID} :id The unique identifier for the move
     * @apiSuccess (200) {ObjectID} _id The unique identifier for the move
     * @apiSuccess (200) {Number} value The end value of the move
     * @apiSuccess (200) {String} result The resulting action of the move
     * @apiSuccess (200) {ObjectID} game The unique identifier of the game the move was performed in
     * @apiSuccess (200) {ObjectID} player The player that played the action
     * @apiSuccess (200) {String} action The action requested by the player
     * @apiSuccess (200) {Date} received The time the move was created
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *       {
     *         "_id": "57fe864c097a46a65427d45e",
     *         "value": 10,
     *         "result": "hit",
     *         "game": "57fe85fe68713f95549aed06",
     *         "player": "57fd89cc6221be8340c09f34",
     *         "action": "attack",
     *         "received": "2016-10-12T18:51:56.017Z"
     *       }
     * @apiError (404) MoveNotFound The move was not found
     * @apiError (500) MongoFindByIdError There was an issue retrieving the move
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