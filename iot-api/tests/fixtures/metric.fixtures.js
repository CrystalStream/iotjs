'use strict'

const agentFixtures = require('./agent.fixtures')

const metric = {
  id: 1,
  uuid: '164257af-add7-4eb9-a21b-c543d72bee7c',
  type: 'cpu',
  value: 20,
  agentId: 1,
  createdAt: new Date(),
  updatedAt: new Date()
}

const metrics = [
  metric,
  extend(metric, { id: 2, type: 'heat', uuid: '7f634bd8-a5b4-11e8-98d0-529269fb1459', value: 40 }),
  extend(metric, { id: 3, type: 'ligth', uuid: '9c7547ee-a5b4-11e8-98d0-529269fb1459', value: 50, agentId: 2 }),
  extend(metric, { id: 4, type: 'memory', uuid: 'b9ee1fe4-a5b4-11e8-98d0-529269fb1459', value: 500, agentId: 3 })
]

function extend (data, values) {
  const clone = Object.assign({}, data)
  return Object.assign(clone, values)
}

module.exports = {
  single: metric,
  byAgentUuid: uuid => metrics.filter(m => m.agentId === agentFixtures.byUuid(uuid))
}
