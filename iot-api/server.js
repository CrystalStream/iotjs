'use strict'

const http = require('http')
const express = require('express')
const chalk = require('chalk')
const debug = require('debug')('iot:api:server')

const api = require('./api')

const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)

app.use('/api', api)

// Error handler
app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)

  if (err.message.match(/not found/)) {
    return res.status(404).send({ error: err.message })
  }
  
  res.status(500).send({ error: err.message })
})

function handleError (err) {
  console.error(`${chalk.red('[Fatal Error]')}: ${err.message}`)
  console.error(err.stack)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal Error]')}: ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

if (!module.parent) { // launch the server only if is not require('./server.js')

  // Handle Exception
  process.on('uncaughtException', handleFatalError)
  process.on('unhandledRejection', handleFatalError)


  server.listen(port, () => {
    console.log(`${chalk.green('Server up and runnig')}`)
  })
}

module.exports = server
