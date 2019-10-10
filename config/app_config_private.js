const {
  AWS_REGION = 'us-east-1',
  SES_CONFIGURATION_SET,
  SQS_QUEUE_URL,
  ACCOUNTS_DB,
  UNSUBSCRIBE_SECRET,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  DB_HOST,
  ACCOUNTS_DB_USERNAME,
  ACCOUNTS_DB_PASSWORD,
  ACCOUNTS_DB_DATABASE,
  ACCOUNTS_DB_HOST,
  BASIC_AUTH_USER,
  BASIC_AUTH_PWD,
  SLACK_NOTIFIER_API,
} = process.env

const configs = {
  default: {
    AWS_CONFIG: {
      AWS_REGION: AWS_REGION,
      EMAIL_SENDER: 'EdLab IT <edlabit@tc.edu>',
    },
    PAGINATION_LIMIT: 12,
    UNSUBSCRIBE_ENCRYPTION: 'aes-256-ctr',
    SES_CONFIGURATION_SET: SES_CONFIGURATION_SET,
    SQS_QUEUE_URL: SQS_QUEUE_URL,
    ACCOUNTS_DB: ACCOUNTS_DB,
    UNSUBSCRIBE_SECRET: UNSUBSCRIBE_SECRET,
    DBCONFIG: {
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_DATABASE,
      host: DB_HOST,
      dialect: 'mysql',
    },
    ACCOUNTS_DBCONFIG: {
      username: ACCOUNTS_DB_USERNAME,
      password: ACCOUNTS_DB_PASSWORD,
      database: ACCOUNTS_DB_DATABASE,
      host: ACCOUNTS_DB_HOST,
      dialect: 'mysql',
    },
    BASIC_AUTH_USERS: {
      [BASIC_AUTH_USER]: BASIC_AUTH_PWD,
    },
    SLACK_NOTIFIER_API: SLACK_NOTIFIER_API,
    ENABLE_DOC: true,
  },
  development: {
    ACCOUNTS_DB: 'sso',
  },
  test: {
    ACCOUNTS_DB: 'sso',
  },
  integration: {
    ACCOUNTS_DB: 'sso',
  },
  production: {
    AWS_CONFIG: {
      AWS_REGION: AWS_REGION,
      EMAIL_SENDER: 'TC Library <library@tc.columbia.edu>',
    },
  },
}
export default (env = process.env.NODE_ENV) => {
  return Object.assign(configs['default'], configs[env])
}