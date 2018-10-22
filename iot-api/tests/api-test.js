'use strict'

const test = require('ava')
const request = require('supertest')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const agentFixtures = require('./fixtures/agent.fixtures')

let sandbox = null
let server = null
let dbStub = null
let AgentStub = {}
let MetricStub = {}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  dbStub = sandbox.stub()
  dbStub.returns(Promise.resolve({
    Agent: AgentStub,
    Metric: MetricStub
  }))

  AgentStub.findConnected = sandbox.stub()
  AgentStub.findConnected.returns(Promise.resolve(agentFixtures.connected))

  // Proxy the require for the db stub
  const api = proxyquire('../api', {
    'iot-db': dbStub
  })

  // Proxy the api require for the api object
  server = proxyquire('../', {
    './api': api
  })
})

test.afterEach(async () => {
  sandbox && sinon.restore()
})

test.serial.cb('/api/agents', t => {
  request(server)
    .get('/api/agents')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(agentFixtures.connected)
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

// TODO

test.serial('/api/agent/:uuid')
test.serial('/api/agent/:uuid - not found')

test.serial('/api/metric/:uuid')
test.serial('/api/metric/:uuid - not found')

test.serial('/api/metric/:uuid/:type')
test.serial('/api/metric/:uuid/:type - not found')

