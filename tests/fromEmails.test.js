import request from 'supertest'
import chai from 'chai'
import app from '../server/app'

describe('From Email APIs', function () {
  let fromEmail
  let originalLength

  const expect = chai.expect
  chai.should()

  after(function(done) {
    done()
  })

  it('should get list of existing sender emails', function (done) {
    request(app)
      .get('/from_emails')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('count')
        res.body.should.has.property('results')
        expect(res.body.results).to.be.a('array')
        expect(res.body.results.length).to.equal(res.body.count)
        res.body.results[0].should.has.property('sender')
        res.body.results[0].should.has.property('email')
        originalLength = res.body.count
        done()
      })
  })

  it('should create a new sender email', function (done) {
    request(app)
      .post('/from_emails')
      .send({
        sender: 'EdLab',
        email: 'edlab@tc.columbia.edu',
      })
      .expect(201)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('sender')
        res.body.should.has.property('email')
        fromEmail = res.body
        done()
      })
  })

  it('should throw error when creating a new sender email without sender', function (done) {
    request(app)
      .post('/from_emails')
      .send({
        email: 'edlab@tc.columbia.edu',
      })
      .expect(400)
      .end(() => {
        done()
      })
  })

  it('should throw error when creating a new sender email without email', function (done) {
    request(app)
      .post('/from_emails')
      .send({
        sender: 'TC Library',
      })
      .expect(400)
      .end(() => {
        done()
      })
  })

  it('should update a sender email with new sender name', function (done) {
    request(app)
      .put(`/from_emails/${ fromEmail.id }`)
      .send({
        sender: 'New EdLab',
      })
      .expect(201)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('sender')
        res.body.should.has.property('email')
        expect(res.body.sender).to.equal('New EdLab')
        done()
      })
  })

  it('should not update a sender email with new sender email', function (done) {
    request(app)
      .put(`/from_emails/${ fromEmail.id }`)
      .send({
        email: 'edlab123@tc.columbia.edu',
      })
      .expect(400)
      .end(() => {
        done()
      })
  })

  it('should delete a sender email', function (done) {
    request(app)
      .delete(`/from_emails/${ fromEmail.id }`)
      .expect(204)
      .end((err) => {
        expect(err).to.be.null
        request(app)
          .get('/from_emails')
          .expect(200)
          .end((_err, res) => {
            expect(err).to.be.null
            expect(res.body.results.length).to.equal(originalLength)
            done()
          })
      })
  })
})
