require('@babel/register')

const env = process.env.NODE_ENV || 'development'

const axios = require('axios')

require('dotenv-safe').config()
const publicConfig = require('../../config/app_config')
const privateConfig = require('../../config/app_config_private')

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
Process
  .findOne({
    where: {
      name: 'updateStatusLogs',
    },
  })
  .then(process => {
    if (!process || !process.is_running) {
      return process
        .update({ is_running: true })
        .then(() => StatusLog.updateStatuses())
        .finally(() => process.update({ is_running: false }))
    }
    Logger.debug('Update status logs process skipped as it is already running')
  })
  .then(() => {
    console.log('DONE')
  })
  .catch(err => {
    console.log(err)
    const end = new Date()
    const duration = (end.getTime() - start.getTime()) / 1000
    return axios
      .post(AppConfig.SLACK_NOTIFIER_API, {
        text: `MESSENGER: Update status logs script completed with errors at ${ end } (Run time: ${ duration } seconds)\n${ err }`,
      })
  })
  .finally(() => {
    process.exit()
  })
