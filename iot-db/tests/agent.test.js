'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

let db = null

let config = {
  logging: () => {}
}

let MetricStub = {
  belongsTo: sinon.spy()
}

let AgentStub = null

let sandbox = null

test.afterEach(() => {
  sandbox && sinon.restore()
})

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  AgentStub = {
    hasMany: sandbox.spy()
  }

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test('Agent', t => {
  t.truthy(db.Agent, 'Agent service should exists')
})

test.serial('Setup DB', t => {
  t.true(AgentStub.hasMany.called, 'it executes AgentModel.hasMany() function')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'it should be called with the MetricModel')
  t.true(MetricStub.belongsTo.called, 'it executes MetricModel.hasMany() function')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'it should be called with the AgentModel')
})
