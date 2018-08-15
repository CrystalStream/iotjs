'use strict'

const agent = {
  id: 1,
  uuid: 'ddff-eqer-er-werqwerr',
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
  extend(agent, { id: 2, name: 'Mega Test', uuid: 'yyysaf-sdfbd-dfb-dfger', connected: false, username: 'supertest'}),
  extend(agent, { id: 3, uuid: 'sdffferg-erge-erg-eeee', username: 'testing1'}),
  extend(agent, { id: 4, uuid: 'flofpef-werwer-werrf-gvevk', username: 'testing2'})
]

function extend(data, values) {
  const clone = Object.assign({}, data)
  return Object.assign(clone, values)
}

module.exports = {
  single: agent,
  all: agents,
  connected: agents.filter(a => a.connected),
  byUuid: uuid => agents.filter(a => a.uuid === uuid).shift(),
  byId: id => agents.filter(a => a.id === id).shift()
}