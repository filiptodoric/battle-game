//During the test the env variable is set to test
process.env.NODE_ENV = 'test'

const mongoose = require("mongoose")
const Move = require('../models/move')
const Player = require('../models/player')

//Require the dev-dependencies
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server').api

chai.use(chaiHttp)
//Our parent block
describe('Moves', () => {
  let authorizationHeader;
  let adminId;

  before((done) => {
    Player.remove({}, (err) => {
      let admin = new Player({
        name: 'test admin',
        role: 'admin',
        apiId: 'test-here',
        apiSecret: 'test-there'
      })
      admin.save((err, player) => {
        authorizationHeader = new Buffer(player.apiId + ":" + player.apiSecret).toString('base64')
        authorizationHeader = "Basic " + authorizationHeader
        adminId = player._id
        done()
      })
    })
  })

  beforeEach((done) => { //Before each test we empty the database
    Move.remove({}, (err) => {
      done()
    })
  })
  /*
   * Test the /GET route
   */
  describe('/GET moves', () => {
    it('it should GET all the moves', (done) => {
      chai.request(server)
          .get('/moves')
          .set("Authorization", authorizationHeader)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('array')
            res.body.length.should.be.eql(0)
            done()
          })
    })
  })

  describe('/POST moves', () => {
    it('it should not POST a move without action field', (done) => {
      let move = {}
      chai.request(server)
          .post('/moves')
          .set("Authorization", authorizationHeader)
          .send(move)
          .end((err, res) => {
            res.should.have.status(400)
            res.body.should.be.a('object')
            res.body.should.have.property('message').eql("post missing 'action' parameter")
            done()
          })
    })

    it('it should POST a move', (done) => {
      done()
      // this testing needs to be looked at properly
      // since a full game needs to be started with multiple
      // players created and the player attacking being
      // the current player
      /*game.save((err, result) => {
       let move = {
       action: "attack"
       }
       chai.request(server)
       .post('/moves')
       .set("Authorization", authorizationHeader)
       .send(move)
       .end((err, res) => {
       res.should.have.status(201)
       res.body.should.be.a('object')
       res.body.should.have.property('id').be.a('string')
       done()
       })
       })*/
    })
  })

  describe('/GET/:id moves', () => {
    it('it should GET a move by the given id', (done) => {
      let move = new Move({action: 'attack', value: 10})
      move.save((err, move) => {
        chai.request(server)
            .get('/moves/' + move.id)
            .set("Authorization", authorizationHeader)
            .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.should.have.property('action').eql('attack')
              res.body.should.have.property('value').eql(10)
              res.body.should.have.property('_id').eql(move.id)
              done()
            })
      })

    })
  })

  describe('/DELETE/:id moves', () => {
    it('it should DELETE a move by the given id', (done) => {
      let move = new Move({action: 'attack', value: 10})
      move.save((err, move) => {
        chai.request(server)
            .delete('/moves/' + move.id)
            .set("Authorization", authorizationHeader)
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