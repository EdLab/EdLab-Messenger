import request from 'supertest'
import chai from 'chai'
import app from '../server/app'

describe('Email APIs', function () {
  let fromEmail1, fromEmail2

  const expect = chai.expect
  chai.should()

  after(function(done) {

  })

  it('should create a new sender email', function (done) {
    request(app)
      .post('/fromEmails')
      .send({
        sender: 'TC Library',
        email: '***REMOVED***@tc.columbia.edu',
      })
      .expect(201)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('sender')
        res.body.should.has.property('email')
        fromEmail1 = res.body
        done()
      })
  })
})
