import { join } from 'path'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import express from 'express'
import { json } from 'body-parser'

const env = process.env.NODE_ENV || 'development'
import { init, Handlers } from '@sentry/node'

import publicConfig from './config/app_config'
import privateConfig from './config/app_config_private'
import { version } from './jenkins.json'
const localConfig = require('dotenv').config()

global.AppConfig = Object.assign(
  {},
  publicConfig(env),
  privateConfig(env),
  localConfig.parsed)

// global.Constants = require('./config/constants')
global.Logger = require('./lib/Logger').default('logs/events.log')
global.Utility = require('./lib/Utility')
global.Response = require('./lib/Response')

AppConfig.env = env
AppConfig.isDevelopment = env === 'development'
AppConfig.isProduction = env === 'production' || env === 'integration'
AppConfig.isTesting = env === 'test'
AppConfig.appVersion = version

const app = express()
app.locals.AppConfig = AppConfig
app.locals.appVersion = version
app.locals.appVersionHash = Buffer.from(`MESSENGER_VERSION:${ version }`).toString('hex')

app.set('trust proxy', ['loopback', 'uniquelocal', '172.30.0.0/16'])
app.use(helmet({ frameguard: false }))
app.use(cors({
  origin: [
    AppConfig.ALLOW_ORIGIN,
    /\.tc\.columbia\.edu$/,
    /\.tc-***REMOVED***\.org$/,
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin'],
}))
if (AppConfig.ENABLE_SENTRY_IO) {
  // TODO: Check settings for this
  init({
    dsn: 'https://f055399a01934eeabe6cdd070bff7385@sentry.io/1304217',
    release: version,
    environment: env,
    attachStacktrace: true,
  })
  app.use(Handlers.requestHandler())
}
if (AppConfig.isProduction) {
  app.use(morgan('combined'))
} else if (!AppConfig.isTesting) {
  app.use(morgan('dev'))
}
// Database and Models
global.SequelizeInst = require('./lib/Database').default(AppConfig.DBCONFIG)
Object.assign(global, require('./models').default)
// SequelizeInst.sync()

// Cron Tasks and Sitemap
const CronTasks = require('./lib/Cron').start()
Logger.info(`CronTasks: ${ CronTasks.length } tasks scheduled`)

if (AppConfig.ENABLE_DOC) {
  app.use('/docs', express.static(join(__dirname, '..', 'docs')))
}

// Regular Routes
app.use(json({ limit: AppConfig.HTTP_BODY_LIMIT }))
app.use(require('./routes').default)

if (AppConfig.ENABLE_SENTRY_IO) { app.use(Handlers.errorHandler()) }
app.use(() => {
  const error = new Error('Resource Not Found')
  error.status = 404
  throw error
})
app.use(require('./routes/error').default)

export default app
