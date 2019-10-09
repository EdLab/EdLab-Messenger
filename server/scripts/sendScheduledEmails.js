require('@babel/register')

const env = process.env.NODE_ENV || 'development'

const axios = require('axios')

require('dotenv-safe').config()
const publicConfig = require('../../config/app_config')
const privateConfig = require('../../config/app_config_private')

const {
  SLACK_NOTIFIER_API,
} = process.env

global.AppConfig = Object.assign(
  {},
  publicConfig.default(env),
  privateConfig.default(env)
)

global.Logger = require('../lib/Logger').default('logs/events.log')
global.Utility = require('../lib/Utility')
global.Response = require('../lib/Response')

global.SequelizeInst = require('../lib/Database').default(AppConfig.DBCONFIG)
global.AccountsSequelizeInst = require('../lib/Database').default(AppConfig.ACCOUNTS_DBCONFIG)
Object.assign(global, require('../models').default)

const start = new Date()
axios
  .post(SLACK_NOTIFIER_API, {
    text: `MESSENGER: Send scheduled emails script started at ${ start }`,
  })
  .then(() => {
    return Process
      .findOne({
        where: {
          name: 'sendScheduledEmails',
        },
      })
  })
  .then(process => {
    if (!process || !process.is_running) {
      return process
        .update({ is_running: true })
        .then(() => Email.sendScheduledEmails())
        .finally(() => process.update({ is_running: false }))
    }
    console.log('Send scheduled emails process skipped as it is already running')
    return Promise.resolve()
  })
  .then(() => {
    console.log('DONE')
    const end = new Date()
    const duration = (end.getTime() - start.getTime()) / 1000
    return axios
      .post(SLACK_NOTIFIER_API, {
        text: `MESSENGER: Send scheduled emails script completed at ${ end } (Run time: ${ duration } seconds)`,
      })
      .catch(() => {
        process.exit()
      })
  })
  .catch(err => {
    console.log(err)
    const end = new Date()
    const duration = (end.getTime() - start.getTime()) / 1000
    return axios
      .post(SLACK_NOTIFIER_API, {
        text: `MESSENGER: Send scheduled emails script completed with errors at ${ end } (Run time: ${ duration } seconds)\n${ err }`,
      })
      .catch(() => {
        process.exit()
      })
  })
  .then(() => {
    process.exit()
  })
