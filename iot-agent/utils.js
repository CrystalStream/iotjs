'use strict'

function parsePayload (payload) {
  console.log('TCL: parsePayload -> payload', payload);
  if (payload instanceof Buffer) {
    payload = payload.toString('utf8')
  }

  try {
    payload = JSON.parse(payload)
  } catch (error) {
    console.log('[error]', error)
    payload = null
  }

  return payload
}

module.exports = {
  parsePayload
}
