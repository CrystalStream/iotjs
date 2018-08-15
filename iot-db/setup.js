'use strict'

const db = require('./')
const debug = require('debug')('iotjs:iot-db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')

const prompt = inquirer.createPromptModule()

async function setup () {
  const answer = await prompt([{
    type: 'confirm',
    name: 'setup',
    message: 'This will destroy all the Database, are you sure to continue?',
    default: false
  }])

  if (!answer.setup) {
    return console.log(chalk.red('Setup script Canceled'))
  }

  console.log(chalk.blue('RUNNING SETUP FOR DATABASE'))

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
  console.error(`${chalk.red('[FATAL ERROR]')} ${error.message}`)
  console.error(error.stack)
  process.exit(1)
}

setup()
