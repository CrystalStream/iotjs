'use strict'

const debug = require('debug')('Iot:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('iot-db')
const { parsePayload } = require('./utils')

// backend for the mqtt server
const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}

// Settings for the mqtt server
const settings = {
  port: 1883,
  backend
}

// Database configuration
const dbConfig = {
  database: process.env.DB || 'iot',
  username: process.env.DB_USER || 'crystalstream',
  password: process.env.DB_PASS || '',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: s => debug(s)
}

const server = new mosca.Server(settings)
const clients = new Map()

let Agent, Metric

// on client connected callback
server.on('clientConnected', client => {
  console.log(`Client Connected: ${client.id}`)
  clients.set(client.id, null)
})

// on client disconnected callback
server.on('clientDisconnected', async (client) => {
  console.log(`Client Disconnected: ${client.id}`)

  const agent = clients.get(client.id)

  if (agent) {
    agent.connected = false

    try {
      await Agent.createOrUpdate(agent)
    } catch (error) {
      return handleError(error)
    }

    // Remove agent from Client list
    clients.delete(client.id)

    server.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        uuid: agent.uuid
      })
    })

    console.log(`Client ${client.id} associated to Agent ${agent.uuid} was disconnected`)
  }
})

// on message callback
server.on('published', async (packet, client) => {
  console.log(`Recieved: ${packet.topic}`)

  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected':
      console.log(`Paylod: ${packet.payload}`)
      break
    case 'agent/message':
      const payload = parsePayload(packet.payload)

      if (payload) {
        console.log('payload', payload)
        payload.agent.connected = true

        let agent

        try {
          agent = await Agent.createOrUpdate(payload.agent)
          console.log('TCL: agent', agent);
        } catch (error) {
          return handleError(error)
        }

        console.log(`Agent ${agent.uuid} saved`)

        // Notify agent is connected
        if (!clients.get(agent.id)) {
          clients.set(agent.id, agent)
          server.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          })
        }

        for (let metric of payload.metrics) {
          let m

          try {
            m = await Metric.create(agent.uuid, metric)
          } catch (error) {
            return handleError(error)
          }

          console.log(`Metric ${m.id} save on agent ${agent.uuid}`)
        }
      }

      break
  }

  console.log(`Paylod: ${packet.payload}`)
})

server.on('ready', async () => {
  const services = await db(dbConfig).catch(handleFatalError)

  Agent = services.Agent
  Metric = services.Metric

  console.log(`${chalk.green('[iot-mqtt]')} Server running`)
})

server.on('error', handleFatalError)

function handleError (err) {
  console.error(`${chalk.red('[Fatal Error]')}: ${err.message}`)
  console.error(err.stack)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal Error]')}: ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

// Handle Exception
process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
