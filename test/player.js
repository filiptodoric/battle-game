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
    Player.remove({$not: {"_id": adminId}}, (err) => {
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
          .set("Authorization", authorizationHeader)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('array')
            // should equal 1 because of the admin
            res.body.length.should.be.eql(1)
            done()
          })
    })
  })

  describe('/POST players', () => {
    it('it should not POST a player without name field', (done) => {
      let player = {}
      chai.request(server)
          .post('/players')
          .set("Authorization", authorizationHeader)
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
          .set("Authorization", authorizationHeader)
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
          .set("Authorization", authorizationHeader)
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
            .set("Authorization", authorizationHeader)
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

  describe('/POST/:id players', () => {
    it('it should not update a player when the sum of skills is greater than maxSkills', (done) => {
      let player = new Player({name: 'qlikachu', role: 'player'})
      player.save((err, player) => {
        let updateData = {
          maxSkills: 20,
          skills: {
            strength: 10,
            agility: 10,
            distraction: 10
          }
        }
        chai.request(server)
            .post('/players/' + player.id)
            .set("Authorization", authorizationHeader)
            .send(updateData)
            .end((err, res) => {
              res.should.have.status(400)
              res.body.should.be.a('object')
              res.body.should.have.property('message')
              done()
            })
      })

    })
    it('it should update a player by the given id', (done) => {
      let player = new Player({name: 'qlikachu', role: 'player'})
      player.save((err, player) => {
        let updateData = {
          maxSkills: 20,
          skills: {
            strength: 10,
            agility: 5,
            distraction: 5
          }
        }
        chai.request(server)
            .post('/players/' + player.id)
            .set("Authorization", authorizationHeader)
            .send(updateData)
            .end((err, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.should.have.property('id').eql(player.id)
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