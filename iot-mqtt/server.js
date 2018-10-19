const debug = require('debug')('Iot:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('iot-db')

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

let Agent, Metric

// on client connected callback
server.on('clientConnected', client => {
  console.log(`Client Connected: ${client.id}`)
})

// on client disconnected callback
server.on('clientDisconnected', client => {
  console.log(`Client Disconnected: ${client.id}`)
})

// on message callback
server.on('published', (packet, client) => {
  console.log(`Recieved: ${packet.topic}`)
  console.log(`Paylod: ${packet.payload}`)
})

server.on('ready', async () => {
  const services = await db(dbConfig).catch(handleFatalError)

  Agent = services.Agent
  Metric = services.Metric

  console.log(`${chalk.green('[iot-mqtt]')} Server running`)
})

server.on('error', handleFatalError)

function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal Error]')}: ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

// Handle Exception
process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
