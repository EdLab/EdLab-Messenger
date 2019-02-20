import request from 'supertest'
import chai from 'chai'
import app from '../server/app'

describe('User APIs', function () {
  const testUserUid = 'ec41bf74-8f1d-11e6-887e-22000b04a6df'

  const expect = chai.expect
  chai.should()

  after(function(done) {
    done()
  })

  it('get list of user', function (done) {
    request(app)
      .get('/users')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('count')
        res.body.should.has.property('results')
        expect(res.body.results).to.be.a('array')
        res.body.results[0].should.has.property('uid')
        res.body.results[0].should.has.property('email')
        res.body.results[0].should.has.property('firstname')
        res.body.results[0].should.has.property('lastname')
        res.body.results[0].should.has.property('username')
        done()
      })
  })

  it('get the subscriptions of a user', function (done) {
    request(app)
      .get(`/users/${ testUserUid }/subscriptions`)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('count')
        res.body.should.has.property('results')
        expect(res.body.results).to.be.a('array')
        if (res.body.count > 0) {
          res.body.results[0].should.has.property('user_uid')
          res.body.results[0].should.has.property('subscription_list_id')
          expect(res.body.results[0].user_uid).to.equal(testUserUid)
        }
        done()
      })
  })
})
