import dbConfig from './DatabaseConfig.json'

const configs = {
  default: {
    AWS_CONFIG: {
      AWS_REGION: 'us-east-1',
      EMAIL_SENDER: 'EdLab IT <edlabit@tc.edu>',
    },
    SES_CONFIGURATION_SET: '***REMOVED***',
    SQS_QUEUE_URL: '***REMOVED***/***REMOVED***',
    PAGINATION_LIMIT: 12,
    ENABLE_CRON: false,
    ACCOUNTS_DB: 'sso',
    UNSUBSCRIBE_SECRET: '***REMOVED***',
    UNSUBSCRIBE_ENCRYPTION: 'aes-256-ctr',
  },
  development: {
    ENABLE_DOC: true,
  },
  test: {},
  integration: {},
  production: {
    ENABLE_CRON: true,
    AWS_CONFIG: {
      AWS_REGION: 'us-east-1',
      EMAIL_SENDER: 'TC Library Archive <***REMOVED***@tc.columbia.edu>',
    },
    SES_CONFIGURATION_SET: '***REMOVED***',
    SQS_QUEUE_URL: '***REMOVED***/***REMOVED***',
    ACCOUNTS_DB: 'accounts',
    UNSUBSCRIBE_SECRET: '***REMOVED***',
  },
}
export default (env = process.env.NODE_ENV) => {
  const dbConfigEnv = process.env.USE_DATABASE || env
  const accountsDbConfig = configs.default.ACCOUNTS_DB
  return Object.assign(configs['default'], configs[env], {
    DBCONFIG: dbConfig[dbConfigEnv],
    ACCOUNTS_DBCONFIG: dbConfig[accountsDbConfig],
  })
}