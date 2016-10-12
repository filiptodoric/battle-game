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
 * @apiSuccess (201) {ObjectID} id The unique identifier for the player
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       'id': '56a5652c55ab891352f11fd0'
 *     }
 * @apiError (403) Forbidden The user does not have permission to perform this action
 * @apiError (400) ParameterNotSpecified The name parameter was not specified
 * @apiError (500) MongoSaveError There was an issue saving the player
 */
    .post((req, res) => {
      if (req.player.role !== "admin") {
        res.status(403).json({message: "you are not permitted to perform this action"})
      } else if (req.body.name == null) {
        res.status(400).json({message: "post missing 'name' parameter"})
      } else {
        let player = new Player()
        player.name = req.body.name
        player.role = req.body.role != null ? req.body.role : "player"
        player.save()
            .then((player) => {
              res.status(201).json({id: player._id})
            })
            .catch((error) => {
              res.status(error.statusCode || 500).json(error)
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
     * @apiSuccess (200) {Object[]} players A list of players
     * @apiSuccess (200) {ObjectID} players._id The unique identifier for the player
     * @apiSuccess (200) {String} players.apiSecret The player api secret
     * @apiSuccess (200) {String} players.apiId The player api id
     * @apiSuccess (200) {String} players.name The player name
     * @apiSuccess (200) {String} players.role The player role
     * @apiSuccess (200) {Object} players.skills The player skills
     * @apiSuccess (200) {Number} players.skills.distraction The players distraction skill
     * @apiSuccess (200) {String} players.skills.agility The players agility skill
     * @apiSuccess (200) {String} players.skills.strength The players strength skill
     * @apiSuccess (200) {String} players.maxSkills The maximum amount of skill the player can be assigned
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     [
     *       {
     *         "_id": "57f9aecf667dc65e8b715777",
     *         "apiSecret": "7c0e06e4-72a8-4da6-992c-c46d23751524",
     *         "apiId": "1e7eb7da-de30-4dc9-87ff-64d4ff7842a5",
     *         "role": "admin",
     *         "name": "qlikemonAdmin",
     *         "skills": {
     *           "distraction": 0,
     *           "agility": 0,
     *           "strength": 0
     *         },
     *         "maxSkills": 0
     *       },
     *       {
     *         "_id": "57fd89cc6221be8340c09f34",
     *         "apiSecret": "4454f6da-3160-416c-9445-d7148c329855",
     *         "apiId": "6353709d-1a49-490a-9b9c-42d6248215cd",
     *         "role": "player",
     *         "name": "qlikachu 1",
     *         "socket": null,
     *         "health": -11,
     *         "skills": {
     *           "distraction": 0,
     *           "agility": 0,
     *           "strength": 0
     *         },
     *         "maxSkills": 12
     *       }
     *     ]
     * @apiError (500) MongoFindError There was an issue retrieving the list of players
     */
    .get((req, res) => {
      Player.find()
          .then((players) => {
            res.json(players)
          })
          .catch((error) => {
            res.status(error.statusCode || 500).json(error)
          })
    })

/**
 * @api {get} /players/active List Active Players
 * @apiName ListActivePlayers
 * @apiGroup Player
 * @apiVersion 1.0.0
 *
 * @apiDescription List all connected players in the system
 * @apiSuccess (200) {Object[]} players A list of players
 * @apiSuccess (200) {ObjectID} players._id The unique identifier for the player
 * @apiSuccess (200) {String} players.apiSecret The player api secret
 * @apiSuccess (200) {String} players.apiId The player api id
 * @apiSuccess (200) {String} players.name The player name
 * @apiSuccess (200) {String} players.role The player role
 * @apiSuccess (200) {Object} players.skills The player skills
 * @apiSuccess (200) {Number} players.skills.distraction The players distraction skill
 * @apiSuccess (200) {String} players.skills.agility The players agility skill
 * @apiSuccess (200) {String} players.skills.strength The players strength skill
 * @apiSuccess (200) {String} players.maxSkills The maximum amount of skill the player can be assigned
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "_id": "57f9aecf667dc65e8b715777",
 *         "apiSecret": "7c0e06e4-72a8-4da6-992c-c46d23751524",
 *         "apiId": "1e7eb7da-de30-4dc9-87ff-64d4ff7842a5",
 *         "role": "admin",
 *         "name": "qlikemonAdmin",
 *         "skills": {
 *           "distraction": 0,
 *           "agility": 0,
 *           "strength": 0
 *         },
 *         "maxSkills": 0
 *       },
 *       {
 *         "_id": "57fd89cc6221be8340c09f34",
 *         "apiSecret": "4454f6da-3160-416c-9445-d7148c329855",
 *         "apiId": "6353709d-1a49-490a-9b9c-42d6248215cd",
 *         "role": "player",
 *         "name": "qlikachu 1",
 *         "socket": null,
 *         "health": -11,
 *         "skills": {
 *           "distraction": 0,
 *           "agility": 0,
 *           "strength": 0
 *         },
 *         "maxSkills": 12
 *       }
 *     ]
 * @apiError (500) MongoFindError There was an issue retrieving the list of players
 */
router.route('/active')
    .get((req, res) => {
      Player.find({socket: {$ne: null}})
          .then((results) => {
            res.json(results)
          })
          .catch((error) => {
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
 * @apiSuccess (200) {String} message The message 'record deleted'
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       'message': 'record deleted'
 *     }
 * @apiError (403) Forbidden The user does not have permission to perform this action
 * @apiError (500) MongoRemoveError There was an issue removing the player
 */
    .delete((req, res) => {
      if (req.player.role !== "admin") {
        res.status(403).json({message: "you are not permitted to perform this action"})
      } else {
        Player.remove({_id: req.params.id})
            .then((player) => {
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
     * @apiDescription Get details about a player in the system
     * @apiParam {ObjectID} :id The unique identifier for the player
     *
     * @apiSuccess (200) {ObjectID} player._id The unique identifier for the player
     * @apiSuccess (200) {String} players.apiSecret The player api secret
     * @apiSuccess (200) {String} players.apiId The player api id
     * @apiSuccess (200) {String} players.name The player name
     * @apiSuccess (200) {String} players.role The player role
     * @apiSuccess (200) {Object} players.skills The player skills
     * @apiSuccess (200) {Number} players.skills.distraction The players distraction skill
     * @apiSuccess (200) {String} players.skills.agility The players agility skill
     * @apiSuccess (200) {String} players.skills.strength The players strength skill
     * @apiSuccess (200) {String} players.maxSkills The maximum amount of skill the player can be assigned
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "_id": "57f9aecf667dc65e8b715777",
     *       "apiSecret": "7c0e06e4-72a8-4da6-992c-c46d23751524",
     *       "apiId": "1e7eb7da-de30-4dc9-87ff-64d4ff7842a5",
     *       "role": "admin",
     *       "name": "qlikemonAdmin",
     *       "skills": {
     *         "distraction": 0,
     *         "agility": 0,
     *         "strength": 0
     *       },
     *       "maxSkills": 0
     *     }
     * @apiError (404) PlayerNotFound The requested player was not found
     * @apiError (500) MongoFindByIdError There was an issue retrieving the player
     */
    .get((req, res) => {
      Player.findById(req.params.id)
          .then((player) => {
            if (player == null) {
              res.status(404).json({message: 'record not found'})
            } else {
              res.json(player)
            }
          })
          .catch((error) => {
            res.status(error.statusCode || 500).json(error)
          })
    })

    /**
     * @api {post} /players/:id Update Player
     * @apiName UpdatePlayer
     * @apiGroup Player
     * @apiVersion 1.0.0
     *
     * @apiDescription Update a player in the system
     * @apiParam {ObjectID} :id The unique identifier for the player
     * @apiParam {Number} maxSkills The maximum number of skills available to the player
     * @apiParam {Object} skills The skill values for the player
     * @apiParam {Number} skills.strength The strength skill value for the player
     * @apiParam {Number} skills.agility The agility skill value for the player
     * @apiParam {Number} skills.distraction The distraction skill value for the player
     *
     * @apiSuccess (201) {ObjectID} id The unique identifier for the player
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 201 Created
     *     {
     *       'id': '56a5652c55ab891352f11fd0'
     *     }
     * @apiError (403) Forbidden The user does not have permission to perform this action
     * @apiError (400) TooManySkills The skills listed are greater than the max skills permitted
     * @apiError (500) MongoSaveError There was an issue saving the player
     */
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
            res.json({ id: result._id })
          })
          .catch((error) => {
            console.log("Error updating Player", error)
            res.status(error.status || 500).json(error)
          })
    })

module.exports = router