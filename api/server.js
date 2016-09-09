const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const config = require('../config')

module.exports = (arena) => {
  const playerRouter = require('./routes/player')(arena)
  const gameRouter = require('./routes/game')(arena)
  var app = express()
  var router = express.Router()

  app.use(bodyParser.urlencoded({
    extended: true
  }))
  app.use(bodyParser.json())

  var allowCrossDomain = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type')

    next()
  }

  router.route('/')
    .get((req, res) => {
      res.json({
        message: 'Welcome to the Game API'
      })
    })



  app.use(allowCrossDomain)
  app.use('/', router)
  app.use('/players/', playerRouter)
  app.use('/games/', gameRouter)

  app.listen(config.apiPort)
  console.log('API listening on port', config.apiPort, '\n\n')
}
