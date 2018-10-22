'use strict'

const debug = require('debug')('iotjs:api:db')

module.exports = {
  db: {
    database: process.env.DB || 'iot',
    username: process.env.DB_USER || 'crystalstream',
    password: process.env.DB_PASS || '',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s)
  }
}
