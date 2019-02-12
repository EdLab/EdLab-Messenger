import request from 'supertest'
import chai from 'chai'
import app from '../server/app'

describe('Email APIs', function () {
  let email1, email2

  const expect = chai.expect
  chai.should()

  after(function(done) {

  })

  it('should create a new email with subscription list', function (done) {
    request(app)
      .post('/emails')
      .send({
        subject: 'Test email 1',
        html: '<h2>test template</h2> <strong>html</strong> with {firstname} and {variable2}',
        from_email_id: 1,
        subscription_list_id: 1,
        scheduled_at: '2019-01-30T16:28:00.000Z',
      })
      .expect(201)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('html')
        res.body.should.has.property('name')
        res.body.should.has.property('fields')
        res.body.should.has.property('created_at')
        res.body.should.has.property('updated_at')
        email1 = res.body
        done()
      })
  })
})
