import request from 'supertest'
import chai from 'chai'
import app from '../server/app'

describe('Email APIs', function () {
  let subscriptionList1, subscriptionList2

  const expect = chai.expect
  chai.should()

  after(function(done) {

  })

  it('should create a new subscription list', function (done) {
    request(app)
      .post('/subscriptionLists')
      .send({
        name: 'EdLab Dev Team',
        description: 'This list contains EdLav Dev team users',
      })
      .expect(201)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('name')
        res.body.should.has.property('name')
        fromEmail1 = res.body
        done()
      })
  })
})
