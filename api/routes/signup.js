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
 *
 * @apiSuccess {Object} { id: The unique identifier for the players api id, apiSecret: The unique identifier for the players api secret }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
     *       'apiId': '56a5652c55ab891352f11fd0',
     *       'apiSecret': '56a5652c55ab891352f11fd1'
     *     }
 * @apiError (400) BadRequest The name parameter was not specified or the specified name already exists
 */
    .post((req, res) => {
      if (req.body.name == null) {
        res.status(400).json({
          message: "post missing 'name' parameter"
        })
        return
      } else if (req.body.role != null && req.body.role !== "player" && req.body.role !== "spectator") {
        res.status(400).json({
          message: "invalid 'role' specified"
        })
        return
      } else {
        req.body.role = "player"
      }
      Player.find({name: req.body.name})
          .then((result) => {
            if (result.length > 0) {
              res.status(400).json({
                error: "player with name already exists"
              })
            } else {
              var newPlayer = new Player()
              newPlayer.name = req.body.name
              newPlayer.role = req.body.role
              newPlayer.apiId = uuid.v4()
              newPlayer.apiSecret = uuid.v4()
              newPlayer.maxSkills = 12
              newPlayer.save().then((player) => {
                res.status(201).json({
                  apiId: player.apiId,
                  apiSecret: player.apiSecret
                })
              }).catch((err) => {
                console.error("Issue Creating Player On Signup", err)
                res.status(err.errorCode || 500).json({error: "Issue signing up player"})
              })
            }
          })
          .catch((err) => {
            console.error("Issue Searching For Player On Signup", err)
            res.status(err.statusCode || 500).json({error: "Issue signing up player"})
          })
    })

module.exports = router
