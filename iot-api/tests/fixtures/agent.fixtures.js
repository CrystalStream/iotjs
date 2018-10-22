'use strict'

const agent = {
  id: 1,
  uuid: '4218cdb0-a5b5-11e8-98d0-529269fb1459',
  name: 'fixture',
  username: 'test',
  hotsname: 'host-test',
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

const agents = [
  agent,
  extend(agent, { id: 2, name: 'Mega Test', uuid: '46101d88-a5b5-11e8-98d0-529269fb1459', connected: false, username: 'supertest' }),
  extend(agent, { id: 3, uuid: '4cc9f4c8-a5b5-11e8-98d0-529269fb1459', username: 'testing1' }),
  extend(agent, { id: 4, uuid: '50ab73e6-a5b5-11e8-98d0-529269fb1459', username: 'testing2' })
]

function extend (data, values) {
  const clone = Object.assign({}, data)
  return Object.assign(clone, values)
}

module.exports = {
  single: agent,
  all: agents,
  connected: agents.filter(a => a.connected),
  byUsername: username => agents.filter(a => a.username === username),
  byUuid: uuid => agents.filter(a => a.uuid === uuid).shift(),
  byId: id => agents.filter(a => a.id === id).shift()
}
