import { join } from 'path'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import express from 'express'
import { json } from 'body-parser'

const env = process.env.NODE_ENV || 'development'

require('dotenv-safe').config()
const publicConfig = require('../../config/app_config')
const privateConfig = require('../../config/app_config_private')
const { version } = require('../package.json')

global.AppConfig = Object.assign(
  {},
  publicConfig(env),
  privateConfig(env))

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

app.set('view engine', 'ejs')
app.set('trust proxy', ['loopback', 'uniquelocal', '172.30.0.0/16'])
app.set('views', './server/views')
app.use(helmet({ frameguard: false }))
app.use(cors({
  origin: [
    AppConfig.ALLOW_ORIGIN,
    /\.tc\.columbia\.edu$/,
    /\.tc-library\.org$/,
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin'],
}))

if (AppConfig.isProduction) {
  app.use(morgan('combined'))
} else if (!AppConfig.isTesting) {
  app.use(morgan('dev'))
}
// Database and Models
global.SequelizeInst = require('./lib/Database').default(AppConfig.DBCONFIG)
global.AccountsSequelizeInst = require('./lib/Database').default(AppConfig.ACCOUNTS_DBCONFIG)
Object.assign(global, require('./models').default)
// SequelizeInst.sync()

if (AppConfig.ENABLE_DOC) {
  app.use('/docs', express.static(join(__dirname, '..', 'docs')))
}

// Regular Routes
app.use(json({ limit: AppConfig.HTTP_BODY_LIMIT }))
app.use(require('./routes').default)

app.use(() => {
  const error = new Error('Resource Not Found')
  error.status = 404
  throw error
})
app.use(require('./routes/error').default)

export default app
