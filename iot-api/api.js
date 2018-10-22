'use strict'

const debug = require('debug')('iot:routes')
const express = require('express')
const asyncify = require('express-asyncify')
const db = require('iot-db')

const config = require('./config')

const api = asyncify(express.Router())

let services, Agent, Metric

api.use('*', async (req, res, next) => {
  if (!services) {
    debug('Connecting with database')
    try {
      services = await db(config.db)

      Agent = services.Agent
      Metric = services.Metric
    } catch (error) {
      return next(error)
    }
  }
  next()
})

api.get('/agents', async (req, res, next) => {
  debug(`Request to /agents`)

  let agents = []

  try {
    agents = await Agent.findConnected()
  } catch (error) {
    return next(error)
  }
  res.send(agents)
})

api.get('/agents/:uuid', async (req, res, next) => {
  const { uuid } = req.params

  debug(`Request to /agents/${uuid}`)

  let agent
  try {
    agent = await Agent.findByUuid(uuid)
  } catch (error) {
    return next(error)
  }

  if (!agent) {
    return next(new Error(`Agent not found with uuid ${uuid}`))
  }

  res.send(agent)
})

api.get('/metrics/:uuid', async (req, res, next) => {
  const { uuid } = req.params

  debug(`Request to /metrics/${uuid}`)

  let metrics = []

  try {
    metrics = await Metric.findbyAgentUuid(uuid)
  } catch (error) {
    return next(error)
  }

  if (!metrics || !metrics.length) {
    return next(new Error(`Metrics not found for agent with ${uuid}`))
  }
  res.send(metrics)
})

api.get('/metrics/:uuid/:type', async (req, res, next) => {
  const { uuid, type } = req.params
  debug(`Request to /metrics/${uuid}/${type}`)

  let metrics = []

  try {
    metrics = await Metric.findByTypeAgentUuid(type, uuid)
  } catch (error) {
    return next(error)
  }

  if (!metrics || !metrics.length) {
    return next(new Error(`Metrics not found for agent with ${uuid}`))
  }

  res.send(metrics)
})

module.exports = api
