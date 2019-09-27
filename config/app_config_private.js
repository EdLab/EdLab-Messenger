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
    ACCOUNTS_DB: 'sso',
  },
  test: {
    ACCOUNTS_DB: 'sso',
  },
  integration: {
    ACCOUNTS_DB: 'sso',
  },
  production: {
    ENABLE_DOC: true,
    ENABLE_CRON: true,
    AWS_CONFIG: {
      AWS_REGION: 'us-east-1',
      EMAIL_SENDER: 'TC Library Archive <library@tc.columbia.edu>',
    },
    SES_CONFIGURATION_SET: 'messenger',
    SQS_QUEUE_URL: '***REMOVED***',
    ACCOUNTS_DB: 'accounts',
    UNSUBSCRIBE_SECRET: '***REMOVED***',
  },
}
export default (env = process.env.NODE_ENV) => {
  const dbConfigEnv = process.env.USE_DATABASE || env
  const accountsDbConfig = configs[env].ACCOUNTS_DB
  return Object.assign(configs['default'], configs[env], {
    DBCONFIG: dbConfig[dbConfigEnv],
    ACCOUNTS_DBCONFIG: dbConfig[accountsDbConfig],
  })
}