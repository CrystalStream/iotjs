'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const agentFixtures = require('./fixtures/agent.fixtures')
const metricFixtures = require('./fixtures/metric.fixtures')

let config = {
  logging: () => {}
}

let AgentStub = {
  hasMany: sinon.spy()
}

let MetricStub = null

let sandbox = null

let db = null

let agentUuid = agentFixtures.single.uuid

let uuidArgs = {
  where: {
    agentUuid
  }
}

let byAgentUuidArgs = {
  attributes: [ 'type' ],
  group: [ 'type' ],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid: agentUuid
    }
  }],
  raw: true
}

let singleMetric = {
  uuid: 'f132a0aa-a5b5-11e8-98d0-529269fb1459',
  type: 'monitor time',
  value: 100,
  agentId: agentFixtures.single.id,
  createdAt: new Date(),
  updatedAt: new Date()
}


test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  MetricStub = {
    belongsTo: sandbox.spy()
  }

  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.single))

  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(singleMetric)
    .returns(Promise.resolve({
      toJSON () { return metricFixtures.single }
    }))

  MetricStub.findAll = sandbox.stub()
  MetricStub.findAll.withArgs(byAgentUuidArgs)
    .returns(Promise.resolve(metricFixtures.byAgentUuid(agentUuid)))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test('Metric', t => {
  t.truthy(db.Metric, 'Metric service should exists')
})

test.serial('Metric#create', async (t) => {
  let metric = await db.Metric.create(agentUuid, singleMetric)
  t.true(AgentStub.findOne.called, 'it calls findOne on the Agent model')
  t.true(AgentStub.findOne.calledOnce, 'it calls findOne on the Agent model only once')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'it calls findOne on the Agent model with the correct params')
  t.true(MetricStub.create.called, 'it calls create on the Metric model')
  t.true(MetricStub.create.calledWith(singleMetric), 'it calls create on the Metric model with the correct params')
  t.deepEqual(metric, metricFixtures.single, 'Object should be equal')
})

test.serial('Metric#findbyAgentUuid', async (t) => {
  let metric = await db.Metric.findbyAgentUuid(agentUuid)
  t.true(MetricStub.findAll.called, 'it calls create on the Metric model')
  t.true(MetricStub.findAll.calledWith(byAgentUuidArgs), 'it calls create on the Metric model with the correct params')
  t.deepEqual(metric, metricFixtures.byAgentUuid(agentUuid), 'Object should be equal')
})

// test.serial('Metric#findByTypeAgentUuid', async (t) => {
//   let metric = await db.Metric.findByTypeAgentUuid(agentUuid)
//   t.true(MetricStub.findAll.called, 'it calls create on the Metric model')
//   t.true(MetricStub.findAll.calledWith(byAgentUuidArgs), 'it calls create on the Metric model with the correct params')
//   t.deepEqual(metric, metricFixtures.byAgentUuid(agentUuid), 'Object should be equal')
// })
