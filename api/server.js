const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const config = require('config')
const Player = require('../models/player')

const playerRouter = require('./routes/player')
const gameRouter = require('./routes/game')
const moveRouter = require('./routes/move')
const signupRouter = require('./routes/signup')
const app = express()
const router = express.Router()

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

const allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')

  next()
}

let checkAuthorization = (req, res, next) => {
  if (req.url.startsWith("/signup")) {
    next()
  } else {
    if (!req.headers.authorization) {
      res.status(401).json({message: 'API ID/Secret required'})
    } else {
      const encoded = req.headers.authorization.split(' ')[1]
      const decoded = new Buffer(encoded, 'base64').toString('utf8').split(':')
      if (decoded.length == 2) {
        let credentials = {
          apiId: decoded[0],
          apiSecret: decoded[1],
        }
        Player.find(credentials)
            .then((result) => {
              if (result.length > 0) {
                req.player = result[0]
                next()
              } else {
                res.status(401).json({message: 'invalid API ID/Secret'})
              }
            })
      } else {
        res.status(401).json({message: 'invalid Authorization header'})
      }
    }
  }
}

router.route('/')
    .get((req, res) => {
      res.json({
        message: 'Welcome to the Game API'
      })
    })


app.use(allowCrossDomain)

app.use('/signup/', signupRouter)

app.use(checkAuthorization)
app.use('/', router)
app.use('/players/', playerRouter)
app.use('/games/', gameRouter)
app.use('/moves/', moveRouter)

app.listen(config.apiPort)
console.log('API listening on port', config.apiPort, '\n\n')
module.exports = app