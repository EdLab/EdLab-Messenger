import request from 'supertest'
import chai from 'chai'
import app from '../server/app'
import moment from 'moment'

describe('Email APIs', function () {
  let email1, email2, email3, awsTestUserIds

  var nextHour = moment().add(1, 'hour').startOf('hour');

  const expect = chai.expect
  chai.should()

  before(function(done) {
    Subscription
      .findAll({
        where: {
          subscription_list_id: 3,
        }
      })
      .then(subscriptions => {
        awsTestUserIds = subscriptions.map(s => s.user_uid)
        done()
      })
  })

  after(function(done) {
    StatusLog.destroy({ where: {} })
      .then(() => Message.destroy({ where: {} }))
      .then(() => Email.destroy({ where: {} }))
      .then(() => done())
  })

  it('should schedule a new email with subscription list', function (done) {
    request(app)
      .post('/emails')
      .send({
        subject: 'Test email 1 - {firstname}',
        html: '<h2>test template</h2> <strong>html</strong> with {firstname} and {lastname}',
        from_email_id: 1,
        subscription_list_id: 3,
        scheduled_at: nextHour,
      })
      .expect(201)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('id')
        res.body.should.has.property('subject')
        res.body.should.has.property('html')
        res.body.should.has.property('scheduled_at')
        res.body.should.has.property('from_email_id')
        res.body.should.has.property('subscription_list_id')
        email1 = res.body
        done()
      })
  })

  it('cannot schedule a new email for a past time', function (done) {
    request(app)
      .post('/emails')
      .send({
        subject: 'Test email 1 - {firstname}',
        html: '<h2>test template</h2> <strong>html</strong> with {firstname} and {lastname}',
        from_email_id: 1,
        subscription_list_id: 3,
        scheduled_at: nextHour.clone().subtract(1, 'hour'),
      })
      .expect(400)
      .end(() => {
        done()
      })
  })

  it('cannot send without scheduling a new email with subscription list', function (done) {
    request(app)
      .post('/emails')
      .send({
        subject: 'Test email 1 - {firstname}',
        html: '<h2>test template</h2> <strong>html</strong> with {firstname} and {lastname}',
        from_email_id: 1,
        scheduled_at: nextHour,
      })
      .expect(400)
      .end(() => {
        done()
      })
  })

  it('cannot schedule or send with both user list set and subscription list', function (done) {
    request(app)
      .post('/emails')
      .send({
        subject: 'Test email 1 - {firstname}',
        html: '<h2>test template</h2> <strong>html</strong> with {firstname} and {lastname}',
        from_email_id: 1,
        to_user_uids: awsTestUserIds,
        subscription_list_id: 3,
        scheduled_at: nextHour,
      })
      .expect(400)
      .end(() => {
        done()
      })
  })

  it('cannot schedule or send without one of user list set or subscription list', function (done) {
    request(app)
      .post('/emails')
      .send({
        subject: 'Test email 1 - {firstname}',
        html: '<h2>test template</h2> <strong>html</strong> with {firstname} and {lastname}',
        from_email_id: 1,
        scheduled_at: nextHour,
      })
      .expect(400)
      .end(() => {
        done()
      })
  })

  it('should schedule a new email with array string of users', function (done) {
    request(app)
      .post('/emails')
      .send({
        subject: 'Test email 2 - {firstname}',
        html: '<h2>test template</h2> <strong>html</strong> with {firstname} and {lastname}',
        from_email_id: 1,
        to_user_uids: awsTestUserIds.join(),
        scheduled_at: nextHour,
      })
      .expect(201)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('id')
        res.body.should.has.property('subject')
        res.body.should.has.property('html')
        res.body.should.has.property('to_user_uids')
        res.body.should.has.property('scheduled_at')
        res.body.should.has.property('from_email_id')
        email2 = res.body
        done()
      })
  })

  it('should list all existing emails', function (done) {
    request(app)
      .get('/emails')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('count')
        res.body.should.has.property('results')
        expect(res.body.results).to.be.a('array')
        res.body.results[0].should.has.property('id')
        res.body.results[0].should.has.property('subject')
        res.body.results[0].should.has.property('html')
        res.body.results[0].should.has.property('to_user_uids')
        res.body.results[0].should.has.property('cc_user_uids')
        res.body.results[0].should.has.property('bcc_user_uids')
        res.body.results[0].should.has.property('scheduled_at')
        res.body.results[0].should.has.property('from_email_id')
        res.body.results[0].should.has.property('subscription_list_id')
        res.body.results[0].should.has.property('completed_at')
        res.body.results[0].should.has.property('no_messages')
        done()
      })
  })

  it('should retrieve existing email', function (done) {
    request(app)
      .get(`/emails/${ email1.id }`)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('id')
        res.body.should.has.property('subject')
        res.body.should.has.property('html')
        res.body.should.has.property('to_user_uids')
        res.body.should.has.property('cc_user_uids')
        res.body.should.has.property('bcc_user_uids')
        res.body.should.has.property('scheduled_at')
        res.body.should.has.property('from_email_id')
        res.body.should.has.property('subscription_list_id')
        res.body.should.has.property('completed_at')
        res.body.should.has.property('no_messages')
        done()
      })
  })

  it('should send a new email with array string of users', function (done) {
    this.timeout(10000)
    request(app)
      .post('/emails')
      .send({
        subject: 'Test email 3 - {firstname}',
        html: '<h2>test template</h2> <strong>html</strong> with {firstname} and {lastname}',
        from_email_id: 1,
        to_user_uids: awsTestUserIds.join(),
      })
      .expect(201)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('id')
        res.body.should.has.property('subject')
        res.body.should.has.property('html')
        res.body.should.has.property('from_email_id')
        res.body.should.has.property('to_user_uids')
        email3 = res.body
        const check = () => {
          request(app)
            .get(`/emails/${ email3.id }`)
            .expect(200)
            .end((err, res) => {
              expect(err).to.be.null
              if (res.body.completed_at) {
                done()
              } else {
                setTimeout(function () {
                  check()
                }, 300)
              }
            })
        }
        check()
      })
  })

  it('should get messages created by a completed email', function (done) {
    request(app)
      .get(`/emails/${ email3.id }/messages`)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('count')
        res.body.should.has.property('results')
        expect(res.body.results).to.be.a('array')
        res.body.results[0].should.has.property('id')
        res.body.results[0].should.has.property('ses_id')
        res.body.results[0].should.has.property('to_user_uid')
        expect(res.body.count).to.equal(awsTestUserIds.length)
        done()
      })
  })

  it('should not be able to delete an unscheduled / completed email', function (done) {
    request(app)
      .delete(`/emails/${ email3.id }`)
      .expect(404)
      .end(() => {
        done()
      })
  })

  it('should delete a scheduled but non-completed email', function (done) {
    request(app)
      .delete(`/emails/${ email2.id }`)
      .expect(204)
      .end((err) => {
        expect(err).to.be.null
        request(app)
          .get(`/emails/${ email2.id }`)
          .expect(404)
          .end(() => {
            done()
          })
      })
  })

  it('TODO : should send scheduled emails', function (done) {
    done()
  })

  it('TODO : should udpate status logs', function (done) {
    done()
  })
})
