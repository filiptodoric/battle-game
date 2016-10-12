const express = require('express')
const router = express.Router()
const uuid = require('node-uuid')
const Player = require('../../models/player')

router.route('/')
/**
 * @api {post} /signup/ Signup Player
 * @apiName Signup
 * @apiGroup Signup
 * @apiVersion 1.0.0
 *
 * @apiDescription Add a new player to the system
 * @apiParam {String} name The name for the player
 * @apiParam {String="player","spectator"} [role="player"] The role
 *
 * @apiSuccess (200) {Object} { apiId: The unique identifier for the players api id, apiSecret: The unique identifier for the players api secret }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
     *       'apiId': '56a5652c55ab891352f11fd0',
     *       'apiSecret': '56a5652c55ab891352f11fd1'
     *     }
 * @apiError (400) BadRequest The name parameter has not been specified
 * @apiError (400) BadRequest The role specified is invalid
 * @apiError (400) BadRequest A player already exists with the given name
 */
    .post((req, res) => {
      if (req.body.name == null) {
        // a name has not been specified
        res.status(400).json({
          message: "post missing 'name' parameter"
        })
      } else if (req.body.role != null && req.body.role !== "player" && req.body.role !== "spectator") {
        // an invalid role value has been specified.
        res.status(400).json({
          message: "invalid 'role' specified"
        })
      } else {
        // if no role has been specified, default to "player"
        req.body.role = req.body.role != null ? req.body.role : "player"

        Player.find({name: req.body.name})
            .then((result) => {
              if (result.length > 0) {
                res.status(400).json({message: "player with name already exists"})
              } else {
                let player = new Player()
                player.name = req.body.name
                player.role = req.body.role
                player.apiId = uuid.v4()
                player.apiSecret = uuid.v4()
                player.maxSkills = 12
                player.save().then((player) => {
                  res.status(201).json({
                    apiId: player.apiId,
                    apiSecret: player.apiSecret
                  })
                }).catch((err) => {
                  console.error("Issue Creating Player On Signup", err)
                  res.status(err.errorCode || 500).json({message: "Issue signing up player"})
                })
              }
            })
            .catch((err) => {
              console.error("Issue Searching For Player On Signup", err)
              res.status(err.statusCode || 500).json({message: "Issue signing up player"})
            })
      }

    })

module.exports = router
