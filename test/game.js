//During the test the env variable is set to test
process.env.NODE_ENV = 'test'

const mongoose = require("mongoose")
const Game = require('../models/game')

//Require the dev-dependencies
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server').api
const should = chai.should()

chai.use(chaiHttp)
//Our parent block
describe('Games', () => {
  beforeEach((done) => { //Before each test we empty the database
    Game.remove({}, (err) => {
      done()
    })
  })
  /*
   * Test the /GET route
   */
  describe('/GET games', () => {
    it('it should GET all the games', (done) => {
      chai.request(server)
          .get('/games')
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('array')
            res.body.length.should.be.eql(0)
            done()
          })
    })
  })

  describe('/POST/start games', () => {
    it('it should not start a game without enough players', (done) => {
      let player = {

      }
      chai.request(server)
          .post('/games/start')
          .send()
          .end((err, res) => {
            res.should.have.status(500)
            res.body.should.be.a('object')
            res.body.should.have.property('message').eql("Not enough players available to play")
            done()
          })
    })
  })

  describe('/GET/:id games', () => {
    it('it should GET a game by the given id', (done) => {
      let game = new Game()
      game.save((err, game) => {
        chai.request(server)
            .get('/games/' + game.id)
            .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.should.have.property('_id').eql(game.id)
              done()
            })
      })

    })
  })

  describe('/DELETE/:id games', () => {
    it('it should DELETE a game by the given id', (done) => {
      let game = new Game()
      game.save((err, game) => {
        chai.request(server)
            .delete('/games/' + game.id)
            .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.should.have.property('message').eql('record deleted')
              done()
            })
      })

    })
  })
})