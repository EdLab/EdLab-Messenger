import request from 'supertest'
import chai from 'chai'
import app from '../server/app'

describe('Subscription List APIs', function () {
  let subscriptionList1, subscriptionList2, originalLength,
    originalUids, newUids, end

  const expect = chai.expect
  chai.should()

  after(function(done) {
    request(app)
      .put(`/subscription_lists/${ subscriptionList1.id }/subscriptions`)
      .send({
        user_uids: originalUids.join(),
      })
      .expect(201)
      .end((err) => {
        expect(err).to.be.null
        done()
      })
  })

  it('should list all subscription lists', function (done) {
    request(app)
      .get('/subscription_lists')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('count')
        res.body.should.has.property('results')
        expect(res.body.results).to.be.a('array')
        expect(res.body.results.length).to.equal(res.body.count)
        res.body.results[0].should.has.property('name')
        res.body.results[0].should.has.property('description')
        originalLength = res.body.count
        subscriptionList1 = res.body.results[0]
        done()
      })
  })

  it('should list subscriptions of a list', function (done) {
    request(app)
      .get(`/subscription_lists/${ subscriptionList1.id }/subscriptions`)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('count')
        res.body.should.has.property('results')
        expect(res.body.results).to.be.a('array')
        expect(res.body.results.length).to.equal(res.body.count)
        res.body.results[0].should.has.property('user_uid')
        res.body.results[0].should.has.property('subscription_list_id')
        expect(res.body.results[0].subscription_list_id).to.equal(subscriptionList1.id)
        originalUids = res.body.results.map(s => s.user_uid)
        end = Math.floor(Math.random() * originalUids.length)
        newUids = originalUids.slice(0, end)
        done()
      })
  })

  it('should update subscriptions of a list', function (done) {
    request(app)
      .put(`/subscription_lists/${ subscriptionList1.id }/subscriptions`)
      .send({
        user_uids: newUids.join(),
      })
      .expect(201)
      .end((err) => {
        expect(err).to.be.null
        request(app)
          .get(`/subscription_lists/${ subscriptionList1.id }/subscriptions`)
          .expect(200)
          .end((err, res) => {
            expect(err).to.be.null
            expect(res.body).to.be.a('object')
            expect(res.body.count).to.equal(newUids.length)
            expect(res.body.results.length).to.equal(newUids.length)
            done()
          })
      })
  })

  it('should add a subscription to a list', function (done) {
    request(app)
      .post(`/subscription_lists/${ subscriptionList1.id }/subscriptions`)
      .send({
        user_uid: originalUids[newUids.length],
      })
      .expect(201)
      .end((err, res) => {
        expect(err).to.be.null
        res.body.should.has.property('user_uid')
        res.body.should.has.property('subscription_list_id')
        expect(res.body.user_uid).to.equal(originalUids[newUids.length])
        request(app)
          .get(`/subscription_lists/${ subscriptionList1.id }/subscriptions`)
          .expect(200)
          .end((err, res) => {
            expect(err).to.be.null
            expect(res.body).to.be.a('object')
            expect(res.body.count).to.equal(newUids.length + 1)
            expect(res.body.results.length).to.equal(newUids.length + 1)
            const uids = res.body.results.map(s => s.user_uid)
            expect(uids).to.include(originalUids[newUids.length])
            done()
          })
      })
  })

  it('should delete a subscription from a list', function (done) {
    request(app)
      .delete(`/subscription_lists/${ subscriptionList1.id }/subscriptions`)
      .send({
        user_uid: originalUids[newUids.length],
      })
      .expect(204)
      .end((err) => {
        expect(err).to.be.null
        request(app)
          .get(`/subscription_lists/${ subscriptionList1.id }/subscriptions`)
          .expect(200)
          .end((err, res) => {
            expect(err).to.be.null
            expect(res.body).to.be.a('object')
            expect(res.body.count).to.equal(newUids.length)
            expect(res.body.results.length).to.equal(newUids.length)
            const uids = res.body.results.map(s => s.user_uid)
            expect(uids).to.not.include(originalUids[newUids.length])
            done()
          })
      })
  })

  it('should create a new subscription list', function (done) {
    request(app)
      .post('/subscription_lists')
      .send({
        name: 'Test subscription list',
        description: 'This is a test subscription list',
      })
      .expect(201)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('name')
        res.body.should.has.property('description')
        subscriptionList2 = res.body
        done()
      })
  })

  it('should update an existing subscription list', function (done) {
    request(app)
      .put(`/subscription_lists/${ subscriptionList2.id }`)
      .send({
        name: 'Updated name',
      })
      .expect(201)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('name')
        res.body.should.has.property('description')
        expect(res.body.name).to.equal('Updated name')
        done()
      })
  })

  it('should delete an existing subscription list', function (done) {
    request(app)
      .delete(`/subscription_lists/${ subscriptionList2.id }`)
      .expect(204)
      .end((err) => {
        expect(err).to.be.null
        request(app)
          .get('/subscription_lists')
          .expect(200)
          .end((err, res) => {
            expect(err).to.be.null
            expect(res.body.results.length).to.equal(originalLength)
            done()
          })
      })
  })
})
