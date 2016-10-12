const express = require('express')
const router = express.Router()
const Player = require('../../models/player')

router.route('/')
/**
 * @api {post} /players/ Add Player
 * @apiName AddPlayer
 * @apiGroup Player
 * @apiVersion 1.0.0
 *
 * @apiDescription Add a new player to the system
 * @apiParam {String} name The name for the player
 *
 * @apiSuccess {ObjectID} id The unique identifier for the player
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
     *       'id': '56a5652c55ab891352f11fd0'
     *     }
 * @apiError (400) BadRequest The text parameter was not specified
 */
    .post((req, res) => {
      if (req.body.name == null) {
        res.status(400).json({
          message: "post missing 'name' parameter"
        })
        return
      }
      var newPlayer = new Player()
      newPlayer.name = req.body.name
      newPlayer.role = req.body.role != null ? req.body.role : "player"
      newPlayer.save((err, player) => {
        if (err) {
          res.status(err.statusCode || 500).json(err)
        } else {
          res.status(201).json({
            id: player._id
          })
        }
      })
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
      Player.find((err, players) => {
        if (err) {
          res.status(err.statusCode || 500).json(err)
        } else {
          res.json(players)
        }
      })
    })

router.route('/active')
    .get((req, res) => {
      Player.find({socket: {$ne: null}})
          .then((results) => {
            res.json(results)
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
      Player.remove({
        _id: req.params.id
      }, function (err, player) {
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
      Player.findById(req.params.id, function (err, player) {
        if (err) {
          res.status(err.statusCode || 500).json(err)
        } else if (player == null) {
          res.status(404).json({
            message: 'record not found'
          })
        } else {
          res.json(player)
        }
      })
    })
    .post((req, res) => {
      if (req.params.id !== req.player.id.toString() && req.player.role !== "admin") {
        res.status(403).json({message: "not allowed to perform this action"})
      }
      Player.findOne({_id: req.params.id})
          .then((player) => {
            if (req.body.maxSkills && req.player.role === "admin")
              player.maxSkills = req.body.maxSkills
            player.addSkills(req.body.skills)
            if (player.skills.strength + player.skills.agility + player.skills.distraction > player.maxSkills)
              throw {
                status: 400,
                message: "the amount of skills listed would be greater than the max skills for the player"
              }
            return player.save()
          })
          .then((result) => {
            res.json(result)
          })
          .catch((error) => {
            console.log("Error updating Player", error)
            res.status(error.status || 500).json(error)
          })
    })

module.exports = router