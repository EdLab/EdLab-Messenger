import request from 'supertest'
import chai from 'chai'
import app from '../server/app'

describe('Template APIs', function () {
  let template1, template2, template3

  const expect = chai.expect
  chai.should()

  after(function(done) {
    request(app)
      .delete(`/templates/${ template1.id }`)
      .end(() => {
        done()
      })
  })

  it('should create a new template', function (done) {
    request(app)
      .post('/templates')
      .send({
        name: 'Test template 1',
        html: '<h2>test template</h2> <strong>html</strong> with {variable1} and {variable2}',
        fields: 'variable1,variable2',
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
        template1 = res.body
        done()
      })
  })

  it('should get a list of templates', function (done) {
    request(app)
      .get('/templates')
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body.results).to.be.a('array')
        res.body.results[0].should.has.property('id')
        res.body.results[0].should.has.property('subject')
        res.body.results[0].should.has.property('html')
        res.body.results[0].should.has.property('description')
        res.body.results[0].should.has.property('name')
        res.body.results[0].should.has.property('fields')
        done()
      })
  })

  it('should get a template', function (done) {
    request(app)
      .get(`/templates/${ template1.id }`)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res.body).to.be.a('object')
        res.body.should.has.property('id')
        res.body.should.has.property('subject')
        res.body.should.has.property('html')
        res.body.should.has.property('description')
        res.body.should.has.property('name')
        res.body.should.has.property('fields')
        done()
      })
  })

  it('should update a template', function (done) {
    const newName = 'Test template 1 - updated'
    request(app)
      .put(`/templates/${ template1.id }`)
      .send({
        name: newName,
      })
      .expect(201)
      .end((err, res) => {
        expect(err).to.be.null
        request(app)
          .get(`/templates/${ template1.id }`)
          .expect(200)
          .end((err, _res) => {
            expect(err).to.be.null
            expect(res.body).to.be.a('object')
            res.body.should.has.property('id')
            res.body.should.has.property('subject')
            res.body.should.has.property('html')
            res.body.should.has.property('description')
            res.body.should.has.property('name')
            res.body.should.has.property('fields')
            res.body.name.should.equal(newName)
            done()
          })
      })
  })

  it('should delete a template', function (done) {
    request(app)
      .delete(`/templates/${ template1.id }`)
      .expect(204)
      .end((err, _res) => {
        expect(err).to.be.null
        request(app)
          .get(`/templates/${ template1.id }`)
          .expect(404)
          .end((err, _res) => {
            expect(err).to.not.be.null
            done()
          })
      })
  })
})
