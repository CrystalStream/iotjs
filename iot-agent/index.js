'use strict'

const EventEmitter = require('events')
const debug = require('debug')('iotjs:agent')
const os = require('os')
const util = require('util')
const mqtt = require('mqtt')
const uuid = require('uuid')
const defaults = require('defaults')
const { parsePayload } = require('./utils')

const options = {
  name: 'untitled',
  username: 'iot',
  interval: 5000,
  mqtt: {
    host: 'mqtt://localhost'
  }
}
class IotAgent extends EventEmitter {

  constructor (opts) {
    super()

    this._options = defaults(opts, options)
    this._started = false
    this._timer = null
    this._client = null
    this._agentId = null
    this._metrics = new Map()
  }

  addMetric(type, fn) {
    this._metrics.set(type, fn)
  }

  removeMetric(type) {
    this._metrics.delete(type)
  }

  connect() {
    if (!this._started) {

      this._started = true
      const opts = this._options
      
      // Initialize the agent and connect it
      this._client = mqtt.connect(opts.mqtt.host)

      // Subscribe to events
      this._client.subscribe('agent/message')
      this._client.subscribe('agent/connected')
      this._client.subscribe('agent/disconnected')

      this._client.on('connect', () => {
        // Set the uuid of the client
        this._agentId = uuid.v4()
        
        this.emit('connected', this._agentId)

        // Init the timer on connect
        this._timer = setInterval(async () => {
          if (this._metrics.size > 0) {
            let message = {
              agent: {
                uuid: this._agentId,
                username: opts.username,
                name: opts.name,
                hostname: os.hostname() || 'localhost',
                pid: process.pid
              }, 
              metrics: [],
              timestamp: new Date().getTime()
            }

            for (let [ metric, fn ] of this._metrics) {
              if (fn.length == 1) { // Callback
                fn = util.promisify(fn) // Transform to promise
              }
  
              message.metrics.push({
                type: metric,
                value: await Promise.resolve(fn())
              })
  
              console.log('Sending', message)
  
              this._client.publish('agent/message', JSON.stringify(message))
              this.emit('message', message)
            }
          }

          this.emit('agent/message', 'this is a message')
        }, opts.interval)
      })

      this._client.on('message', (topic, payload) => {
        payload = parsePayload(payload)

        let broadcast = false

        switch (topic) {
          case 'agent/connected':
          case 'agent/disconnected':
          case 'agent/message':
            broadcast = payload && payload.agent && payload.agent.uuid !== this._agentId
            break
        }

        if (broadcast) {
          this.emit(topic, payload)
        }

      })

      this._client.on('error', () => this.disconnect())
    }
  }

  disconnect() {
    if (this._started) {
      clearInterval(this._timer)
      this._started = false
      this.emit('disconnected', this._agentId)
      this._client.end()
    }
  }

}

module.exports = IotAgent
