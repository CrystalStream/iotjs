'use strict'

const db = require('./')
const debug = require('debug')('iotjs:iot-db:setup')

async function setup () {
  const config = {
    database: process.env.DB || 'iot',
    username: process.env.DB_USER || 'crystalstream',
    password: process.env.DB_PASS || '',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    setup: true,
    logging: s => debug(s)
  }

  await db(config).catch(handleError)

  console.log('Successfully setup DB')
  process.exit(0)
}

function handleError (error) {
  console.error(error.message)
  console.error(error.stack)
  process.exit(1)
}

setup()
