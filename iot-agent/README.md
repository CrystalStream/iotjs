# Iot Agent



```js
const IotAgent = require('iot-agent')

const agent = new IotAgent({
  name: 'myapp',
  username: 'admin',
  interval: 2000
})

agent.addMetric('rss', function getRss() {
  return process.memoryUsage().rss
})

agent.addMetric('asyncMetric', function getRandomNumber() {
  return Promise.resolve(Math.random())
})

agent.addMetric('callbackMetric', function getRandomNumberCallback(callback) {
  setTimeout(() => {
    callback(null, Math.random())
  }, 1000)
})



agent.connect()

// This agent only
agent.on('connected', handler)
agent.on('disconnect', handler)
agent.on('message', handler)

// All other agents
agent.on('agent/connected', handler)
agent.on('agent/disconnected', handler)
agent.on('agent/message', payload => {
  // use payload here
})

setTimeout(() => agent.disconnect(), 20000)
```