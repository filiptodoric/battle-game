//During the test the env variable is set to test
process.env.NODE_ENV = 'test'

const mongoose = require("mongoose")
const Player = require('../models/player')

//Require the dev-dependencies
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server').api
const should = chai.should()

chai.use(chaiHttp)
//Our parent block
describe('Players', () => {
  beforeEach((done) => { //Before each test we empty the database
    Player.remove({}, (err) => {
      done()
    })
  })
  /*
   * Test the /GET route
   */
  describe('/GET players', () => {
    it('it should GET all the players', (done) => {
      chai.request(server)
          .get('/players')
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('array')
            res.body.length.should.be.eql(0)
            done()
          })
    })
  })

  describe('/POST players', () => {
    it('it should not POST a player without name field', (done) => {
      let player = {

      }
      chai.request(server)
          .post('/players')
          .send(player)
          .end((err, res) => {
            res.should.have.status(400)
            res.body.should.be.a('object')
            res.body.should.have.property('message').eql("post missing 'name' parameter")
            done()
          })
    })

    it('it should POST a player', (done) => {
      let player = {
        name: "qlikachu"
      }
      chai.request(server)
          .post('/players')
          .send(player)
          .end((err, res) => {
            res.should.have.status(201)
            res.body.should.be.a('object')
            res.body.should.have.property('id').be.a('string')
            done()
          })
    })
  })

  describe('/GET/active players', () => {
    it('it should GET all active players', (done) => {
      chai.request(server)
          .get('/players/active')
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('array')
            res.body.length.should.be.eql(0)
            done()
          })
    })
  })

  describe('/GET/:id players', () => {
    it('it should GET a player by the given id', (done) => {
      let player = new Player({name: 'qlikachu', role: 'player'})
      player.save((err, player) => {
        chai.request(server)
            .get('/players/' + player.id)
            .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.should.have.property('name').eql('qlikachu')
              res.body.should.have.property('role').eql('player')
              res.body.should.have.property('_id').eql(player.id)
              done()
            })
      })

    })
  })

  describe('/DELETE/:id players', () => {
    it('it should DELETE a player by the given id', (done) => {
      let player = new Player({name: 'qlikachu', role: 'player'})
      player.save((err, player) => {
        chai.request(server)
            .delete('/players/' + player.id)
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