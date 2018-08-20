'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const agentFixtures = require('./fixtures/agent.fixtures')

let single = Object.assign({}, agentFixtures.single)
let id = single.id
let uuid = single.uuid
let db = null

let uuidArgs = {
  where: {
    uuid
  }
}

let connectedArgs = {
  where: {
    connected: true
  }
}

let usernameArgs = {
  where: {
    connected: true,
    username: 'testing1'
  }
}

let newAgent = {
  uuid: '1ffwe2-23gfge-ger34-ger2313',
  name: 'newAgent',
  username: 'newAgent',
  hotsname: 'Host-test-agent-new',
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

let newAgentArgs = {
  where: {
    uuid: newAgent.uuid
  }
}

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

  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))

  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON () { return newAgent }
  }))

  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))
  AgentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.byUsername(usernameArgs.where.username)))

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

test.serial('Agent#findById', async (t) => {
  let agent = await db.Agent.findById(id)
  t.true(AgentStub.findById.called, 'it calls findById on the model')
  t.true(AgentStub.findById.calledOnce, 'it calls findById on the model only once')
  t.true(AgentStub.findById.calledWith(id), 'it calls findById specific id')
  t.deepEqual(agent, agentFixtures.byId(id), 'It return the element that match the given id')
})

test.serial('Agent#findByUuid', async (t) => {
  let agent = await db.Agent.findByUuid(uuid)
  t.true(AgentStub.findOne.called, 'it calls findOne on the model')
  t.true(AgentStub.findOne.calledOnce, 'it calls findOne on the model only once')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'it calls findOne specific id')
  t.deepEqual(agent, agentFixtures.byUuid(uuid), 'It return the element that match the given uuid')
})

test.serial('Agent#findAll', async (t) => {
  let agents = await db.Agent.findAll()
  t.true(AgentStub.findAll.called, 'it calls findAll on the model')
  t.true(AgentStub.findAll.calledOnce, 'it calls findAll on the model only once')
  t.true(AgentStub.findAll.calledWith(), 'it calls findAll with no criteria')
  t.deepEqual(agents, agentFixtures.all, 'It return the elements that match the given criteria')
})

test.serial('Agent#findConnected', async (t) => {
  let agents = await db.Agent.findConnected()
  t.true(AgentStub.findAll.called, 'it calls findAll on the model')
  t.true(AgentStub.findAll.calledOnce, 'it calls findAll on the model only once')
  t.true(AgentStub.findAll.calledWith(connectedArgs), 'it calls findAll with the given criteria')
  t.deepEqual(agents, agentFixtures.connected, 'It return the elements that match the given criteria')
})

test.serial('Agent#findByUsername', async (t) => {
  let agents = await db.Agent.findByUsername(usernameArgs.where.username)
  t.true(AgentStub.findAll.called, 'it calls findAll on the model')
  t.true(AgentStub.findAll.calledOnce, 'it calls findAll on the model only once')
  t.true(AgentStub.findAll.calledWith(usernameArgs), 'it calls findAll with the given criteria')
  t.deepEqual(agents, agentFixtures.byUsername(usernameArgs.where.username), 'It return the elements that match the given criteria')
})

test.serial('Agent#createOrUpdate - exists', async (t) => {
  let agent = await db.Agent.createOrUpdate(single)

  t.true(AgentStub.findOne.called, 'it calls findOne on the model')
  t.true(AgentStub.findOne.calledTwice, 'it calls findOne on the model twice')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'it calls findOne specific params')
  t.true(AgentStub.update.called, 'it calls update on the model')
  t.true(AgentStub.update.calledOnce, 'it calls update on the model only once')
  t.true(AgentStub.update.calledWith(single, uuidArgs), 'it calls update specific params')

  t.deepEqual(agent, single, 'should return the existing agent')
})

test.serial('Agent#createOrUpdate - new', async (t) => {
  let agent = await db.Agent.createOrUpdate(newAgent)

  t.true(AgentStub.findOne.called, 'it calls findOne on the model')
  t.true(AgentStub.findOne.calledOnce, 'it calls findOne on the model twice')
  t.true(AgentStub.findOne.calledWith(newAgentArgs), 'it calls findOne specific params')
  t.true(AgentStub.create.called, 'it calls create on the model')
  t.true(AgentStub.create.calledOnce, 'it calls create on the model only once')
  t.true(AgentStub.create.calledWith(newAgent), 'it calls create specific params')

  t.deepEqual(agent, newAgent, 'should return the newly agent')
})
